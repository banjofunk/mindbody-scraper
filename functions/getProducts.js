const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  let products = []
  // include a *space* to get all non-alpha characters
  // const letters = 'abcdefghijklmnopqrstuvwxyz '.split('')
  const letters = 'abcdef '.split('')
  await Promise.all(letters.map(letter => {
    return sendToQueue(letter, 'getProductsByLetter')
  }))
  return Promise.resolve()
}
