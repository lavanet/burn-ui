import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from tqdm import tqdm
import argparse
import sys

from consts import RPC_URL

DAILY_BLOCKS = {
  "generated_at": "2025-01-01T12:13:59.662815",
  "latest_height": 1948523,
  "days": 30,
  "blocks_per_day": 6000,
  "data": [
    {
      "height": 1945887,
      "block_time": "2025-01-01T00:00:02.033026+00:00",
      "seconds_from_midnight": 2.033026,
      "target_date": "2025-01-01",
      "days_ago": 0
    },
    {
      "height": 1940256,
      "block_time": "2024-12-30T23:59:53.178086+00:00",
      "seconds_from_midnight": 6.821914,
      "target_date": "2024-12-31",
      "days_ago": 1
    },
    {
      "height": 1934651,
      "block_time": "2024-12-29T23:59:57.672252+00:00",
      "seconds_from_midnight": 2.327748,
      "target_date": "2024-12-30",
      "days_ago": 2
    },
    {
      "height": 1929044,
      "block_time": "2024-12-28T23:59:56.102144+00:00",
      "seconds_from_midnight": 3.897856,
      "target_date": "2024-12-29",
      "days_ago": 3
    },
    {
      "height": 1923434,
      "block_time": "2024-12-27T23:59:57.664540+00:00",
      "seconds_from_midnight": 2.33546,
      "target_date": "2024-12-28",
      "days_ago": 4
    },
    {
      "height": 1917833,
      "block_time": "2024-12-27T00:00:05.297764+00:00",
      "seconds_from_midnight": 5.297764,
      "target_date": "2024-12-27",
      "days_ago": 5
    },
    {
      "height": 1912233,
      "block_time": "2024-12-26T00:00:03.161262+00:00",
      "seconds_from_midnight": 3.161262,
      "target_date": "2024-12-26",
      "days_ago": 6
    },
    {
      "height": 1906629,
      "block_time": "2024-12-24T23:59:56.435019+00:00",
      "seconds_from_midnight": 3.564981,
      "target_date": "2024-12-25",
      "days_ago": 7
    },
    {
      "height": 1901021,
      "block_time": "2024-12-23T23:59:57.875387+00:00",
      "seconds_from_midnight": 2.124613,
      "target_date": "2024-12-24",
      "days_ago": 8
    },
    {
      "height": 1895390,
      "block_time": "2024-12-23T00:00:03.575574+00:00",
      "seconds_from_midnight": 3.575574,
      "target_date": "2024-12-23",
      "days_ago": 9
    },
    {
      "height": 1889755,
      "block_time": "2024-12-21T23:59:55.905979+00:00",
      "seconds_from_midnight": 4.094021,
      "target_date": "2024-12-22",
      "days_ago": 10
    },
    {
      "height": 1884130,
      "block_time": "2024-12-20T23:59:54.947553+00:00",
      "seconds_from_midnight": 5.052447,
      "target_date": "2024-12-21",
      "days_ago": 11
    },
    {
      "height": 1878502,
      "block_time": "2024-12-19T23:59:58.879009+00:00",
      "seconds_from_midnight": 1.120991,
      "target_date": "2024-12-20",
      "days_ago": 12
    },
    {
      "height": 1872875,
      "block_time": "2024-12-18T23:59:57.969284+00:00",
      "seconds_from_midnight": 2.030716,
      "target_date": "2024-12-19",
      "days_ago": 13
    },
    {
      "height": 1867250,
      "block_time": "2024-12-18T00:00:02.865868+00:00",
      "seconds_from_midnight": 2.865868,
      "target_date": "2024-12-18",
      "days_ago": 14
    },
    {
      "height": 1861626,
      "block_time": "2024-12-17T00:00:02.905317+00:00",
      "seconds_from_midnight": 2.905317,
      "target_date": "2024-12-17",
      "days_ago": 15
    },
    {
      "height": 1856005,
      "block_time": "2024-12-16T00:00:05.148567+00:00",
      "seconds_from_midnight": 5.148567,
      "target_date": "2024-12-16",
      "days_ago": 16
    },
    {
      "height": 1850460,
      "block_time": "2024-12-15T00:00:00.246562+00:00",
      "seconds_from_midnight": 0.246562,
      "target_date": "2024-12-15",
      "days_ago": 17
    },
    {
      "height": 1844864,
      "block_time": "2024-12-14T00:00:03.838265+00:00",
      "seconds_from_midnight": 3.838265,
      "target_date": "2024-12-14",
      "days_ago": 18
    },
    {
      "height": 1839274,
      "block_time": "2024-12-13T00:00:01.828457+00:00",
      "seconds_from_midnight": 1.828457,
      "target_date": "2024-12-13",
      "days_ago": 19
    },
    {
      "height": 1833681,
      "block_time": "2024-12-12T00:00:05.143040+00:00",
      "seconds_from_midnight": 5.14304,
      "target_date": "2024-12-12",
      "days_ago": 20
    },
    {
      "height": 1828088,
      "block_time": "2024-12-10T23:59:57.233227+00:00",
      "seconds_from_midnight": 2.766773,
      "target_date": "2024-12-11",
      "days_ago": 21
    },
    {
      "height": 1822497,
      "block_time": "2024-12-10T00:00:06.441657+00:00",
      "seconds_from_midnight": 6.441657,
      "target_date": "2024-12-10",
      "days_ago": 22
    },
    {
      "height": 1816910,
      "block_time": "2024-12-08T23:59:58.288048+00:00",
      "seconds_from_midnight": 1.711952,
      "target_date": "2024-12-09",
      "days_ago": 23
    },
    {
      "height": 1811322,
      "block_time": "2024-12-07T23:59:52.156443+00:00",
      "seconds_from_midnight": 7.843557,
      "target_date": "2024-12-08",
      "days_ago": 24
    },
    {
      "height": 1805736,
      "block_time": "2024-12-06T23:59:59.682485+00:00",
      "seconds_from_midnight": 0.317515,
      "target_date": "2024-12-07",
      "days_ago": 25
    },
    {
      "height": 1800139,
      "block_time": "2024-12-05T23:59:57.908070+00:00",
      "seconds_from_midnight": 2.09193,
      "target_date": "2024-12-06",
      "days_ago": 26
    },
    {
      "height": 1794544,
      "block_time": "2024-12-04T23:59:53.024190+00:00",
      "seconds_from_midnight": 6.97581,
      "target_date": "2024-12-05",
      "days_ago": 27
    },
    {
      "height": 1788959,
      "block_time": "2024-12-04T00:00:07.150973+00:00",
      "seconds_from_midnight": 7.150973,
      "target_date": "2024-12-04",
      "days_ago": 28
    },
    {
      "height": 1783370,
      "block_time": "2024-12-02T23:59:58.762679+00:00",
      "seconds_from_midnight": 1.237321,
      "target_date": "2024-12-03",
      "days_ago": 29
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
                "block_date": next(b["block_time"] for b in DAILY_BLOCKS["data"] if b["height"] == height),
                "day": datetime.fromisoformat(next(b["block_time"] for b in DAILY_BLOCKS["data"] if b["height"] == height)).date().isoformat()
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
            block_data = next(b for b in DAILY_BLOCKS["data"] if b["height"] == height)
        except StopIteration:
            print(f"Error: Block {height} not found in DAILY_BLOCKS")
            return None
            
        block_time = block_data["block_time"]
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
    blocks_to_process = sorted(DAILY_BLOCKS["data"], key=lambda x: x["height"])
    
    print(f"\nFetching daily supply data...")
    for block_data in tqdm(blocks_to_process):
        height = block_data["height"]
        data = get_daily_supply_data(height)
        
        if data.get("error") == "pruned":
            # Include error data in results
            data["target_date"] = block_data["target_date"]
            data["supply_diff"] = None
            data["supply"] = None
            results.append(data)
            continue
            
        if not data:
            print(f"Warning: Could not get data for block {height}")
            continue
            
        # Add target date from DAILY_BLOCKS for verification
        data["target_date"] = block_data["target_date"]
        
        # Calculate supply difference from previous day
        if previous_supply is not None:
            data["supply_diff"] = previous_supply - data["supply"]
        else:
            data["supply_diff"] = 0
            
        previous_supply = data["supply"]
        results.append(data)
        
        # Verify we got data for the correct day
        block_date = datetime.fromisoformat(data["block_date"].replace("Z", "+00:00")).date()
        target_date = datetime.strptime(block_data["target_date"], "%Y-%m-%d").date()
        if block_date != target_date:
            print(f"Warning: Block {height} date mismatch: expected {target_date}, got {block_date}")
    
    # Sort by block height descending (newest first)
    results.sort(key=lambda x: x["block"], reverse=True)
    
    # Save results
    output = {
        "generated_at": datetime.now().isoformat(),
        "start_block": DAILY_BLOCKS["latest_height"],
        "days": DAILY_BLOCKS["days"],
        "blocks_per_day": DAILY_BLOCKS["blocks_per_day"],
        "data": results
    }
    
    filename = f"burn_rate_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print("\nBurn Rate Summary:")
    print("-" * 50)
    print(f"Latest Block: {DAILY_BLOCKS['latest_height']}")
    print(f"Days Tracked: {DAILY_BLOCKS['days']}")
    print(f"Data Points: {len(results)}")
    print(f"Missing Points: {DAILY_BLOCKS['days'] - len(results)}")
    
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