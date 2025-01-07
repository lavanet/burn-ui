import json
from datetime import datetime, timedelta
from typing import Dict, Optional
from run_lavad_command import run_lavad_command

BLOCKS_PER_DAY = 6000
BLOCKS_PER_HOUR = BLOCKS_PER_DAY // 24
block_time_cache = {}

def get_latest_height() -> int:
    return int(run_lavad_command("lavad q block", no_json_output_flag=True)["block"]["header"]["height"])

def get_block_at_time(height: int) -> datetime:
    """Get block timestamp for a given height with caching"""
    # Check cache first
    if height in block_time_cache:
        return block_time_cache[height]
        
    try:            
        response = run_lavad_command(f"lavad q block {height}")
        if not response:
            raise Exception("Failed to get block data")
        
        time_str = response["block"]["header"]["time"]
        block_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
        
        # Cache the result
        block_time_cache[height] = block_time
        return block_time
        
    except Exception as e:
        print(f"Error getting block time for height {height}: {e}")
        raise e

def find_midnight_block(target_date: datetime, initial_height: int) -> Optional[Dict]:
    """Find block closest to midnight using binary search with expanding ranges"""
    closest_block = None
    smallest_diff = float('inf')
    
    # Try increasingly larger ranges around the initial height
    ranges = [100, 500, 2000, 5000]  # Block ranges to search
    
    for block_range in ranges:
        left = initial_height - block_range
        right = initial_height + block_range
        
        while left <= right:
            mid = (left + right) // 2
            block_time = get_block_at_time(mid)
            
            if not block_time:
                continue
                
            time_diff = abs((block_time - target_date).total_seconds())
            
            if time_diff < smallest_diff:
                smallest_diff = time_diff
                closest_block = {
                    "height": mid,
                    "time": block_time.isoformat(),
                    "seconds_off": time_diff
                }
                
                if time_diff < 30:  # Within 30 seconds
                    # Fine-tune around this block
                    for h in range(mid - 10, mid + 10):
                        bt = get_block_at_time(h)
                        if bt:
                            tdiff = abs((bt - target_date).total_seconds())
                            if tdiff < smallest_diff:
                                smallest_diff = tdiff
                                closest_block = {
                                    "height": h,
                                    "time": bt.isoformat(),
                                    "seconds_off": tdiff
                                }
                    return closest_block
            
            if block_time > target_date:
                right = mid - 1
            else:
                left = mid + 1
                
        if smallest_diff < 300:  # Within 5 minutes
            break
            
    return closest_block

def main():
    # Get current time
    now = datetime.now()
    
    # Create list of dates (17th and 18th of each month for past year)
    dates = []
    current_date = now
    for _ in range(12):  # Past 12 months
        month_17th = current_date.replace(day=17, hour=0, minute=0, second=0, microsecond=0)
        month_18th = current_date.replace(day=18, hour=0, minute=0, second=0, microsecond=0)
        
        if month_17th < now:
            dates.append(month_17th)
        if month_18th < now:
            dates.append(month_18th)
            
        current_date = (current_date.replace(day=1) - timedelta(days=1))

    # Process dates
    blocks = []
    for date in sorted(dates):
        print(f"\nProcessing {date.strftime('%Y-%m-%d')}...")
        
        # First try block-at-time query
        initial_height = get_block_at_time(date)
        if not initial_height:
            # Fallback to estimation
            days_ago = (now - date).days
            initial_height = get_latest_height() - (days_ago * BLOCKS_PER_DAY)
        
        # Find precise midnight block
        result = find_midnight_block(date, initial_height)
        if result:
            blocks.append({
                "date": date.strftime("%Y-%m-%d"),
                "block": result["height"],
                "block_time": result["time"],
                "accuracy_seconds": result["seconds_off"]
            })
            print(f"Found block {result['height']} ({result['seconds_off']:.1f}s from target)")

    # Save results
    with open('block_heights.json', 'w') as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "blocks": blocks
        }, f, indent=2)
        print(f"\nSaved {len(blocks)} block heights to block_heights.json")

if __name__ == "__main__":
    main() 