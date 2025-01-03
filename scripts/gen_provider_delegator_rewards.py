import json
from typing import Dict, List, Optional, TypedDict, Any
from run_lavad_command import run_lavad_command
from get_usd_value_from_token import process_token_array
from multiprocessing import Pool, cpu_count, Value, Lock
from ctypes import c_int
from jsinfobe_fetch import jsinfobe_get_providers
from utils import save_json

class Amount(TypedDict):
    denom: str
    amount: str

class Delegation(TypedDict):
    provider: str
    delegator: str
    amount: Amount
    timestamp: str
    credit: Amount
    credit_timestamp: str

class DelegationsResponse(TypedDict):
    delegations: List[Delegation]

class RewardToken(TypedDict):
    amount: str
    denom: str
    delegator: str
    staked_amount: str
    staked_denom: str

class ProcessedRewards(TypedDict):
    tokens: List[Dict[str, str]]
    total_usd: float

class ProviderDelegatorResult(TypedDict):
    provider: str
    delegator_rewards: ProcessedRewards

class FinalResults(TypedDict):
    provider_delegators: List[ProviderDelegatorResult]

# Shared counters with locks
completed_count = Value(c_int, 0)
successful_count = Value(c_int, 0)
total_count = Value(c_int, 0)
counter_lock = Lock()

def truncate_str(s: str, max_len: int = 2000) -> str:
    """Truncate string to max length and add ellipsis if needed"""
    if len(s) <= max_len:
        return s
    return s[:max_len] + "..."

def format_json(obj: Any) -> str:
    """Format object as JSON string with truncation"""
    return truncate_str(json.dumps(obj, indent=2))

def get_delegations(provider_address: str) -> Optional[List[Delegation]]:
    """Get list of delegations for a provider"""
    delegators_response = run_lavad_command(f"lavad query dualstaking provider-delegators {provider_address}")
    if not delegators_response:
        print(f"[Provider Error] {provider_address}: Empty response from dualstaking query")
        return None
    if "delegations" not in delegators_response:
        print(f"[Provider Error] {provider_address}: Response missing 'delegations' field. Full response: {truncate_str(format_json(delegators_response))}")
        return None
    
    return delegators_response["delegations"]

def get_recommended_block_minus_one(provider_address: str, delegator: str) -> Optional[int]:
    """Get recommended block height for rewards query"""
    initial_response = run_lavad_command(
        f"lavad q subscription estimated-provider-rewards {provider_address} {delegator}"
    )
    
    if not initial_response:
        print(f"[Delegator Error] {delegator}: Empty response from estimated-provider-rewards query")
        return None
    if "recommended_block" not in initial_response:
        print(f"[Delegator Error] {delegator}: Response missing 'recommended_block' field. Full response: {truncate_str(format_json(initial_response))}")
        return None
    
    return int(initial_response["recommended_block"]) - 1

def get_estimated_rewards_at_height(provider_address: str, delegator: str, block_height: int) -> Optional[Dict[str, Any]]:
    """Get rewards for delegator at specific block height"""
    rewards = run_lavad_command(
        f"lavad q subscription estimated-provider-rewards {provider_address} {delegator} --height {block_height}"
    )
    
    if not rewards:
        print(f"[Rewards Error] {delegator}: Empty response at height {block_height}")
        return None
    
    return rewards

def process_rewards(rewards: Dict[str, Any], delegator: str, delegation: Delegation) -> List[RewardToken]:
    """Process rewards response and return token list"""
    tokens: List[RewardToken] = []
    
    if "rewards" not in rewards:
        if "total" in rewards:
            for reward in rewards["total"]:
                tokens.append({
                    "amount": reward["amount"],
                    "denom": reward["denom"],
                    "delegator": delegator,
                    "staked_amount": delegation["amount"]["amount"],
                    "staked_denom": delegation["amount"]["denom"]
                })
        else:
            print(f"[Rewards Error] {delegator}: Invalid response format. Expected 'rewards' or 'total' field. Full response: {truncate_str(format_json(rewards))}")
    else:
        for reward in rewards["rewards"]:
            if float(reward["amount"]) == 0:
                continue
            tokens.append({
                "amount": reward["amount"],
                "denom": reward["denom"],
                "delegator": delegator,
                "staked_amount": delegation["amount"]["amount"],
                "staked_denom": delegation["amount"]["denom"]
            })
    
    return tokens

def process_delegation(delegation: Delegation, provider_address: str) -> List[RewardToken]:
    """Process a single delegation and return rewards tokens"""
    tokens: List[RewardToken] = []
    try:
        delegator: str = delegation["delegator"]
        
        block_height = get_recommended_block_minus_one(provider_address, delegator)
        if block_height is None:
            return tokens
            
        rewards = get_estimated_rewards_at_height(provider_address, delegator, block_height)
        if rewards is None:
            return tokens
            
        return process_rewards(rewards, delegator, delegation)
        
    except Exception as e:
        print(f"[Processing Error] Failed to process delegation {truncate_str(format_json(delegation))} for provider {provider_address}")
        print(f"[Processing Error] Error details: {truncate_str(str(e))}")
        print(f"[Processing Error] Error type: {type(e).__name__}")
        return tokens

def get_provider_delegator_rewards(provider_address: str) -> ProviderDelegatorResult:
    """Get rewards for all delegators of a provider"""
    try:
        delegations = get_delegations(provider_address)
        if not delegations:
            return None
            
        print(f"[Info] Processing {len(delegations)} delegations for provider {provider_address}")
        
        if len(delegations) == 0:
            return None
        
        tokens: List[RewardToken] = []
        for delegation in delegations:
            tokens.extend(process_delegation(delegation, provider_address))
        
        try:
            rewards = process_token_array(tokens)
            if rewards["tokens"] or rewards["total_usd"] > 0:
                return {
                    "provider": provider_address,
                    "delegator_rewards": rewards
                }
            print(f"[Info] No rewards found for provider {provider_address}")
            return None
            
        except KeyError as e:
            print(f"[Fatal Error] Provider {provider_address}: Failed to process tokens array")
            print(f"[Debug] Missing key: {str(e)}")
            print(f"[Debug] Tokens array: {truncate_str(format_json(tokens))}")
            return None
            
    except Exception as e:
        print(f"[Fatal Error] Provider {provider_address}: Unexpected error while processing")
        print(f"[Debug] Error type: {type(e).__name__}")
        print(f"[Debug] Error message: {truncate_str(str(e))}")
        print(f"[Debug] Full error details: {truncate_str(repr(e))}")
        return None

def process_with_progress(provider: str) -> Optional[ProviderDelegatorResult]:
    """Process a provider and update progress"""
    result = get_provider_delegator_rewards(provider)
    
    # Update counters safely
    with counter_lock:
        completed_count.value += 1
        if result is not None:
            successful_count.value += 1
        if completed_count.value % 10 == 0 or completed_count.value == total_count.value:
            print(f"[Progress] Processed {completed_count.value}/{total_count.value} providers ({successful_count.value} with rewards)")
    
    return result

def main() -> None:
    """Main function to process all provider delegator rewards"""
    providers: List[str] = jsinfobe_get_providers()
    total_count.value = len(providers)
    print(f"[Progress] Starting to process {total_count.value} providers...")
    
    try:
        # Use number of CPUs minus 1 to avoid overloading
        num_processes: int = max(1, cpu_count() - 1)
        print(f"[Setup] Using {num_processes} processes")
        
        with Pool(num_processes) as pool:
            results: List[Optional[ProviderDelegatorResult]] = pool.map(process_with_progress, providers)
            pool.close()
            pool.join()
            
        # Filter out None results and create final structure
        valid_results: List[ProviderDelegatorResult] = [r for r in results if r is not None]
        
        final_results: FinalResults = {
            "provider_delegators": valid_results
        }
        
        print(f"[Summary] Found {len(valid_results)} providers with delegator rewards out of {total_count.value} total")
        print(f"[Summary] Success rate: {(len(valid_results)/total_count.value)*100:.1f}%")

        save_json(final_results, "provider_delegator_rewards")

    except Exception as e:
        print(f"[Error] Main process error: {str(e)}")
        raise
    finally:
        # Cleanup any remaining resources
        if 'pool' in locals():
            pool.terminate()

if __name__ == "__main__":
    main() 