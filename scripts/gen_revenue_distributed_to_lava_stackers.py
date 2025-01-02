import json
from typing import Dict, List
from datetime import datetime
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
import requests

from run_lavad_command import run_lavad_command
from get_usd_value_from_token import process_token_array

def get_all_validators() -> List[str]:
    """Get list of all validators"""
    validators_data = run_lavad_command("lavad q staking validators")
    if not validators_data:
        return []
    return [val["operator_address"] for val in validators_data["validators"]]

def get_validator_rewards(validator_address: str) -> Dict:
    """Get validator rewards from distribution info and outstanding rewards"""
    tokens = []
    
    # Get self-bond rewards
    dist_info = run_lavad_command(f"lavad q distribution validator-distribution-info {validator_address}")
    if dist_info and "self_bond_rewards" in dist_info:
        for reward in dist_info["self_bond_rewards"]:
            tokens.append({
                "amount": reward["amount"],
                "denom": reward["denom"]
            })
    
    # Get outstanding rewards
    outstanding = run_lavad_command(f"lavad q distribution validator-outstanding-rewards {validator_address}")
    if outstanding and "rewards" in outstanding:
        for reward in outstanding["rewards"]:
            tokens.append({
                "amount": reward["amount"],
                "denom": reward["denom"]
            })
    
    return process_token_array(tokens)

def get_validator_delegator_rewards(validator_address: str) -> Dict:
    """Get rewards for all delegators of a validator"""
    tokens = []
    
    # Get list of delegators
    delegators = run_lavad_command(f"lavad query staking delegations-to {validator_address}")
    if not delegators or "delegation_responses" not in delegators:
        return {"total_usd": 0, "tokens": []}
    
    # Process each delegator
    for delegation in delegators["delegation_responses"]:
        delegator_addr = delegation["delegation"]["delegator_address"]
        rewards = run_lavad_command(f"lavad query distribution rewards {delegator_addr} {validator_address}")
        
        if rewards and "rewards" in rewards:
            for reward in rewards["rewards"]:
                for coin in reward.get("reward", []):
                    tokens.append({
                        "amount": coin["amount"],
                        "denom": coin["denom"],
                        "delegator": delegator_addr
                    })
    
    return process_token_array(tokens)

def get_provider_rewards(provider_address: str) -> Dict:
    """Get provider rewards using recommended block height"""
    initial = run_lavad_command(f"lavad q subscription estimated-provider-rewards {provider_address}")
    if not initial or "recommended_block" not in initial:
        # change thigs like this to descpritve exceptions:
        return {"total_usd": 0, "tokens": []}
    
    # Get rewards at recommended block height minus 1
    block_height = int(initial["recommended_block"]) - 1
    response = run_lavad_command(
        f"lavad q subscription estimated-provider-rewards {provider_address} --height {block_height}"
    )
    
    tokens = []
    if response:
        rewards = response.get("rewards", [])
        for reward in rewards:
            tokens.append({
                "amount": reward["amount"],
                "denom": reward["denom"]
            })
    
    return process_token_array(tokens)

def get_provider_delegator_rewards(provider_address: str) -> Dict:
    """Get rewards for all delegators of a provider"""
    tokens = []
    
    # Get list of delegators
    delegators = run_lavad_command(f"lavad query dualstaking provider-delegators {provider_address}")
    if not delegators or "delegations" not in delegators:
        return {"total_usd": 0, "tokens": []}
    
    # Process each delegator
    for delegation in delegators["delegations"]:
        delegator = delegation["delegator"]
        
        # Get initial response for block height
        initial = run_lavad_command(
            f"lavad q subscription estimated-provider-rewards {provider_address} {delegator}"
        )
        
        if initial and "recommended_block" in initial:
            block_height = int(initial["recommended_block"]) - 1
            response = run_lavad_command(
                f"lavad q subscription estimated-provider-rewards {provider_address} {delegator} --height {block_height}"
            )
            
            if response and "rewards" in response:
                for reward in response["rewards"]:
                    tokens.append({
                        "amount": reward["amount"],
                        "denom": reward["denom"],
                        "delegator": delegator
                    })
    
    return process_token_array(tokens)

def get_providers() -> List[Dict]:
    """Get list of all providers"""
    try:
        response = requests.get("https://jsinfo.mainnet.lavanet.xyz/providers")
        data = response.json()
        return [{"address": addr} for addr in data.get("providers", [])]
    except Exception as e:
        print(f"Error fetching providers: {e}")
        return []

def main():
    results = {
        "generated_at": datetime.now().isoformat(),
        "validators": [],
        "providers": []
    }
    
    # Process validators
    validators = get_all_validators()
    print(f"\nProcessing {len(validators)} validators...")
    
    for validator in tqdm(validators, desc="Validators"):
        validator_rewards = get_validator_rewards(validator)
        delegator_rewards = get_validator_delegator_rewards(validator)
        
        results["validators"].append({
            "address": validator,
            "rewards": validator_rewards,
            "delegator_rewards": delegator_rewards
        })
    
    # Process providers
    providers = get_providers()
    print(f"\nProcessing {len(providers)} providers...")
    
    for provider in tqdm(providers, desc="Providers"):
        provider_addr = provider["address"]
        provider_rewards = get_provider_rewards(provider_addr)
        delegator_rewards = get_provider_delegator_rewards(provider_addr)
        
        results["providers"].append({
            "address": provider_addr,
            "rewards": provider_rewards,
            "delegator_rewards": delegator_rewards
        })
    
    # Save results
    filename = f"all_rewards_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {filename}")

if __name__ == "__main__":
    main()
