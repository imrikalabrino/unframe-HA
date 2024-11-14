
export default function logger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`;
        console.log(logMessage);
    });
    next();
}
