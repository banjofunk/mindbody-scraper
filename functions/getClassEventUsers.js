const fetch = require('node-fetch')
const cheerio = require('cheerio')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')

const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

let token = false
exports.handler = async (event, context) => {
  token = token || await getToken()
  context.callbackWaitsForEmptyEventLoop = false;
  let students, retryCount
  const timeCheck = Date.now()

  const records = event.Records
  await Promise.all(records.map( async record => {
    const { receiptHandle, body } = record
    const yogaClass = JSON.parse(body)

    students = false
    retryCount = 0
    while(!students && retryCount < 5){
      students = await fetchClass(token, yogaClass.date, yogaClass.id);
      retryCount += 1
    }
    const dynamoParamsb = {
      Key : {
        "classId" : String(yogaClass.id)
      },
      AttributeUpdates : {
        "date" : { Action: 'PUT', Value: yogaClass.date },
        "time" : { Action: 'PUT', Value: yogaClass.time },
        "location" : { Action: 'PUT', Value: yogaClass.location },
        "room" : { Action: 'PUT', Value: yogaClass.room },
        "classTitle" : { Action: 'PUT', Value: yogaClass.classTitle },
        "classTypeId" : { Action: 'PUT', Value: yogaClass.classTypeId },
        "teacher" : { Action: 'PUT', Value: yogaClass.teacher },
        "teacherId" : { Action: 'PUT', Value: yogaClass.teacherId },
        "students" : { Action: 'PUT', Value: students },
      },
      TableName : 'ClassEventsTable'
    };
    return dynamo.update(dynamoParamsb).promise()
      .then(data => { console.log('processed queue: ', yogaClass.id) })
      .catch(err => { console.log('dynamo err', yogaClass.id, err) })

  }))
  const timeResult = ((Date.now() - timeCheck)/1000).toFixed(2)
  console.log('batch time:', `${timeResult}s`)

  return Promise.resolve()
}

const fetchClass = async (cookie, date, classId) => {
  const headers = {
      "Cookie": cookie,
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36",
    }
  return await fetch(`https://clients.mindbodyonline.com/classic/admclslist?pDate=${date}&pClsID=${classId}`,{headers})
    .then(resp => resp.text())
    .then(resp => {
      const $ = cheerio.load(resp)
      const clients = $('.clientName').map( (i, client) => {
        const id = $(client).attr('href').match(/ID=(.*?)&/)[1]
        const name = $(client).text().trim()
        const firstName = name.split(',')[1].trim()
        const lastName = name.split(',')[0].trim()
        return { id, firstName, lastName }
      }).get()
      return clients
    })
}
