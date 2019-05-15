module.exports = (...args) => args.reduce((obj, arg) => "function" === typeof arg && obj ? arg(obj) : obj[arg] || false)
