const err = new Error('Test Error');
err.statusCode = 400;

let error = { ...err };
error.message = err.message;

console.log('err.statusCode:', err.statusCode);
console.log('error.statusCode:', error.statusCode);
console.log('status to send:', err.statusCode || 500);
