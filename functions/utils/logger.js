const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()

module.exports = async (session, message) => {
  const logGroupName = process.env.scraperLogName
  const logStreamName = session.logStreamName
  const logEvents = [{ message, timestamp: Date.now() }]
  let logged, sequenceToken, logParams
  while(!logged){
    sequenceToken = await getNextSequenceToken(logGroupName, logStreamName)
    logParams = { logGroupName, logStreamName, logEvents, sequenceToken }
    await cloudwatchlogs.putLogEvents(logParams).promise()
      .then(() => {logged = true})
  }
  return Promise.resolve()
}

const getNextSequenceToken = async (logGroupName, logStreamNamePrefix) => {
  const logParams = { logGroupName, logStreamNamePrefix, limit:1 }
  return await cloudwatchlogs.describeLogStreams(logParams).promise()
    .then(data => data.logStreams[0].uploadSequenceToken)
}
