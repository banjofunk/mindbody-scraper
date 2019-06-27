const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const cloudwatchlogs = new AWS.CloudWatchLogs()

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { studioId, username, password, prod, endDate, startDate, scrapers } = event
  const logStreamName = `studio-${studioId}-${Date.now()}`
  const logGroupName = process.env.scraperLogName
  const session = { logStreamName, studioId, prod }

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
  for(const scraper of scrapers){
    if(['getSalesRange', 'getAppointments'].includes(scraper)){
      await logger(session, `starting scraper for studio (sales)`)
      await sendToQueue({ endDate, startDate }, scraper, session)
    }else{
      await sendToQueue(true, scraper, session)
    }
  }
  await logger(session, `starting scraper for studio`)
  return Promise.resolve(session)
}
