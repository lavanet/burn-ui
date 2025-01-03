import requests
from consts import JSINFOBE_API_PROVIDERS_URL, JSINFOBE_API_VALIDATORS_URL
from typing import List
import json

def jsinfobe_get_providers() -> List[str]:
    """
    Fetch provider list from API
    
    Returns:
        List[str]: List of provider addresses
    """
    try:
        response = requests.get(JSINFOBE_API_PROVIDERS_URL)
        response.raise_for_status()
        data = response.json()
        providers = data.get("providers", [])
        if not providers:
            print("[API Warning] No providers found in API response")
            return []
        print(f"[Info] Found {len(providers)} providers from API")
        return providers
    except requests.exceptions.RequestException as e:
        print(f"[API Error] Failed to fetch providers: {str(e)}")
        return []
    except json.JSONDecodeError as e:
        print(f"[API Error] Invalid JSON response: {str(e)}")
        return []
    except Exception as e:
        print(f"[Fatal Error] Unexpected error fetching providers: {str(e)}")
        return []
    
def jsinfobe_get_validators() -> List[str]:
    """
    Get list of all validators from API
    
    Returns:
        List[str]: List of validator addresses
    """
    try:
        print(f"[Info] Fetching validators from {JSINFOBE_API_VALIDATORS_URL}")
        response = requests.get(JSINFOBE_API_VALIDATORS_URL)
        response.raise_for_status()
        
        data = response.json()
        if not isinstance(data, dict):
            print(f"[API Error] Invalid response format. Expected dict, got {type(data)}")
            print(f"[Debug] Response: {json.dumps(data, indent=2)}")
            return []
            
        validators_data = data.get("validators", [])
        if not validators_data:
            print("[API Error] No validators found in response")
            print(f"[Debug] Available fields: {list(data.keys())}")
            return []
            
        # Extract validator addresses
        validators = []
        for validator in validators_data:
            if "address" not in validator:
                print(f"[Debug] Validator missing address: {json.dumps(validator, indent=2)}")
                continue
                
            address = validator["address"]
            if not address.startswith("lava@valoper"):
                print(f"[Debug] Invalid validator address format: {address}")
                continue
                
            validators.append(address)
            
        if not validators:
            print("[Error] No valid validator addresses found")
            return []
            
        print(f"[Info] Found {len(validators)} validators")
        print(f"[Debug] First validator example: {validators[0]}")
        print(f"[Debug] Last validator example: {validators[-1]}")
        
        return validators
        
    except requests.exceptions.RequestException as e:
        print(f"[API Error] Failed to fetch validators: {str(e)}")
        return []
    except json.JSONDecodeError as e:
        print(f"[API Error] Invalid JSON response: {str(e)}")
        return []
    except Exception as e:
        print(f"[Fatal Error] Unexpected error: {str(e)}")
        print(f"[Debug] Error type: {type(e).__name__}")
        return []