import json
import subprocess
import requests
import time
from datetime import datetime
from typing import Dict, Tuple, Optional
import os
from multiprocessing import Pool, cpu_count
from functools import partial
from tqdm import tqdm
from consts import RPC_URL

# Constants
MIN_ACCEPTABLE_RATE = 1.e-7
MAX_ACCEPTABLE_RATE = 100000
DENOM_LOWEST_LIMIT_WARNING = 1.e-20
DENOM_HIGHEST_LIMIT_ERROR = 10_000_000_000_000  # Using testnet value

# Get script directory and construct path to denom map
script_dir = os.path.dirname(os.path.abspath(__file__))
denom_map_path = os.path.join(script_dir, "CoinGekoDenomMap.json")

# Load denom mappings
try:
    with open(denom_map_path, "r") as f:
        DENOM_MAP = json.load(f)
except FileNotFoundError:
    print(f"Error: Could not find CoinGekoDenomMap.json at {denom_map_path}")
    DENOM_MAP = {}

DENOM_CONVERSIONS = {
    "ulava": {"baseDenom": "lava", "factor": 1_000_000},
    "uatom": {"baseDenom": "atom", "factor": 1_000_000},
    "ustars": {"baseDenom": "stars", "factor": 1_000_000},          # Stargaze (STARS)
    "uakt": {"baseDenom": "akt", "factor": 1_000_000},             # Akash (AKT)
    "uhuahua": {"baseDenom": "huahua", "factor": 1_000_000},       # Chihuahua (HUAHUA)
    "uevmos": {"baseDenom": "evmos", "factor": 1_000_000_000_000_000_000},  # Evmos (EVMOS)
    "inj": {"baseDenom": "inj", "factor": 1_000_000_000_000_000_000},       # Injective (INJ)
    "aevmos": {"baseDenom": "evmos", "factor": 1_000_000_000_000_000_000},  # Evmos (EVMOS)
    "basecro": {"baseDenom": "cro", "factor": 100_000_000},        # Crypto.com (CRO)
    "uscrt": {"baseDenom": "scrt", "factor": 1_000_000},           # Secret (SCRT)
    "uiris": {"baseDenom": "iris", "factor": 1_000_000},           # IRISnet (IRIS)
    "uregen": {"baseDenom": "regen", "factor": 1_000_000},         # Regen (REGEN)
    "uion": {"baseDenom": "ion", "factor": 1_000_000},             # Ion (ION)
    "nanolike": {"baseDenom": "like", "factor": 1_000_000_000},    # LikeCoin (LIKE)
    "uaxl": {"baseDenom": "axl", "factor": 1_000_000},             # Axelar (AXL)
    "uband": {"baseDenom": "band", "factor": 1_000_000},           # Band Protocol (BAND)
    "ubld": {"baseDenom": "bld", "factor": 1_000_000},             # Agoric (BLD)
    "ucmdx": {"baseDenom": "cmdx", "factor": 1_000_000},           # COMDEX (CMDX)
    "ucre": {"baseDenom": "cre", "factor": 1_000_000},             # Crescent (CRE)
    "uxprt": {"baseDenom": "xprt", "factor": 1_000_000},           # Persistence (XPRT)
    "uusdc": {"baseDenom": "usdc", "factor": 1_000_000},           # USD Coin (USDC)
}

INITIAL_RATES = {
    "evmos": 0.02137148,
    "axl-inu": 0.00001604,
    "lava-network": 0.128505,
    "ton-stars": 0.00057525,
    "cosmos": 6.45,
    "zksync-bridged-usdc-zksync": 1.0
}

class CoinGeckoCache:
    def __init__(self):
        # Initialize cache with known rates and current timestamp
        current_time = time.time()
        self.cache = {
            coin_id: (rate, current_time) 
            for coin_id, rate in INITIAL_RATES.items()
        }
        self.cache_duration = 30 * 60  # 30 minutes

    def _is_cache_valid(self, timestamp: float) -> bool:
        return time.time() - timestamp < self.cache_duration

    def get_denom_to_usd_rate(self, denom: str) -> float:
        if denom not in DENOM_MAP:
            raise ValueError(f"No matching id found in denoms.json for {denom}")

        coingecko_id = DENOM_MAP[denom]
        
        # Check cache first
        if coingecko_id in self.cache:
            rate, timestamp = self.cache[coingecko_id]
            if self._is_cache_valid(timestamp):
                return rate

        # Only fetch from CoinGecko if not in cache or cache expired
        try:
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={coingecko_id}&vs_currencies=usd"
            response = requests.get(url)
            data = response.json()
            
            rate = data[coingecko_id]["usd"]
            
            if rate < MIN_ACCEPTABLE_RATE or rate > MAX_ACCEPTABLE_RATE:
                print(f"Warning: Rate for {coingecko_id} is out of acceptable range: {rate}")
                return 0
            
            self.cache[coingecko_id] = (rate, time.time())
            return rate
            
        except Exception as e:
            if coingecko_id in INITIAL_RATES:
                print(f"Using initial rate for {coingecko_id}")
                return INITIAL_RATES[coingecko_id]
            print(f"Error fetching rate for {coingecko_id}: {e}")
            #raise ValueError(f"No initial rate found for {coingecko_id}")
            return 0

def convert_to_base_denom(amount: str, denom: str) -> Tuple[str, str]:
    base_amount = float(amount)
    base_denom = denom

    if base_denom in DENOM_CONVERSIONS:
        conversion = DENOM_CONVERSIONS[base_denom]
        base_denom = conversion["baseDenom"]
        base_amount = base_amount / conversion["factor"]

    if base_amount < DENOM_LOWEST_LIMIT_WARNING:
        print(f"Warning: Amount too small: {base_amount} {base_denom}")
        
    if base_amount > DENOM_HIGHEST_LIMIT_ERROR:
        print(f"Error: Amount too large: {base_amount} {base_denom}")
        return "0", base_denom

    return str(base_amount), base_denom

def get_usd_value(amount: str, denom: str) -> str:
    coingecko = CoinGeckoCache()
    usd_rate = coingecko.get_denom_to_usd_rate(denom)
    
    if usd_rate == 0:
        print(f"Warning: No USD rate available for {denom}")
        return "0"

    result = float(amount) * usd_rate

    if result < DENOM_LOWEST_LIMIT_WARNING:
        print(f"Warning: USD value too small: {result}")
    
    if result > DENOM_HIGHEST_LIMIT_ERROR:
        print(f"Error: USD value too large: {result}")
        return "0"

    return str(result)

RPC_URL = "https://internal-rpc-mainnet.lavanet.xyz:443"

def run_lavad_command(command):
    try:        
        # Add the node argument to each command
        full_command = f"{command} --node {RPC_URL} --output json"
        result = subprocess.run(full_command.split(), capture_output=True, text=True)
        if " Unknown desc = cannot estimate rewards, cannot get claim" in result.stderr:
            return None
        if result.stderr:
            print(f"Command stderr: {result.stderr} for command: {full_command}")
        return json.loads(result.stdout) if result.stdout else None
    except json.JSONDecodeError as e:
        print(f"JSON decode error for command '{command}': {e}")
        print(f"Raw output: {result.stdout}")
        return None
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        print(f"Error type: {type(e)}")
        return None

def get_all_validators():
    validators_data = run_lavad_command("lavad q staking validators")
    if not validators_data:
        return []
    return [val["operator_address"] for val in validators_data["validators"]]

def get_denom_trace(denom: str) -> str:
    """Get base denom from IBC denom trace"""
    if not denom.startswith("ibc/"):
        return denom
        
    # Remove 'ibc/' prefix for the query
    hash_id = denom[4:]
    
    try:
        response = run_lavad_command(f"lavad q ibc-transfer denom-trace {hash_id}")
        if response and "denom_trace" in response:
            return response["denom_trace"]["base_denom"]
    except Exception as e:
        print(f"Error getting denom trace for {denom}: {e}")
    
    return denom

def process_reward(reward: Dict) -> float:
    """Process a single reward entry and return its USD value"""
    try:
        amount = reward.get("amount", "0")
        denom = reward.get("denom", "")
        
        if not denom:
            print(f"Warning: No denom found in reward: {reward}")
            return 0.0
        
        # Resolve IBC denom if needed
        if denom.startswith("ibc/"):
            base_denom = get_denom_trace(denom)
            # Skip logging for samoleans
            denom = base_denom
            
        # Skip processing samoleans entirely
        if denom == "samoleans":
            return 0.0
            
        # First convert to base denom
        base_amount, base_denom = convert_to_base_denom(amount, denom)
        
        # Then get USD value
        usd_value = float(get_usd_value(base_amount, base_denom))
        
        if usd_value == 0 and denom != "samoleans":  # Only print warning for non-samoleans
            print(f"Warning: Zero USD value for {amount} {denom}")
            
        return usd_value
        
    except Exception as e:
        if "samoleans" not in str(e):  # Only print error for non-samoleans
            print(f"Error processing reward {reward}: {e}")
        return 0.0

def get_validator_rewards(validator_address):
    dist_info = run_lavad_command(f"lavad q distribution validator-distribution-info {validator_address}")
    outstanding = run_lavad_command(f"lavad q distribution validator-outstanding-rewards {validator_address}")
    
    total_rewards = 0.0
    rewards_info = []
    
    # Process self bond rewards from distribution info
    if dist_info and "self_bond_rewards" in dist_info:
        rewards_data = process_rewards({"rewards": [{"reward": dist_info["self_bond_rewards"]}]})
        total_rewards += rewards_data["total_usd"]
        rewards_info.extend(rewards_data["tokens"])
    
    # Process outstanding rewards
    if outstanding and "rewards" in outstanding:
        rewards_data = process_rewards({"rewards": [{"reward": outstanding["rewards"]}]})
        total_rewards += rewards_data["total_usd"]
        rewards_info.extend(rewards_data["tokens"])
    
    return {
        "total_usd": total_rewards,
        "tokens": rewards_info
    }

def get_validator_delegators_rewards(validator_address: str) -> Dict:
    """Get total rewards for all delegators of a validator"""
    total_rewards = 0.0
    all_tokens = []
    
    # Get list of delegators
    delegators = run_lavad_command(f"lavad query staking delegations-to {validator_address}")
    if not delegators or "delegation_responses" not in delegators:
        return {"total_usd": 0, "tokens": []}
        
    print(f"Processing {len(delegators['delegation_responses'])} delegators for {validator_address}")
    
    # Process each delegator
    for delegation in delegators["delegation_responses"]:
        delegator_addr = delegation["delegation"]["delegator_address"]
        rewards_response = run_lavad_command(
            f"lavad query distribution rewards {delegator_addr} {validator_address}"
        )
        
        if rewards_response:
            rewards_data = process_rewards(rewards_response)
            total_rewards += rewards_data["total_usd"]
            all_tokens.extend(rewards_data["tokens"])
                
    return {
        "total_usd": total_rewards,
        "tokens": all_tokens
    }

def get_provider_rewards(provider_address: str) -> Dict:
    """Get rewards for a provider using recommended block height"""
    try:
        initial_response = run_lavad_command(
            f"lavad q subscription estimated-provider-rewards {provider_address}"
        )
        
        if not initial_response:
            return {"total_usd": 0, "tokens": []}
            
        # Handle case where response has info/total structure
        if "info" in initial_response and "total" in initial_response:
            return process_rewards({"rewards": [{"reward": initial_response["total"]}]})
            
        if "recommended_block" not in initial_response:
            return {"total_usd": 0, "tokens": []}
            
        # Get rewards at recommended block height minus 1
        block_height = int(initial_response["recommended_block"]) - 1
        
        response = run_lavad_command(
            f"lavad q subscription estimated-provider-rewards {provider_address} --height {block_height}"
        )
        
        if not response:
            return {"total_usd": 0, "tokens": []}
            
        # Handle case where response has info/total structure
        if "info" in response and "total" in response:
            return process_rewards({"rewards": [{"reward": response["total"]}]})
            
        if "rewards" not in response:
            return {"total_usd": 0, "tokens": []}
            
        return process_rewards({"rewards": [{"reward": [response["rewards"]]}]})
        
    except Exception as e:
        print(f"Error getting provider rewards for {provider_address}: {e}")
        return {"total_usd": 0, "tokens": []}

def get_provider_delegators_rewards(provider_address: str) -> float:
    """Get total rewards for all delegators of a provider"""
    total_rewards = 0.0
    
    # Get list of delegators
    delegators = run_lavad_command(f"query dualstaking provider-delegators {provider_address}")
    if not delegators or "delegations" not in delegators:
        return total_rewards
        
    print(f"Processing {len(delegators['delegations'])} delegators for provider {provider_address}")
    
    # Process each delegator
    for delegation in delegators['delegations']:
        try:
            if not isinstance(delegation, dict):
                continue
                
            if 'delegator' not in delegation or 'amount' not in delegation:
                continue
                
            delegator_addr = delegation['delegator']
            amount = delegation['amount']
            
            if not isinstance(amount, dict) or 'denom' not in amount or 'amount' not in amount:
                continue
                
            # Convert delegation amount to base denom
            base_amount, base_denom = convert_to_base_denom(amount['amount'], amount['denom'])
            
            # Get USD value of delegation
            delegation_value = float(get_usd_value(base_amount, base_denom))
            total_rewards += delegation_value
            
        except Exception as e:
            print(f"Error processing delegation {delegation}: {e}")
            continue
                
    return total_rewards

def process_validator_entry(validator: str, rewards: float, all_results: dict, reward_type: str) -> None:
    """Process a validator entry and add it to results if rewards are meaningful"""
    rewards_str = f"${rewards:.2f}"
    if rewards > 0 and rewards_str != "$0.00":
        # Add to the list if not exists, or update if exists
        found = False
        for entry in all_results["validators"]:
            if entry["address"] == validator:
                current_rewards = float(entry["rewards"].replace("$", ""))
                entry["rewards"] = f"${current_rewards + rewards:.2f}"
                found = True
                break
                
        if not found:
            all_results["validators"].append({
                "address": validator,
                "rewards": rewards_str
            })
        
        # Update the total
        all_results["totals"][reward_type] += rewards

def process_provider_entry(provider: str, rewards: float, all_results: dict, reward_type: str) -> None:
    """Process a provider entry and add it to results if rewards are meaningful"""
    rewards_str = f"${rewards:.2f}"
    if rewards > 0 and rewards_str != "$0.00":
        # Add to the list if not exists, or update if exists
        found = False
        for entry in all_results["validators"]:  # Using same list as validators
            if entry["address"] == provider:
                current_rewards = float(entry["rewards"].replace("$", ""))
                entry["rewards"] = f"${current_rewards + rewards:.2f}"
                found = True
                break
                
        if not found:
            all_results["validators"].append({
                "address": provider,
                "rewards": rewards_str
            })
        
        # Update the total
        all_results["totals"][reward_type] += rewards

def process_validator_parallel(validator: str) -> Dict:
    """Process a single validator and return its rewards"""
    validator_rewards = get_validator_rewards(validator)
    delegator_rewards = get_validator_delegators_rewards(validator)
    
    return {
        "validator": validator,
        "validator_rewards": validator_rewards["total_usd"],
        "validator_tokens": validator_rewards["tokens"],
        "delegator_rewards": delegator_rewards["total_usd"],
        "delegator_tokens": delegator_rewards["tokens"]
    }

def process_provider_parallel(args) -> Dict:
    """Process a single provider and return its rewards"""
    provider, index, total = args
    try:
        provider_addr = provider["address"]
        print(f"\nProcessing provider {index + 1}/{total}: {provider_addr}")
        
        provider_rewards = get_provider_rewards(provider_addr)
        print(f"Provider rewards: ${provider_rewards['total_usd']:.2f}")
        
        delegator_rewards = get_provider_delegators_rewards(provider_addr)
        print(f"Provider delegator rewards: ${delegator_rewards['total_usd']:.2f}")

        return {
            "provider": provider_addr,
            "provider_rewards": provider_rewards["total_usd"],
            "provider_tokens": provider_rewards["tokens"],
            "delegator_rewards": delegator_rewards["total_usd"],
            "delegator_tokens": delegator_rewards["tokens"]
        }
    except Exception as e:
        print(f"\nError processing provider {provider.get('address', 'unknown')}: {e}")
        return {
            "provider": provider.get('address', 'unknown'),
            "provider_rewards": 0.0,
            "provider_tokens": [],
            "delegator_rewards": 0.0,
            "delegator_tokens": []
        }

def get_providers() -> list:
    """Fetch providers from the mainnet API"""
    try:
        response = requests.get("https://jsinfo.mainnet.lavanet.xyz/providers")
        data = response.json()
        
        if not data or "providers" not in data:
            print("Error: Invalid response from providers API")
            print(f"Response: {json.dumps(data, indent=2)}")
            return []
            
        return [{"address": addr} for addr in data["providers"]]
        
    except Exception as e:
        print(f"Error fetching providers: {e}")
        return []

def process_rewards(rewards_response: Dict) -> Dict:
    """Process rewards response with detailed token information"""
    total_usd = 0
    tokens_info = []
    
    for reward in rewards_response.get("rewards", []):
        for coin in reward.get("reward", []):
            amount = float(coin["amount"])
            denom = coin["denom"]
            
            # Skip tiny amounts
            if amount < DENOM_LOWEST_LIMIT_WARNING:
                continue
                
            usd_value = get_usd_value(amount, denom)
            
            # Store detailed token info
            tokens_info.append({
                "denom": denom,
                "amount": amount,
                "value_usd": usd_value
            })
            
            total_usd += usd_value
    
    return {
        "total_usd": total_usd,
        "tokens": tokens_info
    }

def main():
    print("\nFetching validators...")
    validators = get_all_validators()
    print(f"Found {len(validators)} validators")
    
    all_results = {
        "generated_at": datetime.now().isoformat(),
        "totals": {
            "total_rewards": 0,
            "provider_rewards": 0,
            "provider_delegator_rewards": 0
        },
        "providers": []
    }
    
    # Process validators in parallel
    num_processes = min(cpu_count(), 8)  # Limit to 8 processes max
    print(f"\nProcessing validators using {num_processes} processes...")
    
    with Pool(num_processes) as pool:
        validator_results = list(pool.imap_unordered(
            process_validator_parallel, 
            validators,
            chunksize=max(len(validators) // (num_processes * 4), 1)
        ))
    
    # Process validator results
    for result in validator_results:
        validator = result["validator"]
        validator_rewards = result["validator_rewards"]
        delegator_rewards = result["delegator_rewards"]
        
        # Add validator rewards
        rewards_str = f"${validator_rewards:.2f}"
        if validator_rewards > 0 and rewards_str != "$0.00":
            all_results["validator_rewards"].append({
                "address": validator,
                "rewards": rewards_str
            })
            all_results["totals"]["validator_rewards"] += validator_rewards
        
        # Add delegator rewards
        delegator_rewards_str = f"${delegator_rewards:.2f}"
        if delegator_rewards > 0 and delegator_rewards_str != "$0.00":
            all_results["validator_delegators"].append({
                "address": validator,
                "rewards": delegator_rewards_str
            })
            all_results["totals"]["validator_delegator_rewards"] += delegator_rewards
    
    # Process providers in parallel
    print("\nFetching providers from API...")
    providers = get_providers()
    
    if not providers:
        print("Error: Failed to fetch providers list")
    else:
        total_providers = len(providers)
        print(f"Found {total_providers} providers")
        
        # Process providers with progress bar
        with Pool(num_processes) as pool:
            provider_args = [(p, i, total_providers) for i, p in enumerate(providers)]
            provider_results = list(tqdm(
                pool.imap_unordered(process_provider_parallel, provider_args),
                total=total_providers,
                desc="Providers"
            ))
        
        # Process provider results
        for result in provider_results:
            provider = result["provider"]
            provider_rewards = result["provider_rewards"]
            delegator_rewards = result["delegator_rewards"]
            
            # Add provider rewards
            provider_rewards_str = f"${provider_rewards:.2f}"
            if provider_rewards > 0 and provider_rewards_str != "$0.00":
                all_results["provider_rewards"].append({
                    "address": provider,
                    "rewards": provider_rewards_str
                })
                all_results["totals"]["provider_rewards"] += provider_rewards
            
            # Add provider delegator rewards
            delegator_rewards_str = f"${delegator_rewards:.2f}"
            if delegator_rewards > 0 and delegator_rewards_str != "$0.00":
                all_results["provider_delegators"].append({
                    "address": provider,
                    "rewards": delegator_rewards_str
                })
                all_results["totals"]["provider_delegator_rewards"] += delegator_rewards
    
    # Calculate total rewards
    all_results["totals"]["total_rewards"] = sum(
        all_results["totals"][key] for key in all_results["totals"] 
        if key != "total_rewards"
    )
    
    # Keep raw values for totals
    all_results["totals_raw"] = {k: v for k, v in all_results["totals"].items()}
    
    # Format totals as strings with $ prefix
    for key in all_results["totals"]:
        all_results["totals"][key] = f"${all_results['totals'][key]:.2f}"
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"all_rewards_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(all_results, f, indent=2)
        
    print(f"\nResults saved to {filename}")
    print("\nTotals:")
    for key, value in all_results["totals"].items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main()
