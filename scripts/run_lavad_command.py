import subprocess
import json
from consts import RPC_URL

def run_lavad_command(command):
    try:
        if command.startswith("lavad"):
            command = command[5:]
        # Add the node argument to each command
        full_command = f"lavad {command} --node {RPC_URL} --output json"
        result = subprocess.run(full_command.split(), capture_output=True, text=True)
        if " Unknown desc = cannot estimate rewards, cannot get claim" in result.stderr:
            return None
        if result.stderr:
            print(f"Command stderr: {result.stderr} for command: {full_command}")
        return json.loads(result.stdout) if result.stdout else None
    except json.JSONDecodeError as e:
        print(f"JSON decode error for command '{command}': {e}")
        print(f"Raw output: {result.stdout}")
        return None
    except Exception as e:
        print(f"Error running command '{command}': {e}")
        print(f"Error type: {type(e)}")
        return None