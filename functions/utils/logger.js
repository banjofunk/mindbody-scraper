const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()

module.exports = async (session, message) => {
  const logGroupName = process.env.scraperLogName
  const logStreamName = session.logStreamName
  const logEvents = [{ message, timestamp: Date.now() }]
  let sequenceToken = await getNextSequenceToken(logGroupName, logStreamName)
  let logged, logParams
  while(!logged){
    logParams = { logGroupName, logStreamName, logEvents, sequenceToken }
    await cloudwatchlogs.putLogEvents(logParams).promise()
      .then( () => { logged = true })
      .catch( async err => {
        if(err.code === 'InvalidSequenceTokenException'){
          sequenceToken = err.message.match(/sequenceToken is: (.*?)$/)[1]
        } else {
          sequenceToken = await getNextSequenceToken(logGroupName, logStreamName)
        }
        logged = false
      })
  }
  return Promise.resolve()
}

const getNextSequenceToken = async (logGroupName, logStreamNamePrefix) => {
  const logParams = { logGroupName, logStreamNamePrefix, limit:1 }
  return await cloudwatchlogs.describeLogStreams(logParams).promise()
    .then(data => data.logStreams[0].uploadSequenceToken)
}
