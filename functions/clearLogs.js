const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const groupParams = {
    logGroupNamePrefix: '/aws/lambda/mindbody-scraper'
  };
  const logGroups = await cloudwatchlogs.describeLogGroups(groupParams).promise()
    .then(data => data.logGroups.map(logGroup => logGroup.logGroupName))
  logGroups.push(process.env.scraperLogName)

  const allStreams = []
  await Promise.all(logGroups.map(async logGroupName => {
    return await cloudwatchlogs.describeLogStreams({logGroupName}).promise()
      .then(data => {
        data.logStreams.forEach(stream => {
          const { logStreamName } = stream
          allStreams.push({ logGroupName, logStreamName })
        })
      })
  }))
  await Promise.all(allStreams.map(async stream => {
    return await cloudwatchlogs.deleteLogStream(stream).promise()
  }))
  return Promise.resolve()
}
