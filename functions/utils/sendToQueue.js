const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });

module.exports = async (input, lambdaName, session) => {
  if(Array.isArray(input)){
    await sendMessageBatch(input, lambdaName, session)
  }else{
    await sendMessage(input, lambdaName, session)
  }
  return Promise.resolve()
}

const sendMessageBatch = async (items, lambdaName, session) => {
  let entries = []
  for (const item of items) {
      const Id = `${lambdaName}-${item.id}`
      const MessageBody = JSON.stringify({ lambdaName, item, session })
      entries.push({ Id, MessageBody })
  }
  let i,j,entryChunk
  for (i=0,j=entries.length; i<j; i+=10) {
    entryChunk = entries.slice(i,i+10)
    params = {
      Entries: entryChunk,
      QueueUrl: process.env.scraperQueueUrl
    };
    await sqs.sendMessageBatch(params).promise()
      .then(data => {
        const passCount = data.Successful.length
        const failCount = data.Failed.length
        console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
      })
      .catch(err => { console.log('sqs send error:', err, err.stack) })
  }
  return Promise.resolve()

}

const sendMessage = async (item, lambdaName, session) => {
  var params = {
  MessageBody: JSON.stringify({ lambdaName, item, session }),
  QueueUrl: process.env.scraperQueueUrl
};
return await sqs.sendMessage(params).promise()
}
