// Higher-order function that takes a function `fn` 
// and returns a new function that wraps `fn` in a try/catch block.
const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
