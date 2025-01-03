import json
from datetime import datetime
from typing import List, Optional, TypedDict, Any
from run_lavad_command import run_lavad_command
from get_usd_value_from_token import process_token_array, TokenAmount
from jsinfobe_fetch import jsinfobe_get_validators
from multiprocessing import Pool, cpu_count, Value, Lock
from ctypes import c_int
from multiprocessing.pool import TimeoutError
from get_usd_value_from_token import ProcessedToken, TokenAmount
from utils import save_json

class ProcessedRewards(TypedDict):
    tokens: List[ProcessedToken]
    total_usd: float

class ValidatorResult(TypedDict):
    address: str
    rewards: ProcessedRewards
    timestamp: str

class FinalResults(TypedDict):
    validators: List[ValidatorResult]
    total_validators: int
    validators_with_rewards: int
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
        
    if not isinstance(response, dict):
        print(f"[Debug] {context}: Response is not a dict: {type(response)}")
        return False
        
    for field in expected_fields:
        if field not in response:
            print(f"[Debug] {context}: Missing field '{field}'")
            print(f"[Debug] {context}: Full response: {json.dumps(response, indent=2)}")
            return False
    return True

def get_validator_rewards(validator_address: str) -> Optional[ValidatorResult]:
    """
    Get validator rewards from distribution info and outstanding rewards
    
    Args:
        validator_address: The validator's operator address
        
    Returns:
        Optional[ValidatorResult]: Processed validator result or None if error
    """
    try:
        tokens: List[TokenAmount] = []
        
        # Get self-bond rewards
        dist_info = run_lavad_command(f"lavad q distribution validator-distribution-info {validator_address}")
        if validate_response(dist_info, ["self_bond_rewards"], f"Distribution info for {validator_address}"):
            for reward in dist_info["self_bond_rewards"]:
                try:
                    amount = str(reward.get("amount", "0"))
                    denom = str(reward.get("denom", ""))
                    if float(amount) > 0 and denom:
                        tokens.append({
                            "amount": amount,
                            "denom": denom
                        })
                except (ValueError, TypeError) as e:
                    print(f"[Debug] Invalid self-bond reward format: {json.dumps(reward, indent=2)}")
                    continue
        
        # Get outstanding rewards
        outstanding = run_lavad_command(f"lavad q distribution validator-outstanding-rewards {validator_address}")
        if validate_response(outstanding, ["rewards"], f"Outstanding rewards for {validator_address}"):
            for reward in outstanding["rewards"]:
                try:
                    amount = str(reward.get("amount", "0"))
                    denom = str(reward.get("denom", ""))
                    if float(amount) > 0 and denom:
                        tokens.append({
                            "amount": amount,
                            "denom": denom
                        })
                except (ValueError, TypeError) as e:
                    print(f"[Debug] Invalid outstanding reward format: {json.dumps(reward, indent=2)}")
                    continue
        
        if not tokens:
            return None
            
        # Process tokens
        processed = process_token_array(tokens)
        if not processed["tokens"] and processed["total_usd"] <= 0:
            return None
            
        # Update progress
        with counter_lock:
            completed_count.value += 1
            if completed_count.value % 10 == 0 or completed_count.value == total_count.value:
                print(f"[Progress] Processed {completed_count.value}/{total_count.value} validators")
        
        return {
            "address": validator_address,
            "rewards": processed,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"[Error] Failed processing validator {validator_address}: {str(e)}")
        return None

def main() -> None:
    """Process all validators and their rewards"""
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
                results = pool.map_async(get_validator_rewards, validators)
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
        total_usd = sum(r["rewards"]["total_usd"] for r in valid_results)
        
        final_results: FinalResults = {
            "validators": valid_results,
            "total_validators": len(validators),
            "validators_with_rewards": len(valid_results),
            "total_usd": total_usd,
        }
        
        filename = f"validator_rewards_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
        print(f"[Summary] Found {len(valid_results)} validators with rewards")
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