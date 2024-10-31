const cache = {};
const EXPIRATION_TIME = 300000;

const set = (key, value) => {
    cache[key] = {
        value,
        timestamp: Date.now()
    };
};

const get = (key) => {
    const cachedData = cache[key];
    if (cachedData) {
        if (Date.now() - cachedData.timestamp < EXPIRATION_TIME) {
            return cachedData.value;
        } else {
            delete cache[key];
        }
    }
    return null;
};

const clear = (key) => {
    delete cache[key];
};

module.exports = { set, get, clear };
