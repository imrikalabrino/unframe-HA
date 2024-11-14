export default function errorHandler(err, req, res, next) {
    const errorMessage = `[${new Date().toISOString()}] Error in ${req.method} ${req.url}: ${err.message}\nStack: ${err.stack}`;
    console.error(errorMessage);

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    });
}
