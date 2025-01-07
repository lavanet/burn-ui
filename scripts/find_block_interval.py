import sys
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple, List
from run_lavad_command import run_lavad_command
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
from utils import save_json

BLOCKS_PER_DAY = 6000
BLOCKS_PER_HOUR = BLOCKS_PER_DAY // 24
block_time_cache = {}

def get_latest_height() -> int:
    try:
        return int(run_lavad_command("lavad q block", no_json_output_flag=True)["block"]["header"]["height"])
    except Exception as e:
        print(f"Fatal error getting latest height: {e}")
        sys.exit(1)

def get_block_time(height: int, latest_height: int) -> Optional[datetime]:
    """Get block timestamp for a given height with caching"""
    if height in block_time_cache:
        return block_time_cache[height]
        
    try:            
        if height > latest_height:
            return None
            
        response = run_lavad_command(f"lavad q block {height}", no_json_output_flag=True)
        if not response:
            return None
        
        time_str = response["block"]["header"]["time"]
        block_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
        block_time_cache[height] = block_time
        return block_time
        
    except Exception as e:
        print(f"Error getting block time for height {height}: {e}")
        return None

def find_midnight_block(search_params: Tuple[int, datetime, int]) -> Optional[Dict]:
    """Find block closest to midnight using binary search with refinements"""
    base_height, target_date, latest_height = search_params
    closest_block = None
    smallest_diff = float('inf')
    
    target_midnight = target_date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    
    # First phase: Quick binary search to get approximate area
    left = max(1, base_height - 100000)
    right = min(latest_height, base_height + 100000)
    
    while left <= right:
        mid = (left + right) // 2
        current_time = get_block_time(mid, latest_height)
        if not current_time:
            continue
            
        time_diff = (current_time - target_midnight).total_seconds()
        abs_diff = abs(time_diff)
        
        if abs_diff < smallest_diff:
            smallest_diff = abs_diff
            closest_block = {
                "height": mid,
                "time": current_time.isoformat(),
                "seconds_off": abs_diff,
                "date": target_date.date().isoformat()
            }
            base_height = mid
            
            if abs_diff < 2:
                return closest_block
        
        if time_diff > 0:
            right = mid - 1
        else:
            left = mid + 1
    
    # Second phase: Explore around best block found with big jumps
    if closest_block:
        jumps = [10000, 5000, 1000, 500, 100, 50, 10, 1]
        base = closest_block["height"]
        
        for jump in jumps:
            for mult in [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]:
                height = base + (jump * mult)
                if height < 1 or height > latest_height:
                    continue
                    
                current_time = get_block_time(height, latest_height)
                if not current_time:
                    continue
                    
                time_diff = (current_time - target_midnight).total_seconds()
                abs_diff = abs(time_diff)
                
                if abs_diff < smallest_diff:
                    smallest_diff = abs_diff
                    closest_block = {
                        "height": height,
                        "time": current_time.isoformat(),
                        "seconds_off": abs_diff,
                        "date": target_date.date().isoformat()
                    }
                    base = height
                    
                    if abs_diff < 2:
                        return closest_block
    
    return closest_block

def main():
    try:
        latest_height = get_latest_height()
        print(f"Latest block height: {latest_height}")
        
        # Get current time in UTC
        now = datetime.now(timezone.utc)
        
        # Create search parameters with better initial estimates
        search_params = []
        current_date = now
        
        # Look back 24 months with debug output
        for month in range(24):
            for day in [17, 18]:
                target_date = current_date.replace(day=day, hour=0, minute=0, second=0, microsecond=0)
                if target_date < now:
                    # More precise block estimation
                    days_diff = (now - target_date).total_seconds() / 86400
                    estimated_blocks = int(days_diff * BLOCKS_PER_DAY)
                    estimated_height = latest_height - estimated_blocks
                    
                    # Debug output
                    print(f"Month {month}: {target_date.date()} -> estimated height: {estimated_height}")
                    
                    if estimated_height > 0:
                        search_params.append((estimated_height, target_date, latest_height))
                    else:
                        print(f"Skipping {target_date.date()} - estimated height {estimated_height} too low")
            
            # Move to previous month more precisely
            if current_date.month == 1:
                current_date = current_date.replace(year=current_date.year - 1, month=12, day=1)
            else:
                current_date = current_date.replace(month=current_date.month - 1, day=1)

        print(f"\nGenerated {len(search_params)} search parameters")
        
        # Run searches in parallel with timeout
        num_processes = min(cpu_count(), 8)
        print(f"\nSearching with {num_processes} parallel processes...")
        
        with Pool(num_processes) as pool:
            results = list(tqdm(
                pool.imap_unordered(find_midnight_block, search_params),
                total=len(search_params),
                desc="Finding midnight blocks"
            ))
        
        # Filter and sort results
        results = [r for r in results if r is not None]
        results.sort(key=lambda x: x["date"], reverse=True)
        
        # Save results
        save_json({
            "generated_at": now.isoformat(),
            "latest_height": latest_height,
            "blocks": results
        }, "block_heights.json")
        
        print(f"\nSaved {len(results)} block heights to block_heights.json")

    except Exception as e:
        print(f"Fatal error in main: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 