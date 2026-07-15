import pickle
import os
import time


"""
Logic for cache data storage

cache : dict
cache['retrieve_time'] : int (time last retrieved)
cache['data'] : str (the json data)
"""


CACHE_FILE = "cache/breach_cache.pkl"
CACHE_TTL = 60*60*24*7  # Every 7 days


def load_cache() -> dict:
    '''
    Load the cache from disk (if available)
    '''
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "rb") as file:
            try:
                new_cache = pickle.load(file)  # type: ignore
                # print(new_cache)
                if not isinstance(new_cache, dict):
                    new_cache = clear_cache()
            except Exception:
                # logger.exception(f"Failed to read cache")
                new_cache = clear_cache()  # Corrupted cache
        return new_cache
    # logger.warning("Path not found")
    return {}


def set_cache(data=None, statistics=None) -> None:
    '''
    Update the cache and write changes to disk
    '''
    if data is not None:
        _cache["data"] = data
    if statistics is not None:
        _cache["statistics"] = statistics
    _cache["retrieve_time"] = time.time()
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "wb") as file:
        pickle.dump(_cache, file)


# Globally accessible cache
_cache: dict = load_cache()


def clear_cache() -> dict:
    '''
    Clears the cache by removing the cache file
    '''
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
    global _cache
    _cache = {}
    return _cache


def try_expire_cache() -> bool:
    '''
    Checks if the cache lifespan has exceeded its time-to-live and if so clears it
    '''
    if _get_cache("retrieve_time", -1) < time.time() - CACHE_TTL:
        # logger.info("Cache expired")
        clear_cache()
        return True
    return False


def _get_cache(key, default=None):
    '''
    Returns a specific item from the cache, or a default value if not found
    '''
    return _cache.get(key, default)


def get_cache_data() -> list|None:
    '''
    Returns the cached data series or None if cache is empty
    '''
    return _get_cache("data")


def get_cache_statistics() -> list|None:
    '''
    Returns the cached list of statistics or None if cache is empty
    '''
    return _get_cache("statistics")
