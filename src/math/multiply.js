const add = require('./add.js');
const subtract = require('./subtract.js');

const multiply = (a, b, base = a) => {
  if (b <= 1) return a;
  return multiply(add(a, base), subtract(b, 1), base);
};

module.exports = multiply;