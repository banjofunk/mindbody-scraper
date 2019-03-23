const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `sending letters to queue`)
  // include a *space* to get all non-alpha characters
  // const letters = 'abcdefghijklmnopqrstuvwxyz '.split('')
  const letters = 'a'.split('')
  await sendToQueue(letters, 'getProductsByLetter', session)
  return Promise.resolve()
}
