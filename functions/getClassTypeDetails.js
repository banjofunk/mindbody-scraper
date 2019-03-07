const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const qs = require('querystring')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

let token = false
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()
  const url = 'https://clients.mindbodyonline.com/ServicesAndPricingClassDetail/Edit'

  const records = event.Records
  await Promise.all(records.map( async record => {
    const { classDetailID, programID, active } = JSON.parse(record.body)

    const headers = {
      "Cookie": token,
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
    }

    const query = qs.stringify({ classDetailID, programID })
    const classType = await fetch(`${url}?${query}`, { headers })
      .then(resp => resp.text())
      .then(async resp => await parseClassType(resp, classDetailID, active))
    return writeDynamoClassType(classType)
  }))
  return Promise.resolve()
}

const parseClassType = async (resp, classDetailID, active) => {
    const $ = cheerio.load(resp)
    const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
    if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
      token = await getToken()
      return false
    }

    return {
      id: classDetailID,
      name: $('#ClassDetail_Name').val().trim(),
      description: $('#ClassDetailDescription').text(),
      PrerequisiteNotes: $('#ClassDetailPrereqNotes').text(),
      registrationNotes: $('#ClassDetailRegistrationNotes').text(),
      imgUrl: $('.imageUploaderBox [alt=defaultImage]').attr('src') || false,
      serviceCategory: {
        id: $('#ServiceTag_CategoryID [selected]').val() || '',
        name: $('#ServiceTag_CategoryID [selected]').text()
      },
      serviceSubCategory: {
        id: $('#ServiceTag_SubCategoryID [selected]').val() || '',
        name: $('#ServiceTag_SubCategoryID [selected]').text()
      },
      classCategory: {
        id: $('#sessionTypeList [selected]').val() || '',
        name: $('#sessionTypeList [selected]').text()
      },
      active: active
    }
}

const writeDynamoClassType = async (classType) => {
  const dynamoParamsb = {
    Key : {
      "classTypeId" : String(classType.id)
    },
    AttributeUpdates : {
      "id": { Action: 'PUT', Value: classType.id },
      "name": { Action: 'PUT', Value: classType.name },
      "imgUrl": { Action: 'PUT', Value: classType.imgUrl },
      "description": { Action: 'PUT', Value: classType.description },
      "PrerequisiteNotes": { Action: 'PUT', Value: classType.PrerequisiteNotes },
      "registrationNotes": { Action: 'PUT', Value: classType.registrationNotes },
      "serviceCategory": { Action: 'PUT', Value: classType.serviceCategory },
      "serviceSubCategory": { Action: 'PUT', Value: classType.serviceSubCategory },
      "classCategory": { Action: 'PUT', Value: classType.classCategory },
      "active": { Action: 'PUT', Value: classType.active },
    },
    TableName : 'ClassTypesTable'
  };
  return await dynamo.update(dynamoParamsb).promise()
    .then(data => { console.log('processed queue: ', classType.id) })
    .catch(err => { console.log('dynamo err', classType.id, err) })
}
