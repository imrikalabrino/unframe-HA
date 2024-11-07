const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/requests.log');

fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

function logger(req, res, next) {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}`;
    console.log(logMessage);

    next();
}

module.exports = logger;
