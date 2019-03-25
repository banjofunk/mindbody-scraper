const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `sending letters to queue`)
  let letters
  if(session.prod){
    // letters = 'abcdefghijklmnopqrstuvwxyz '.split('')
    letters = 'ab'.split('')
  } else {
    letters = 'a'.split('')
  }
  await sendToQueue(letters, 'getProductsByLetter', session)
  return Promise.resolve()
}
