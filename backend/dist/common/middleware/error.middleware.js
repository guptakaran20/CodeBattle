export const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack || err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.errorCode || 'SERVER_ERR_001';
    res.status(statusCode).json({
        success: false,
        message,
        errorCode,
    });
};
//# sourceMappingURL=error.middleware.js.map