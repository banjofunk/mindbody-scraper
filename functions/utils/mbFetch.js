const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

module.exports = async (fetchParams) => {
  params = {
    FunctionName: `mindbody-scraper-${process.env.stage}-mbFetch`,
    Payload: JSON.stringify(fetchParams)
  }
  return await lambda.invoke(params).promise()
    .then(data => JSON.parse(data.Payload))
}
