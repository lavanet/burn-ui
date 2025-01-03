import os
import json
import time
from typing import Dict, List, Tuple, Union, TypedDict
from run_lavad_command import run_lavad_command
from local_disk_cache import get_cache_path, is_cache_valid, load_from_cache, save_to_cache

# Constants
MIN_ACCEPTABLE_RATE: float = 1.e-7
MAX_ACCEPTABLE_RATE: float = 100000
DENOM_LOWEST_LIMIT_WARNING: float = 1.e-20
DENOM_HIGHEST_LIMIT_ERROR: float = 10_000_000_000_000  # Using testnet value

class DenomConversion(TypedDict):
    baseDenom: str
    factor: int

class CoinGeckoRate(TypedDict):
    rate: float
    timestamp: float

class TokenAmount(TypedDict):
    amount: Union[str, float]
    denom: str

class ProcessedToken(TypedDict):
    amount: str
    denom: str
    original_denom: str
    value_usd: str

class ProcessedTokenArray(TypedDict):
    tokens: List[ProcessedToken]
    total_usd: float

# Get script directory and construct path to denom map
script_dir: str = os.path.dirname(os.path.abspath(__file__))
denom_map_path: str = os.path.join(script_dir, "CoinGekoDenomMap.json")

# Load denom mappings
try:
    with open(denom_map_path, "r") as f:
        DENOM_MAP: Dict[str, str] = json.load(f)
except FileNotFoundError:
    print(f"Error: Could not find CoinGekoDenomMap.json at {denom_map_path}")
    DENOM_MAP = {}

DENOM_CONVERSIONS: Dict[str, DenomConversion] = {
    "ulava": {"baseDenom": "lava", "factor": 1_000_000},
    "uatom": {"baseDenom": "atom", "factor": 1_000_000},
    "ustars": {"baseDenom": "stars", "factor": 1_000_000},
    "uakt": {"baseDenom": "akt", "factor": 1_000_000},
    "uhuahua": {"baseDenom": "huahua", "factor": 1_000_000},
    "uevmos": {"baseDenom": "evmos", "factor": 1_000_000_000_000_000_000},
    "inj": {"baseDenom": "inj", "factor": 1_000_000_000_000_000_000},
    "aevmos": {"baseDenom": "evmos", "factor": 1_000_000_000_000_000_000},
    "basecro": {"baseDenom": "cro", "factor": 100_000_000},
    "uscrt": {"baseDenom": "scrt", "factor": 1_000_000},
    "uiris": {"baseDenom": "iris", "factor": 1_000_000},
    "uregen": {"baseDenom": "regen", "factor": 1_000_000},
    "uion": {"baseDenom": "ion", "factor": 1_000_000},
    "nanolike": {"baseDenom": "like", "factor": 1_000_000_000},
    "uaxl": {"baseDenom": "axl", "factor": 1_000_000},
    "uband": {"baseDenom": "band", "factor": 1_000_000},
    "ubld": {"baseDenom": "bld", "factor": 1_000_000},
    "ucmdx": {"baseDenom": "cmdx", "factor": 1_000_000},
    "ucre": {"baseDenom": "cre", "factor": 1_000_000},
    "uxprt": {"baseDenom": "xprt", "factor": 1_000_000},
    "uusdc": {"baseDenom": "usdc", "factor": 1_000_000},
}

INITIAL_RATES: Dict[str, float] = {
    "evmos": 0.02137148,
    "axl-inu": 0.00001604,
    "lava-network": 0.128505,
    "ton-stars": 0.00057525,
    "cosmos": 6.45,
    "zksync-bridged-usdc-zksync": 1.0
}

def get_denom_trace(denom: str) -> str:
    """
    Get base denom from IBC denom trace with caching
    
    Args:
        denom: The IBC denom to trace
        
    Returns:
        str: The base denom
    """
    if not denom.startswith("ibc/"):
        return denom
        
    # Check cache first
    cache_path = get_cache_path('denom', denom)
    if is_cache_valid(cache_path):
        return load_from_cache(cache_path)
    
    # Remove 'ibc/' prefix for the query
    hash_id = denom[4:]
    
    try:
        response = run_lavad_command(f"lavad q ibc-transfer denom-trace {hash_id}")
        if response and "denom_trace" in response:
            base_denom = response["denom_trace"]["base_denom"]
            # Save to cache
            save_to_cache(base_denom, cache_path)
            return base_denom
    except Exception as e:
        print(f"Error getting denom trace for {denom}: {e}")
    
    # If we can't resolve it, cache the original denom to avoid repeated lookups
    save_to_cache(denom, cache_path)
    return denom

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
        if type(denom) != str:
            raise ValueError(f"Denom is not a string: {denom}")
        
        if denom.startswith("ibc/"):
            denom = get_denom_trace(denom)
        
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
    """
    Convert amount and denom to base denomination
    
    Args:
        amount: The token amount as string
        denom: The token denomination
        
    Returns:
        Tuple[str, str]: (base_amount, base_denom)
        
    Raises:
        ValueError: If denom is not a string
    """
    if not isinstance(denom, str):
        raise ValueError(f"Denom must be a string, got {type(denom)}: {denom}")

    if denom.startswith("ibc/"):
        denom = get_denom_trace(denom)

    base_amount: float = float(amount)
    base_denom: str = denom

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

COINGECKO_CACHE = CoinGeckoCache()

def get_usd_value(amount: str, denom: str) -> str:
    """
    Get USD value for token amount
    
    Args:
        amount: Token amount as string
        denom: Token denomination
        
    Returns:
        str: USD value as string
        
    Raises:
        ValueError: If inputs are not strings
    """
    if type(amount) not in [str, float, int] or type(denom) not in [str, float, int]:
        raise ValueError(f"Amount and denom must be strings, got {type(amount)} and {type(denom)}")
    
    base_amount, base_denom = convert_to_base_denom(amount, denom)
    usd_rate = COINGECKO_CACHE.get_denom_to_usd_rate(base_denom)
    
    if usd_rate == 0:
        print(f"Warning: No USD rate available for {base_denom}")
        return "0"

    result = float(base_amount) * usd_rate

    if result < DENOM_LOWEST_LIMIT_WARNING:
        print(f"Warning: USD value too small: {result}")
    
    if result > DENOM_HIGHEST_LIMIT_ERROR:
        print(f"Error: USD value too large: {result}")
        return "0"

    return str(result)

def process_token(amount: float, denom: str) -> ProcessedToken:
    """
    Process a single token and return its details
    
    Args:
        amount: Token amount as float
        denom: Token denomination
        
    Returns:
        ProcessedToken: Processed token details
        
    Raises: 
        ValueError: For invalid tokens, amounts too small/large, or processing errors
    """
    # Skip tiny amounts early
    if amount < DENOM_LOWEST_LIMIT_WARNING:
        raise ValueError(f"Amount too small: {amount} {denom}")
        
    orig_denom = denom
    
    # Convert IBC denom if needed
    if denom.startswith("ibc/"):
        denom = get_denom_trace(denom)
        
    # Convert to base denomination
    base_amount, base_denom = convert_to_base_denom(str(amount), denom)
    
    # Get USD value
    usd_value = float(get_usd_value(base_amount, base_denom))
    
    # Skip if USD value is too small
    if usd_value <= 0.00:
        raise ValueError(f"USD value too small for {amount} {denom}")
        
    return {
        "amount": str(amount),
        "denom": base_denom,
        "original_denom": orig_denom,
        "value_usd": f"${usd_value:.2f}"
    }

def process_token_array(tokens: List[TokenAmount]) -> ProcessedTokenArray:
    """
    Process an array of tokens and return processed items with total
    
    Args:
        tokens: List of token amounts to process
        
    Returns:
        ProcessedTokenArray: Processed tokens with total USD value
    """
    processed_items: List[ProcessedToken] = []
    usd_sum: float = 0.0
    
    for token in tokens:
        try:
            if not isinstance(token, dict):
                print(f"[Token Error] Token is not a dictionary: {token}")
                continue
            
            if "amount" not in token or "denom" not in token:
                print(f"[Token Error] Token missing required fields: {token}")
                continue
            
            amount = float(token.get("amount", 0))
            denom = token.get("denom", "")
            
            if not denom:
                print(f"[Token Error] Token has no denom: {token}")
                continue
                
            try:
                processed = process_token(amount, denom)
                processed_items.append(processed)
                usd_sum += float(processed["value_usd"].replace("$", ""))
            except ValueError as e:
                print(f"[Token Warning] Skipping invalid token: {e}")
                continue
                
        except Exception as e:
            print(f"[Token Error] Failed to process token: {token}")
            print(f"[Token Error] Error details: {str(e)}")
            continue
    
    # Always return with both fields, even if empty
    return {
        "tokens": processed_items,  # Changed from "items" to "tokens" to match expected structure
        "total_usd": usd_sum
    }