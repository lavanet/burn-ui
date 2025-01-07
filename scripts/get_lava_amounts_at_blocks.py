import json
import sys
from typing import Dict, List
from run_lavad_command import run_lavad_command
from utils import save_json
from datetime import datetime, timezone

BLOCK_HEIGHTS_FILE = "block_heights_2025-01-07_17-24-22.json"

def get_lava_amount_at_height(height: int) -> int:
    """Get LAVA amount at specific block height"""
    try:
        response = run_lavad_command(f"lavad q bank total --height {height}")
        
        # Find the ulava entry
        for supply in response["supply"]:
            if supply["denom"] == "ulava":
                return int(supply["amount"])
        
        raise Exception(f"No ulava found in response at height {height}")
        
    except Exception as e:
        print(f"Error getting amount for height {height}: {e}")
        sys.exit(1)

def load_block_heights() -> List[Dict]:
    """Load block heights from JSON file"""
    try:
        with open(BLOCK_HEIGHTS_FILE, 'r') as f:
            data = json.load(f)
            # Filter only blocks from the 17th
            blocks = [block for block in data["blocks"] if block["date"].endswith("-17")]
            return blocks
    except Exception as e:
        print(f"Error loading block heights: {e}")
        sys.exit(1)

def main():
    try:
        blocks = load_block_heights()
        enriched_blocks = []
        prev_amount = None
        
        print(f"Processing {len(blocks)} blocks (17th of each month)...")
        
        for block in blocks:
            height = block["height"]
            amount = get_lava_amount_at_height(height)
            
            # Create enriched block data with all original fields
            enriched_block = block.copy()
            enriched_block.update({
                "ulava_amount": amount
            })
            
            # Calculate difference if we have a previous amount
            if prev_amount is not None:
                enriched_block["ulava_diff"] = amount - prev_amount
            
            enriched_blocks.append(enriched_block)
            prev_amount = amount
            
            print(f"Block {height} ({block['date']}): {amount:,} ulava")
            if "ulava_diff" in enriched_block:
                print(f"Difference: {enriched_block['ulava_diff']:,} ulava")
            print("---")
        
        save_json({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "latest_height": blocks[0]["height"],
            "blocks": enriched_blocks
        }, "lava_amounts_at_blocks.json")
        
        print(f"\nSaved {len(enriched_blocks)} enriched blocks to lava_amounts_at_blocks.json")

    except Exception as e:
        print(f"Fatal error in main: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

