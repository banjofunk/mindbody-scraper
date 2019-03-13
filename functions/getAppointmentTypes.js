const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
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
  const url = 'https://clients.mindbodyonline.com/servicesandpricing/appointments'
  const headers = {
    "Cookie": token,
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
  }
  const appointmentTypes = await fetch(url, { headers })
    .then(resp => resp.text())
    .then(resp => parseAppointmentTypes(resp))
  await Promise.all(appointmentTypes.map(appointmentType => {
    return writeDynamo('appointmentTypeId', appointmentType, 'AppointmentTypesTable')
  }))
  return Promise.resolve()
}

const parseAppointmentTypes = async (resp) => {
  const $ = cheerio.load(resp)
  const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
  if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
    token = await getToken()
    return false
  }
  return $('.js-appointment-type').get().map( appt => {
    const pricing = $(appt).find('.pricing-table tbody tr').get().map( pricing => {
      return {
        id: $(pricing).find('.trash-can').data('seriesid'),
        title: $(pricing).find('.nameContainer span').eq(0).attr('title'),
        singleSession: $(pricing).find('.nameContainer .app-subText').text().trim() === "Single session"
      }
    })
    const staff = $(appt).find('.appointmentStaffTable tbody tr').get().map( staff => {
      return {
        id: $(staff).find('.trash-can').data('staffid'),
        name: $(staff).find('.trash-can').data('staffname'),
        payRateType: $(staff).find('.js-pay-rate-type [selected]').text(),
        percentageRate: $(staff).find('#spanForPercentPay input').val(),
        flatRate: $(staff).find('#spanForPayAmount input').val()
      }
    })
    return {
      id: $(appt).find('.js-toggle-appointment-type').data('appointmenttypeid'),
      title: $(appt).find('.js-collapseAppointmentTypeTitle').text().trim(),
      categoryId: $(appt).data('servicecategoryid'),
      category: $(appt).parents('.js-serviceCategory').find('.serviceCatName').text().trim(),
      pricing,
      staff
    }
  })
}

const writeDynamo = async (keyName, obj, tableName) => {
  const attributeUpdates = Object.assign(
    ...Object.entries(obj).map( ob =>
      ({[ob[0]]:{ Action: 'PUT', Value: ob[1] }})
    )
  )
  console.log('attributeUpdates', attributeUpdates)
  const dynamoParamsb = {
    Key : Object.assign({[keyName]: String(obj.id)}),
    AttributeUpdates : attributeUpdates,
    TableName : tableName
  };
  return await dynamo.update(dynamoParamsb).promise()
    .then(data => { console.log('processed queue: ', obj.id) })
    .catch(err => { console.log('dynamo err', obj.id, err) })
}
