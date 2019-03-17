const fetch = require('node-fetch')
const FormData = require('form-data')
const cheerio = require('cheerio')
const dig = require('object-dig')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });


let token = false
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()

  const records = event.Records
  let date, receiptHandle
  for (const record of records) {
    date = record.body
    receiptHandle = record.receiptHandle
    const headers = {
      "Cookie": token,
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
    }
    const data = new FormData()
    data.append("txtDate", date)
    data.append("optLocation", 0)
    return await fetch('https://clients.mindbodyonline.com/classic/admmainclass?tabID=7', {
      method: 'post',
      body: data,
      headers
    })
    .then(resp => resp.text())
    .then(async resp => {
      const $ = cheerio.load(resp)
      const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
      if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
        token = await getToken()
        return false
      }
      let yogaClassIndex = []
      $('.cancelLink').map( (i, yogaClass) => {
        const classId = $(yogaClass).data('classid')
        if(classId){
          yogaClassIndex.push({
            id: classId,
            date: $(yogaClass).data('classdate'),
            teacherId: $(`a.trackResource[data-classid="${classId}"]`).data('trainerid'),
            location: $(yogaClass).parents('.gearColumn').siblings().eq(5).text().trim(),
            room: $(yogaClass).parents('.gearColumn').siblings().eq(6).text().trim(),
            teacher: $(yogaClass).data('teacher'),
            classTypeId: $(yogaClass).data('descriptionid'),
            classTitle: $(yogaClass).data('classname').trim(),
            time: $(yogaClass).parents('.gearColumn').siblings('.classTimeCol').text().trim()
          })
        }
      })
      let entries = []
      for (const yogaClass of yogaClassIndex) {
        if(yogaClass.id){
          const Id = `yogaClass-${yogaClass.id}`
          const MessageBody = JSON.stringify(yogaClass)
          entries.push({ Id, MessageBody })
        }
      }

      let i,j,entryChunk
      for (i=0,j=entries.length; i<j; i+=10) {
        entryChunk = entries.slice(i,i+10)
        params = {
          Entries: entryChunk,
          QueueUrl: process.env.classEventUserQueueUrl
        };
        await sqs.sendMessageBatch(params).promise()
          .then(data => {
            const passCount = data.Successful.length
            const failCount = data.Failed.length
            console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
          })
          .catch(err => { console.log('sqs send error:', err, err.stack) })
      }
    })
  }
}
