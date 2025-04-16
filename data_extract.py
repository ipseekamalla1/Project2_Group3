import json
import requests  # Make sure you have installed this library

r = requests.get('https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Coronavirus_2019_nCoV_Cases/FeatureServer/1/query?where=1%3D1&outFields=*&outSR=4326&f=json')

# Parse the response text as JSON
data = r.json()

# Save the JSON data to a .json file
with open('data.json', 'w') as outfile:
    json.dump(data, outfile, indent=4)

print("JSON data has been saved to data.json")
