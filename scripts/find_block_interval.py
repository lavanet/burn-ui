import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Tuple
from tqdm import tqdm
import argparse
import sys
import time
from consts import RPC_URL
from multiprocessing import Pool, cpu_count

BLOCKS_PER_DAY = 6000
BLOCKS_PER_HOUR = BLOCKS_PER_DAY // 24
block_time_cache = {}

def run_lavad_command(command: str) -> Optional[Dict]:
    """Execute a lavad command and return parsed JSON response"""
    try:
        full_command = f"{command} -n {RPC_URL}"
        result = subprocess.run(full_command.split(), capture_output=True, text=True)
        
        if result.stderr:
            if "must be less than or equal to the current blockchain height" in result.stderr:
                print("Error: Attempted to query future block")
                sys.exit(1)
            elif "not found" not in result.stderr:
                print(f"Command stderr: {result.stderr}")
            
        return json.loads(result.stdout) if result.stdout else None
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        return None

def get_latest_block() -> Optional[int]:
    """Get the latest block height"""
    response = run_lavad_command("lavad q block")
    if not response:
        return None
    return int(response["block"]["header"]["height"])

def get_block_time(height: int, latest_height: int) -> Optional[datetime]:
    """Get block timestamp for a given height with caching"""
    # Check cache first
    if height in block_time_cache:
        return block_time_cache[height]
        
    try:
        # Prevent querying future blocks
        if height > latest_height:
            return None
            
        response = run_lavad_command(f"lavad q block {height}")
        if not response:
            return None
        
        time_str = response["block"]["header"]["time"]
        block_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
        
        # Cache the result
        block_time_cache[height] = block_time
        return block_time
        
    except Exception as e:
        print(f"Error getting block time for height {height}: {e}")
        return None

def estimate_blocks_between_times(time1: datetime, time2: datetime) -> int:
    """Estimate number of blocks between two timestamps"""
    time_diff = abs((time1 - time2).total_seconds())
    return int(time_diff * (BLOCKS_PER_DAY / 86400))

def find_midnight_block(search_params: Tuple[int, datetime, int]) -> Optional[Dict]:
    """Find block closest to midnight using binary search with refinements"""
    base_height, target_date, latest_height = search_params
    closest_block = None
    smallest_diff = float('inf')
    
    target_midnight = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    print(f"\nSearching for midnight block on {target_midnight.date()}")
    
    # Try multiple search ranges if needed
    search_multipliers = [2, 4, 8]  # Will try ±2h, ±4h, ±8h
    
    for multiplier in search_multipliers:
        # Get initial block time to better estimate search range
        base_time = get_block_time(base_height, latest_height)
        if not base_time:
            continue
            
        # Estimate blocks to midnight based on time difference
        time_diff = (base_time - target_midnight).total_seconds()
        blocks_to_midnight = int(time_diff * (BLOCKS_PER_DAY / 86400))
        initial_guess = base_height - blocks_to_midnight
        
        # Binary search with expanding bounds
        search_range = BLOCKS_PER_HOUR * multiplier
        left = initial_guess - search_range
        right = initial_guess + search_range
        
        print(f"Attempt {multiplier//2}: Searching ±{multiplier} hours")
        
        # Binary search
        while left <= right:
            mid = (left + right) // 2
            block_time = get_block_time(mid, latest_height)
            if not block_time:
                continue
                
            time_diff = (block_time - target_midnight).total_seconds()
            abs_diff = abs(time_diff)
            
            if abs_diff < smallest_diff:
                smallest_diff = abs_diff
                closest_block = {
                    "height": mid,
                    "block_time": block_time.isoformat(),
                    "seconds_from_midnight": abs_diff,
                    "target_date": target_date.date().isoformat()
                }
                
                if abs_diff < 60:  # Within a minute
                    break
            
            if time_diff > 0:
                right = mid - 1
            else:
                left = mid + 1
        
        # Fine search around best block
        if closest_block:
            best_height = closest_block["height"]
            for height in range(best_height - 25, best_height + 25):
                block_time = get_block_time(height, latest_height)
                if not block_time:
                    continue
                    
                time_diff = abs((block_time - target_midnight).total_seconds())
                
                if time_diff < smallest_diff:
                    smallest_diff = time_diff
                    closest_block = {
                        "height": height,
                        "block_time": block_time.isoformat(),
                        "seconds_from_midnight": time_diff,
                        "target_date": target_date.date().isoformat()
                    }
                    
                if time_diff < 5:  # Within 5 seconds
                    print(f"Found excellent block: {height} ({time_diff:.1f}s from midnight)")
                    return closest_block
        
        # If we found a block within 1 minute, we're done
        if closest_block and closest_block["seconds_from_midnight"] < 60:
            print(f"Found good block: {closest_block['height']} ({closest_block['seconds_from_midnight']:.1f}s from midnight)")
            return closest_block
        
        # Otherwise, try larger search range
        print(f"Best so far: {closest_block['height']} ({closest_block['seconds_from_midnight']:.1f}s from midnight)")
    
    # If we get here, we've tried all ranges
    if closest_block:
        print(f"Warning: Best block {closest_block['height']} is {closest_block['seconds_from_midnight']:.1f}s from midnight")
    
    return closest_block

def get_midnight_blocks(start_height: int, days: int = 30) -> List[Dict]:
    """Get blocks closest to midnight for the specified number of days in parallel"""
    latest_height = get_latest_block()
    if not latest_height:
        print("Error: Could not get latest block height")
        sys.exit(1)
        
    print(f"Latest block height: {latest_height}")
    current_height = min(start_height, latest_height - 100)
    print(f"Starting search from block: {current_height}")
    
    current_time = get_block_time(current_height, latest_height)
    if not current_time:
        return []
    
    # Prepare search parameters for each day
    search_params = []
    for day in range(days):
        target_date = current_time - timedelta(days=day)
        time_diff = (current_time - target_date.replace(hour=0, minute=0, second=0, microsecond=0))
        estimated_blocks = int(time_diff.total_seconds() * (BLOCKS_PER_DAY / 86400))
        estimated_height = current_height - estimated_blocks
        search_params.append((estimated_height, target_date, latest_height))
    
    # Run searches in parallel
    num_processes = min(cpu_count(), 8)  # Limit to 8 processes
    print(f"\nSearching with {num_processes} parallel processes...")
    
    results = []
    with Pool(num_processes) as pool:
        results = list(tqdm(
            pool.imap(find_midnight_block, search_params),
            total=days,
            desc="Finding midnight blocks"
        ))
    
    # Filter out None results and sort by date
    results = [r for r in results if r is not None]
    results.sort(key=lambda x: x["target_date"], reverse=True)
    
    # Add days_ago field
    for i, result in enumerate(results):
        result["days_ago"] = i
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Find blocks at midnight')
    parser.add_argument('--height', type=int, help='Starting block height (optional)')
    parser.add_argument('--days', type=int, default=30, help='Number of days to look back (default: 30)')
    args = parser.parse_args()
    
    if args.height:
        start_height = args.height
    else:
        latest_height = get_latest_block()
        if not latest_height:
            print("Error: Could not get latest block")
            return
        start_height = latest_height
    
    results = get_midnight_blocks(start_height, args.days)
    latest_height = get_latest_block()
    
    # Print results
    print("\nMidnight Blocks:")
    print("-" * 50)
    for result in results:
        if result["days_ago"] == 0:
            time_desc = "Today"
        elif result["days_ago"] == 1:
            time_desc = "Yesterday"
        else:
            time_desc = f"{result['days_ago']} days ago"
            
        print(f"{time_desc:12} Block {result['height']} at {result['block_time']}")
        print(f"            ({result['seconds_from_midnight']:.1f} seconds from midnight)")
    
    # Save results
    filename = f"midnight_blocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "latest_height": latest_height,
            "days": args.days,
            "blocks_per_day": BLOCKS_PER_DAY,
            "data": results
        }, f, indent=2)
    print(f"\nDetailed results saved to {filename}")

if __name__ == "__main__":
    main() 