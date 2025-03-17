import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from tqdm import tqdm
import argparse
import sys

from consts import RPC_URL

DAILY_BLOCKS = {
  "generated_at": "2025-03-17T15:57:55.842748+00:00",
  "latest_height": 2405069,
  "blocks": [
    {
      "height": 2404825,
      "time": "2025-03-17T14:59:56.655597+00:00",
      "seconds_off": 3.344403,
      "date": "2025-03-17"
    },
    {
      "height": 2231220,
      "time": "2025-02-17T15:00:05.145270+00:00",
      "seconds_off": 5.14527,
      "date": "2025-02-17"
    },
    {
      "height": 2041986,
      "time": "2025-01-17T15:00:01.226115+00:00",
      "seconds_off": 1.226115,
      "date": "2025-01-17"
    },
    {
      "height": 1865140,
      "time": "2024-12-17T15:00:07.799373+00:00",
      "seconds_off": 7.799373,
      "date": "2024-12-17"
    },
    {
      "height": 1697333,
      "time": "2024-11-17T14:59:54.942203+00:00",
      "seconds_off": 5.057797,
      "date": "2024-11-17"
    },
    {
      "height": 1523587,
      "time": "2024-10-17T15:00:04.108757+00:00",
      "seconds_off": 4.108757,
      "date": "2024-10-17"
    },
    {
      "height": 1355366,
      "time": "2024-09-17T14:59:55.475980+00:00",
      "seconds_off": 4.52402,
      "date": "2024-09-17"
    },
    {
      "height": 1178067,
      "time": "2024-08-17T14:59:59.137731+00:00",
      "seconds_off": 0.862269,
      "date": "2024-08-17"
    },
    {
      "height": 1000894,
      "time": "2024-07-17T15:00:02.761843+00:00",
      "seconds_off": 2.761843,
      "date": "2024-07-17"
    },
    {
      "height": 834407,
      "time": "2024-06-17T14:59:57.864593+00:00",
      "seconds_off": 2.135407,
      "date": "2024-06-17"
    },
    {
      "height": 665999,
      "time": "2024-05-17T15:00:00.021398+00:00",
      "seconds_off": 0.021398,
      "date": "2024-05-17"
    },
    {
      "height": 494642,
      "time": "2024-04-16T06:14:52.656001+00:00",
      "seconds_off": 117907.343999,
      "date": "2024-04-17"
    },
    {
      "height": 308641,
      "time": "2024-03-13T10:05:13.982074+00:00",
      "seconds_off": 363286.017926,
      "date": "2024-03-17"
    },
    {
      "height": 134641,
      "time": "2024-02-10T21:27:23.008430+00:00",
      "seconds_off": 581556.99157,
      "date": "2024-02-17"
    }
  ]
}

def run_lavad_command(command: str) -> Optional[Dict]:
    """Execute a lavad command and return parsed JSON response"""
    try:
        full_command = f"{command} --node {RPC_URL} --output json"
        print(f"Executing: {full_command}")
        
        result = subprocess.run(full_command.split(), capture_output=True, text=True)
                
        # if result.stdout:
        #     print(f"Command stdout: {result.stdout[:500]}...")
            
        return json.loads(result.stdout) if result.stdout else None
    except Exception as e:
        print(f"Error running command: {e}")
        return None

def get_current_block() -> Optional[int]:
    """Get current block height"""
    try:
        response = run_lavad_command("lavad q block")
        if not response:
            return None
        return int(response["block"]["header"]["height"])
    except Exception as e:
        print(f"Error getting current block: {e}")
        return None

def get_daily_supply_data(height: int) -> Optional[Dict]:
    """Get supply data for a specific block height"""
    try:
        # Get supply
        command = f"lavad q bank total --height {height}"
        print(f"\nFetching supply for block {height}")
        
        supply_response = run_lavad_command(command)
        if not supply_response:
            # Return error data instead of None
            return {
                "block": height,
                "error": "pruned",
                "block_date": next(b["time"] for b in DAILY_BLOCKS["blocks"] if b["height"] == height),
                "day": datetime.fromisoformat(next(b["time"] for b in DAILY_BLOCKS["blocks"] if b["height"] == height)).date().isoformat()
            }
            
        # Extract LAVA supply
        lava_supply = 0
        for coin in supply_response.get("supply", []):
            if coin.get("denom") == "ulava":
                lava_supply = float(coin["amount"]) / 1_000_000
                break
                
        if lava_supply == 0:
            print(f"Warning: No LAVA supply found in response: {supply_response}")
            return None
        
        # Get block time from DAILY_BLOCKS
        try:
            block_data = next(b for b in DAILY_BLOCKS["blocks"] if b["height"] == height)
        except StopIteration:
            print(f"Error: Block {height} not found in DAILY_BLOCKS")
            return None
            
        block_time = block_data["time"]
        day = datetime.fromisoformat(block_time).date().isoformat()
        
        return {
            "day": day,
            "block": height,
            "block_date": block_time,
            "supply": lava_supply
        }
        
    except Exception as e:
        print(f"Error getting data for height {height}: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None

def main():
    print("\nUsing predefined midnight blocks...")
    
    results = []
    previous_supply = None
    
    # Process blocks in reverse order (oldest to newest) for proper supply diff calculation
    blocks_to_process = sorted(DAILY_BLOCKS["blocks"], key=lambda x: x["height"])
    
    print(f"\nFetching daily supply data...")
    for block_data in tqdm(blocks_to_process):
        height = block_data["height"]
        data = get_daily_supply_data(height)
        
        if data and data.get("error") == "pruned":
            # Include error data in results
            data["target_date"] = block_data["date"]
            data["supply_diff"] = None
            data["supply"] = None
            results.append(data)
            continue
            
        if not data:
            print(f"Warning: Could not get data for block {height}")
            continue
            
        # Add target date from DAILY_BLOCKS for verification
        data["target_date"] = block_data["date"]
        
        # Calculate supply difference from previous day
        if previous_supply is not None:
            data["supply_diff"] = previous_supply - data["supply"]
        else:
            data["supply_diff"] = 0
            
        previous_supply = data["supply"]
        results.append(data)
        
        # Verify we got data for the correct day
        block_date = datetime.fromisoformat(data["block_date"].replace("Z", "+00:00")).date()
        target_date = datetime.strptime(block_data["date"], "%Y-%m-%d").date()
        if block_date != target_date:
            print(f"Warning: Block {height} date mismatch: expected {target_date}, got {block_date}")
    
    # Sort by block height descending (newest first)
    results.sort(key=lambda x: x["block"], reverse=True)
    
    # Save results
    output = {
        "generated_at": datetime.now().isoformat(),
        "latest_height": DAILY_BLOCKS["latest_height"],
        "blocks": results
    }
    
    filename = f"burn_rate_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print("\nBurn Rate Summary:")
    print("-" * 50)
    print(f"Latest Block: {DAILY_BLOCKS['latest_height']}")
    print(f"Days Tracked: {len(blocks_to_process)}")
    print(f"Data Points: {len(results)}")
    print(f"Missing Points: {len(blocks_to_process) - len(results)}")
    
    if results:
        # Filter out None values before calculating totals
        valid_burns = [r["supply_diff"] for r in results if r["supply_diff"] is not None and r["supply_diff"] > 0]
        total_burned = sum(valid_burns) if valid_burns else 0
        avg_burn_rate = total_burned / len(valid_burns) if valid_burns else 0
        
        print(f"\nTotal LAVA Burned: {total_burned:,.2f}")
        print(f"Average Daily Burn Rate: {avg_burn_rate:,.2f}")
        
        print("\nLatest Data Point:")
        latest = results[0]
        print(f"Day: {latest['day']}")
        print(f"Block: {latest['block']}")
        print(f"Supply: {latest.get('supply', 'N/A')}")
        print(f"24h Burn: {latest.get('supply_diff', 'N/A')}")
        
        # Also print count of pruned blocks
        pruned_count = sum(1 for r in results if r.get("error") == "pruned")
        if pruned_count:
            print(f"\nPruned blocks: {pruned_count}")
    
    print(f"\nResults saved to {filename}")

if __name__ == "__main__":
    main()