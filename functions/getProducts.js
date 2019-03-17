const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  let products = []
  // include a *space* to get all non-alpha characters
  // const letters = 'abcdefghijklmnopqrstuvwxyz '.split('')
  const letters = 'abcde '.split('')
  await Promise.all(letters.map(letter => {
    const params = {
      FunctionName: `mindbody-scraper-${process.env.stage}-getProductsByLetter`,
      Payload: JSON.stringify({ letter })
    }
    return lambda.invoke(params).promise()
      .then(data => {
        const itemResults = JSON.parse(data.Payload)
        console.log(itemResults)
        return Promise.resolve()
      })
  }))
  return products
}
