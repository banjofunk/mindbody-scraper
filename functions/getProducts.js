const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  // include a *space* to get all non-alpha characters
  // const letters = 'abcdefghijklmnopqrstuvwxyz '.split('')
  const letters = 'abcdef '.split('')
  await sendToQueue(letters, 'getProductsByLetter')
  return Promise.resolve()
}
