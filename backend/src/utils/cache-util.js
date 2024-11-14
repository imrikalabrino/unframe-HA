const cache = {};
const EXPIRATION_TIME = 300000;

/**
 * Sets a value in the cache with a specific key, including a timestamp.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to store in the cache.
 */
const set = (key, value) => {
    cache[key] = {
        value,
        timestamp: Date.now()
    };
};

/**
 * Retrieves a value from the cache if it exists and has not expired.
 *
 * @param {string} key - The key of the cached value to retrieve.
 * @returns {*} - The cached value if it exists and is not expired; otherwise, null.
 */
const get = (key) => {
    const cachedData = cache[key];
    if (cachedData) {
        if (Date.now() - cachedData.timestamp < EXPIRATION_TIME) {
            // Reset the timestamp to extend the expiration time on access
            cache[key].timestamp = Date.now();
            return cachedData.value;
        } else {
            // Remove expired data from the cache
            delete cache[key];
        }
    }
    return null;
};

/**
 * Clears a specific key and its value from the cache.
 *
 * @param {string} key - The key of the cached value to remove.
 */
const clear = (key) => {
    delete cache[key];
};

export default {
    set,
    get,
    clear
};
