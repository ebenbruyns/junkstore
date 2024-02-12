#!/usr/bin/env python3
import os
import json
import sys
import os
import json
from collections.abc import MutableMapping

# Build json_fragments by reading content.json files
json_fragments = {}

# Function to merge a dictionary with another dictionary


def update(d, u):
    for k, v in u.items():
        if isinstance(v, MutableMapping):
            d[k] = update(d.get(k, {}), v)
        elif isinstance(v, list):
            if k in d:
                d[k].extend(v)
            else:
                d[k] = v
        else:
            d[k] = v
    return d


queue = ['../../data/Junk-Store/scripts/Extensions', './scripts/Extensions']

while queue:
    current_dir = queue.pop(0)
    if not os.path.exists(current_dir):
        continue
    for entry in os.scandir(current_dir):
        if entry.is_dir():
            queue.append(entry.path)
        elif entry.is_file() and entry.name == 'static.json':
            with open(entry.path) as file:
                try:
                    content = json.load(file)
                    json_fragments = update(json_fragments, content)
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON from {entry.path}: {e}")


# Check if an argument is provided
if len(sys.argv) < 2:
    error = {
        "Type": "Error",
        "Content": {
            "Title": "Error",
            "Message": "Please provide an argument."
        }
    }
    print(json.dumps(error))
    sys.exit(1)

# Get the argument from the command line
argument = sys.argv[1]

# Look up the JSON fragment based on the argument
if argument in json_fragments:
    json_fragment = json_fragments[argument]
    print(json.dumps(json_fragment))
else:
    error = {
        "Type": "Error",
        "Content": {
            "Title": "Error",
            "Message": "Invalid argument."
        }
    }
    print(json.dumps(error))
    sys.exit(1)
