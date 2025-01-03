import subprocess
import json
import hashlib
from typing import Optional, Dict, Any
from local_disk_cache import get_cache_path, is_cache_valid, load_from_cache, save_to_cache
from consts import RPC_URL

def get_command_hash(command: str) -> str:
    """Create a unique hash for the command to use as cache key"""
    return hashlib.md5(command.encode()).hexdigest()

def run_lavad_command(command: str) -> Optional[Dict[str, Any]]:
    """
    Run a lavad command with caching
    
    Args:
        command: The lavad command to run
        
    Returns:
        Optional[Dict[str, Any]]: The command result as JSON or None if error
    """
    try:
        # Clean up command
        if command.startswith("lavad"):
            command = command[5:]
            
        # Add the node argument
        full_command = f"lavad {command} --node {RPC_URL} --output json"
        
        # Check cache first
        cache_key = get_command_hash(full_command)
        cache_path = get_cache_path('lavad_cmd', cache_key)
        
        if is_cache_valid(cache_path):
            data = load_from_cache(cache_path)
            if data == "Cannot estimate rewards, cannot get claim":
                return None
            if data is None:
                pass
            else:
                return data
            
        # Run command if not in cache
        result = subprocess.run(full_command.split(), capture_output=True, text=True)
        
        # Handle known error cases
        if " Unknown desc = cannot estimate rewards, cannot get claim" in result.stderr:
            print(f"[Command Error] {full_command}: Cannot estimate rewards, cannot get claim")
            save_to_cache("Cannot estimate rewards, cannot get claim", cache_path)  # Cache the None result
            return None
            
        # Log stderr if present
        if result.stderr:
            print(f"[Command Error] stderr: {result.stderr}")
            print(f"[Command Error] full command: {full_command}")
            
        # Parse and cache result
        if result.stdout:
            try:
                parsed_result = json.loads(result.stdout)
                save_to_cache(parsed_result, cache_path)
                return parsed_result
            except json.JSONDecodeError as e:
                print(f"[JSON Error] Failed to parse command output: {e}")
                print(f"[JSON Error] Raw output: {result.stdout}")
                print(f"[JSON Error] Command: {full_command}")
                return None
        else:
            save_to_cache(None, cache_path)
            return None
            
    except Exception as e:
        print(f"[Fatal Error] Failed to run command: {command}")
        print(f"[Fatal Error] Error type: {type(e).__name__}")
        print(f"[Fatal Error] Error details: {str(e)}")
        return None