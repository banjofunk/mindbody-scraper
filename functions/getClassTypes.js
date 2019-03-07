const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const qs = require('querystring')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

let token = false
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()
  const url = 'https://clients.mindbodyonline.com/servicesandpricing/classes'
  const headers = {
    "Cookie": token,
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
  }
  await fetch(url, { headers })
  .then(resp => resp.text())
  .then(async resp => {
    const $ = cheerio.load(resp)
    const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
    if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
      token = await getToken()
      return false
    }

    const classCategories = $('.serviceCatName').get().map(cat => {
      return {
        id: $(cat).parents('.js-serviceCategory').data('id'),
        name: $(cat).text(),
        active: $(cat).parents('.inactiveWrapper').length === 0
      }
    })

    await Promise.all(
      classCategories.map(category => writeDynamoCategory(category))
    )

    const classTypes = $('.classTitle.className').get().map(cl => {
      const query = $(cl).attr('href').split('?')[1]
      const params = qs.parse(query)
      const activeClass = !$(cl).parents('tr').attr('class').includes('hidden')
      const activeCat = $(cl).parents('.inactiveWrapper').length === 0
      return { ...params,
        name: $(cl).text().trim(),
        active: activeClass && activeCat
      }
    })


    let entries = []
    for (const classType of classTypes) {
        const Id = `classType-${classType.classDetailID}`
        const MessageBody = JSON.stringify(classType)
        entries.push({ Id, MessageBody })
    }
    console.log('entries', entries)

    let i,j,entryChunk
    for (i=0,j=entries.length; i<j; i+=10) {
      entryChunk = entries.slice(i,i+10)
      params = {
        Entries: entryChunk,
        QueueUrl: process.env.classTypeQueueUrl
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
  return Promise.resolve()
}

const writeDynamoCategory = async (category) => {
  const dynamoParamsb = {
    Key : {
      "classCategoryId" : String(category.id)
    },
    AttributeUpdates : {
      "id": { Action: 'PUT', Value: category.id },
      "name": { Action: 'PUT', Value: category.name },
      "active": { Action: 'PUT', Value: category.active }
    },
    TableName : 'ClassCategoriesTable'
  };
  return await dynamo.update(dynamoParamsb).promise()
    .then(data => { console.log('processed queue: ', category.id) })
    .catch(err => { console.log('dynamo err', category.id, err) })
}
