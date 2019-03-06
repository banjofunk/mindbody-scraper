const moment = require('moment')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('classEventQueueUrl', process.env.classEventQueueUrl)
  const { start, end } = event
  let currentMoment = moment(start, "MM/DD/YYYY")
  const endMoment = moment(end, "MM/DD/YYYY")
  console.log('currentMoment', currentMoment)
  console.log('endMoment', endMoment)
  let entries = []
  while(currentMoment > endMoment){
    const Id = `${currentMoment.unix()}-${Date.now()}`
    const MessageBody = currentMoment.format('MM/DD/YYYY')
    entries.push({ Id, MessageBody })
    currentMoment = currentMoment.subtract(7, "days")
  }
  console.log('entries', entries)

  let i, j, entryChunk, params
  for (i=0,j=entries.length; i<j; i+=10) {
    entryChunk = entries.slice(i,i+10)
    params = {
      Entries: entryChunk,
      QueueUrl: process.env.classEventQueueUrl
    };
    console.log('params', params)
    await sqs.sendMessageBatch(params).promise()
      .then(data => {
        console.log('data', data)
        const passCount = data.Successful.length
        const failCount = data.Failed.length
        console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
      })
      .catch(err => { console.log('sqs send error:', err, err.stack) })
  }
  return Promise.resolve()
}
