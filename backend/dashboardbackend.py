"""
Backend server for Data Breach Dashboard
Features:
- Caches API request from HaveIBeenPwned.com
- Data processing
    - NLP to extract extra features
    - Graph data generation
    - Trend prediction on time-series graph data
- Serves this data on an internal API

Implementation notes:
- Uses Python's pickle module to serialise the response for on-disk storage
- Alternative would be to use endpoint caching built into Flask, 
    but this does not persist between server restarts
- On-disk caching chosen due to long cache TTL
"""

from flask import Flask, jsonify
import requests

from dataprocessing.calculate_graph_data import calculate_graph_data
from dataprocessing.nlp import nlp
from data import *


app = Flask(__name__)
logger = app.logger # Use Flask's logger instance


@app.route("/api")  # type: ignore
def api_root():
    # Default api endpoint returns all breaches
    return all_breaches()


@app.route("/api/breaches")  # type: ignore
def all_breaches():
    # Check cache; if expired, retrive new list from HIBP
    try_expire_cache()
    data = fetch_breaches_data()
    return jsonify(data)


@app.route("/api/statistics")
def statistics():
    data = get_statistics()
    return jsonify(data)


@app.route("/api/clearCache")
def force_clear():
    logger.info("Cache forced to clear")
    clear_cache()
    return "Success"


@app.route("/api/checkCache")
def check_cache():
    logger.info("Checking cache status")
    res = try_expire_cache()
    # Return some basic status message to give indication of result
    return "Cache cleared" if res else "Cache still valid"


def fetch_breaches_data() -> list[dict]:
    '''
    Retrieve the breaches data. If not cached, then is retrieved from HIBP, so can throw exceptions
    '''
    data = get_cache_data()
    if data == None:
        logger.info("Fetching HIBP")
        response = requests.get("https://haveibeenpwned.com/api/v3/breaches")
        data = response.json()
        augment_data(data)
        set_cache(data)
    return data


def augment_data(data: list):
    '''
    Performs in-place data processing using NLP
    '''
    for entry in data:
        description = entry.get("Description", "")
        isHashed, isSalted, hashAlgo = nlp(description)
        entry["isHashed"] = isHashed
        entry["isSalted"] = isSalted
        entry["hashAlgo"] = hashAlgo


def get_statistics() -> list[dict[str, object]]:
    '''
    Calculate and return a dictionary of statistics about the current data
    '''
    stats = get_cache_statistics()
    if stats == None:
        # calculate stats
        data = fetch_breaches_data()
        stats = calculate_graph_data(data)
        set_cache(statistics=stats)

    return stats


if __name__ == "__main__":
    app.run()
