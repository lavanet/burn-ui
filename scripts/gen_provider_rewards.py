import json
from datetime import datetime
from typing import Dict, List, Optional, TypedDict, Any
from run_lavad_command import run_lavad_command
from get_usd_value_from_token import process_token_array
from jsinfobe_fetch import jsinfobe_get_providers
from get_usd_value_from_token import ProcessedToken, TokenAmount
from utils import save_json

class RewardsResponse(TypedDict):
    rewards: List[TokenAmount]
    total: List[TokenAmount]
    recommended_block: str

class ProcessedRewards(TypedDict):
    tokens: List[ProcessedToken]
    total_usd: float

class ProviderResult(TypedDict):
    address: str
    rewards: ProcessedRewards
    block_height: int
    timestamp: str

class FinalResults(TypedDict):
    providers: List[ProviderResult]
    timestamp: str
    total_providers: int
    providers_with_rewards: int

def validate_rewards_response(rewards: Dict[str, Any], provider_address: str, block_height: int) -> bool:
    """
    Validate rewards response structure
    
    Args:
        rewards: Response to validate
        provider_address: Provider address for error messages
        block_height: Block height for error messages
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not rewards:
        print(f"[Provider Error] {provider_address}: Empty rewards response at height {block_height}")
        return False
        
    if "rewards" not in rewards and "total" not in rewards:
        print(f"[Provider Error] {provider_address}: Response missing both 'rewards' and 'total' fields at height {block_height}")
        return False
        
    reward_list = rewards.get("rewards", []) or rewards.get("total", [])
    if not isinstance(reward_list, list):
        print(f"[Provider Error] {provider_address}: Invalid rewards format at height {block_height}")
        return False
        
    return True

def extract_tokens_from_rewards(rewards: Dict[str, Any]) -> List[TokenAmount]:
    """
    Extract token amounts from rewards response
    
    Args:
        rewards: Rewards response
        
    Returns:
        List[TokenAmount]: List of token amounts
    """
    tokens: List[TokenAmount] = []
    reward_list = rewards.get("rewards", []) or rewards.get("total", [])
    
    for reward in reward_list:
        try:
            amount = str(reward.get("amount", "0"))
            if float(amount) == 0:
                continue
            tokens.append({
                "amount": amount,
                "denom": str(reward.get("denom", ""))
            })
        except (ValueError, TypeError) as e:
            print(f"[Token Error] Invalid reward format: {reward}")
            continue
            
    return tokens

def get_recommended_block_minus_one(provider_address: str) -> Optional[int]:
    """
    Get recommended block height minus one for provider rewards
    
    Args:
        provider_address: The provider's address
        
    Returns:
        Optional[int]: Block height or None if not found
    """
    initial_response = run_lavad_command(
        f"lavad q subscription estimated-provider-rewards {provider_address}"
    )
    
    if not initial_response:
        print(f"[Provider Error] {provider_address}: Empty response from estimated-provider-rewards query, initial_response: {json.dumps(initial_response)}")
        return None
        
    if "recommended_block" not in initial_response:
        print(f"[Provider Error] {provider_address}: Response missing 'recommended_block' field")
        return None
    
    try:
        return int(initial_response["recommended_block"]) - 1
    except (ValueError, TypeError) as e:
        print(f"[Provider Error] {provider_address}: Invalid recommended_block format: {initial_response['recommended_block']}")
        return None

def get_rewards_at_height(provider_address: str, block_height: int) -> Optional[List[TokenAmount]]:
    """
    Get provider rewards at specific block height
    
    Args:
        provider_address: The provider's address
        block_height: Block height to query
        
    Returns:
        Optional[List[TokenAmount]]: List of rewards or None if error
    """
    rewards = run_lavad_command(
        f"lavad q subscription estimated-provider-rewards {provider_address} --height {block_height}"
    )
    
    if not validate_rewards_response(rewards, provider_address, block_height):
        return None
    
    return extract_tokens_from_rewards(rewards)

def get_provider_rewards(provider_address: str) -> Optional[ProviderResult]:
    """
    Get and process provider rewards
    
    Args:
        provider_address: The provider's address
        
    Returns:
        Optional[ProviderResult]: Processed provider result or None if error
    """
    try:
        block_height = get_recommended_block_minus_one(provider_address)
        if block_height is None:
            return None
            
        tokens = get_rewards_at_height(provider_address, block_height)
        if not tokens:
            return None
            
        rewards = process_token_array(tokens)
        if not rewards["tokens"] and rewards["total_usd"] <= 0:
            return None
            
        return {
            "address": provider_address,
            "rewards": rewards,
            "block_height": block_height,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[Fatal Error] Failed to get rewards for {provider_address}")
        print(f"[Debug] Error type: {type(e).__name__}")
        print(f"[Debug] Error details: {str(e)}")
        return None

def main() -> None:
    """Main function to process all provider rewards"""
    providers = jsinfobe_get_providers()
    if not providers:
        print("[Fatal Error] No providers to process")
        return
        
    print(f"[Progress] Processing {len(providers)} providers...")
    
    results: List[ProviderResult] = []
    for i, provider in enumerate(providers, 1):
        result = get_provider_rewards(provider)
        if result:
            results.append(result)
        
        # Print progress every 10 providers
        if i % 10 == 0 or i == len(providers):
            print(f"[Progress] Processed {i}/{len(providers)} providers ({len(results)} with rewards)")
    
    final_results: FinalResults = {
        "providers": results,
        "timestamp": datetime.utcnow().isoformat(),
        "total_providers": len(providers),
        "providers_with_rewards": len(results)
    }
    
    filename = f"provider_rewards_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
    print(f"[Summary] Found {len(results)} providers with rewards")
    print(f"[Summary] Writing results to {filename}")
    
    save_json(final_results, filename)

if __name__ == "__main__":
    main()