import json
from shapely.geometry import shape, Point

# AIzaSyB1wo7UA3hpTNz0ozRFgJJfTGKkv7gphBk
# load GeoJSON file containing sectors
with open('wards.geo.json', 'r') as f:
    js = json.load(f)

# construct point based on lat/long returned by geocoder
point = Point(-80.2433517, 43.5475388)

# check each polygon to see if it contains the point
for feature in js['features']:
    polygon = shape(feature['geometry'])
    if polygon.contains(point):
        print('Found containing polygon:', feature["properties"]["WARD"])
