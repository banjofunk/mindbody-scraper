const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const dig = require('./utils/dig')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const records = event.Records
  const record = dig(event, 'Records', '0')
  if(!record){return Promise.reject()}
  const { lambdaName, item, session } = JSON.parse(record.body)
  console.log('invoking: ', lambdaName)
  const params = {
    FunctionName: `mindbody-scraper-${process.env.stage}-${lambdaName}`,
    Payload: JSON.stringify({ item, session })
  }
  return lambda.invoke(params).promise()
}
