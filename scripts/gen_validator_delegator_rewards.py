import json
from datetime import datetime
from typing import List, Optional, TypedDict, Any
from multiprocessing import Pool, cpu_count, Value, Lock
from ctypes import c_int
from run_lavad_command import run_lavad_command
from get_usd_value_from_token import process_token_array
from jsinfobe_fetch import jsinfobe_get_validators
from get_usd_value_from_token import TokenAmount, ProcessedToken
from utils import save_json

class ValidatorRewards(TypedDict):
    validator_address: str
    total_rewards: List[ProcessedToken]
    total_usd: float
    delegator_count: int
    timestamp: str

class FinalResults(TypedDict):
    validators: List[ValidatorRewards]
    total_validators: int
    total_delegators: int
    total_usd: float
    timestamp: str

# Progress tracking
completed_count = Value(c_int, 0)
total_count = Value(c_int, 0)
counter_lock = Lock()

def validate_response(response: Any, expected_fields: List[str], context: str) -> bool:
    """Validate response has expected fields and print debug info"""
    if not response:
        print(f"[Debug] {context}: Empty response")
        return False
        
    # print(f"[Debug] {context}: Response type: {type(response)}")
    # print(f"[Debug] {context}: Available fields: {list(response.keys()) if isinstance(response, dict) else 'Not a dict'}")
    
    for field in expected_fields:
        if field not in response:
            print(f"[Debug] {context}: Missing field '{field}'")
            print(f"[Debug] {context}: Full response: {json.dumps(response, indent=2)}")
            return False
    return True

def get_delegators_for_validator(validator_addr: str) -> List[str]:
    """Get list of delegators for a validator"""
    response = run_lavad_command(f"lavad query staking delegations-to {validator_addr}")
    
    # Validate response
    if not validate_response(response, ["delegation_responses"], f"Delegations for {validator_addr}"):
        return []
        
    # Check delegation responses
    delegations = response["delegation_responses"]
    # print(f"[Debug] Delegations array type: {type(delegations)}")
    # if delegations:
    #     print(f"[Debug] First delegation example: {json.dumps(delegations[0], indent=2)}")
    
    delegators = []
    for d in delegations:
        if "delegation" in d and "delegator_address" in d["delegation"]:
            delegators.append(d["delegation"]["delegator_address"])
            
    print(f"[Info] Found {len(delegators)} delegators for validator {validator_addr}")
    # if delegators:
    #     print(f"[Debug] First delegator example: {delegators[0]}")
    return delegators

def get_rewards(delegator_addr: str, validator_addr: str) -> List[TokenAmount]:
    """
    Get rewards for a delegator from a validator
    
    Returns:
        List[TokenAmount]: List of raw token amounts
    """
    response = run_lavad_command(f"lavad query distribution rewards {delegator_addr} {validator_addr}")
    
    # Validate response
    if not validate_response(response, ["rewards"], f"Rewards for {delegator_addr} from {validator_addr}"):
        return []
        
    # Check rewards array
    rewards_array = response["rewards"]
    # if rewards_array:
    #     print(f"[Debug] First reward example: {json.dumps(rewards_array[0], indent=2)}")
    
    # Format tokens for processing
    tokens: List[TokenAmount] = []
    for reward in rewards_array:
        try:
            amount = str(reward.get("amount", "0"))
            denom = str(reward.get("denom", ""))
            if float(amount) > 0 and denom:
                tokens.append({
                    "amount": amount,
                    "denom": denom
                })
        except (ValueError, TypeError) as e:
            print(f"[Debug] Invalid reward format: {json.dumps(reward, indent=2)}")
            print(f"[Debug] Error: {str(e)}")
            continue
    
    return tokens

def process_validator(validator_addr: str) -> Optional[ValidatorRewards]:
    """Process a single validator and all its delegators"""
    try:
        # Get all delegators for this validator
        delegators = get_delegators_for_validator(validator_addr)
        if not delegators:
            return None
            
        # Get rewards for each delegator
        all_tokens: List[TokenAmount] = []
        
        for delegator in delegators:
            tokens = get_rewards(delegator, validator_addr)
            all_tokens.extend(tokens)
            
        if not all_tokens:
            return None
            
        # Process all tokens together
        processed = process_token_array(all_tokens)
        
        # Update progress
        with counter_lock:
            completed_count.value += 1
            if completed_count.value % 10 == 0 or completed_count.value == total_count.value:
                print(f"[Progress] Processed {completed_count.value}/{total_count.value} validators")
                
        return {
            "validator_address": validator_addr,
            "total_rewards": processed["tokens"],
            "total_usd": processed["total_usd"],
            "delegator_count": len(delegators),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[Error] Failed processing validator {validator_addr}: {str(e)}")
        return None

def main() -> None:
    """Process all validators and their delegators"""
    try:
        validators = jsinfobe_get_validators()
        if not validators:
            print("[Error] No validators found")
            return
            
        total_count.value = len(validators)
        print(f"[Start] Processing {len(validators)} validators...")
        
        num_processes = max(1, cpu_count() - 1)
        print(f"[Setup] Using {num_processes} processes")
        
        # Use context manager and set timeout
        with Pool(num_processes) as pool:
            try:
                results = pool.map_async(process_validator, validators)
                # Wait with timeout to ensure proper cleanup
                results = results.get(timeout=3600)  # 1 hour timeout
            except TimeoutError:
                print("[Error] Processing timed out after 1 hour")
                return
            finally:
                pool.close()
                pool.join()
        
        # Filter out None results
        valid_results = [r for r in results if r is not None]
        
        # Calculate totals
        total_delegators = sum(r["delegator_count"] for r in valid_results)
        total_usd = sum(r["total_usd"] for r in valid_results)
        
        final_results: FinalResults = {
            "validators": valid_results,
            "total_validators": len(validators),
            "total_delegators": total_delegators,
            "total_usd": total_usd,
        }
        
        filename = f"validator_delegator_rewards_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
        print(f"[Summary] Found {len(valid_results)} validators with rewards")
        print(f"[Summary] Total delegators processed: {total_delegators}")
        print(f"[Summary] Total USD value: ${total_usd:,.2f}")
        print(f"[Summary] Writing to {filename}")
        
        save_json(final_results, filename)
            
    except KeyboardInterrupt:
        print("\n[Interrupt] Gracefully shutting down...")
    except Exception as e:
        print(f"[Fatal Error] {str(e)}")
        raise
    finally:
        # Cleanup any remaining processes
        if 'pool' in locals():
            pool.terminate()
            pool.join()

if __name__ == "__main__":
    main() 