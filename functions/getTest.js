const { dig, digDug } = require('./utils')
exports.handler = async (event, context) => {
  digDug()
  return dig({ b: 'yay digging'}, 'b')
}
