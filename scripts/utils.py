import json
from datetime import datetime

def save_json(data, filename):
    data["timestamp"] = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    with open(f"{filename}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json", "w") as f:
        json.dump(data, f, indent=2)