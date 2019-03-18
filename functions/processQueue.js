const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const records = event.Records
  console.log('records: ', records.length)
  for( const record of records){
    const { lambdaName, item } = JSON.parse(record.body)
    console.log('invoking: ', lambdaName)
    params = {
      FunctionName: `mindbody-scraper-${process.env.stage}-${lambdaName}`,
      Payload: JSON.stringify({ item })
    }
    await lambda.invoke(params).promise()
  }
  return Promise.resolve()
}
