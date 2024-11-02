const fs = require('fs');
const path = require('path');

const errorLogPath = path.join(__dirname, '../logs/error.log');

fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });

function errorHandler(err, req, res, next) {
    const errorMessage = `[${new Date().toISOString()}] Error in ${req.method} ${req.url}: ${err.message}\nStack: ${err.stack}`;
    console.error(errorMessage);

    fs.appendFile(errorLogPath, errorMessage + '\n', (err) => {
        if (err) {
            console.error('Failed to write error log:', err);
        }
    });

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    });
}

module.exports = errorHandler;
