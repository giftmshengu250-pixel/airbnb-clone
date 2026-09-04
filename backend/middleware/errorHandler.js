// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Catches any error thrown/passed in the app and returns a clean JSON response
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong on the server",
  });
};

module.exports = { notFound, errorHandler };
