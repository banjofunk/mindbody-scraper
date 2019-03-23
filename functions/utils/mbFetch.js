const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

module.exports = async (input, init, session) => {
  params = {
    FunctionName: `mindbody-scraper-${process.env.stage}-mbFetch`,
    Payload: JSON.stringify({ input, init, session })
  }
  return await lambda.invoke(params).promise()
    .then(data => JSON.parse(data.Payload))
}
