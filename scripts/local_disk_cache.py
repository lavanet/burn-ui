
import os
from datetime import datetime, timedelta
import pickle

script_dir = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(script_dir, "cache")
CACHE_DURATION = timedelta(hours=1)  # Cache data for 24 hours

# Create cache directory if it doesn't exist
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cache_path(prefix: str, address: str) -> str:
    """Get the cache file path for a given address"""
    # Create a safe filename from the address
    safe_filename = address.replace('/', '_').replace('\\', '_')
    cache_path = os.path.join(CACHE_DIR, f"{prefix}_{safe_filename}.pickle")
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    
    return cache_path

def is_cache_valid(cache_path: str) -> bool:
    """Check if cache file exists and is within cache duration"""
    if not os.path.exists(cache_path):
        return False
    
    cache_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
    return datetime.now() - cache_time < CACHE_DURATION

def save_to_cache(data: dict, cache_path: str) -> None:
    """Save data to cache file"""
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        
        with open(cache_path, 'wb') as f:
            pickle.dump(data, f)
    except Exception as e:
        print(f"Warning: Failed to save cache to {cache_path}: {e}")

def load_from_cache(cache_path: str) -> dict:
    """Load data from cache file"""
    with open(cache_path, 'rb') as f:
        return pickle.load(f)