const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const cloudwatchlogs = new AWS.CloudWatchLogs()

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { studioId, username, password } = event

  const logStreamName = `studio-${studioId}-${Date.now()}`
  const logGroupName = process.env.scraperLogName
  const streamParams = { logGroupName, logStreamName }
  await cloudwatchlogs.createLogStream(streamParams).promise()

  if(studioId && username && password){
    const ssmParams = {
      Name: `/mindbody-scraper/${process.env.stage}/studio/${studioId}`,
      Type: 'SecureString',
      Value: JSON.stringify({ username, password }),
      Overwrite: true
    };
    await ssm.putParameter(ssmParams).promise()
  }
  const session = { logStreamName, studioId }
  await sendToQueue([{id:0}], 'getProducts', session)
  await logger(session, `starting scraper for studio`)
  return Promise.resolve()
  // return await fetch('https://api.ipify.org?format=json')
  //   .then(resp => resp.json())
}
