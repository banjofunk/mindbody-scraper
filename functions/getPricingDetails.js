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
  const url = 'https://clients.mindbodyonline.com/AddEditPricingOption/Edit'

  const records = event.Records
  await Promise.all(records.map( async record => {
    const { id, title, active } = JSON.parse(record.body)
    console.log('title:', title)

    const headers = {
      "Cookie": token,
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
    }

    const query = qs.stringify({ id })
    const pricingDetails = await fetch(`${url}?${query}`, { headers })
      .then(resp => resp.text())
      .then(async resp => await parsePricingDetails(resp, active))
    return writeDynamo('pricingDetailId', pricingDetails, 'PricingDetailsTable')
  }))
  return Promise.resolve()
}

const parsePricingDetails = async (resp, active) => {
    const $ = cheerio.load(resp)
    const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
    if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
      token = await getToken()
      return false
    }
    const regex = /var jsonModel = JSON.parse\((.*?)\);/
    const scriptStr = dig(resp.match(regex), '1') || ''
    const objStr = JSON.parse(scriptStr)
    const obj = JSON.parse(objStr) || {}
    const selectedDurationUnit = obj.AvailableDurationUnits.find( u =>
      u.DurationUnitId === obj.SelectedDurationUnit
    )
    const selectedFrequencyLimitation = obj.AvailableFrequencyLimitations.find( u =>
      u.FrequencyLimitaionId === obj.SelectedFrequencyLimitation
    )
    const selectedRevenueCategories = obj.AvailableRevenueCategories.find( u =>
      u.RevenueCategoryId === obj.SelectedRevenueCategory
    )
    const selectedServiceCategory = obj.AvailableServiceCategories.find( u =>
      u.ServiceCategoryId === obj.SelectedServiceCategory
    )
    const selectedServiceType = obj.AvailableServiceTypes.find( u =>
      u.ServiceTypeId === obj.SelectedServiceType
    )
    return {
      id: dig(obj, 'PricingOptionId'),
      active,
      productId: dig(obj, 'PricingOptionProductId'),
      title: dig(obj, 'Name', ob => ob.trim()),
      duration: dig(obj, 'Duration'),
      durationUnit: dig(selectedDurationUnit, 'DurationUnitDisplayName'),
      numberOfSessions: dig(obj, 'NumberOfSessions'),
      price: dig(obj, 'Price'),
      onlinePrice: dig(obj, 'OnlinePrice'),
      frequencyLimitation: dig(selectedFrequencyLimitation, 'FrequencyLimitaionName'),
      revenueCategory: dig(selectedRevenueCategories, 'RevenueCategoryName'),
      serviceCategory: dig(selectedServiceCategory, 'ServiceCategoryDisplayName'),
      serviceType: dig(selectedServiceType, 'ServiceTypeDisplayName'),
      soldOnline: dig(obj, 'SoldOnline'),
      sellInMarketplace: dig(obj, 'SellInMarketplace'),
      notes: dig(obj, 'Notes'),
      taxes: dig(obj, 'Taxes', taxes => taxes.filter(tax => tax.Enabled)),
    }
}

const writeDynamo = async (keyName, obj, tableName) => {
  const attributeUpdates = Object.assign(
    ...Object.entries(obj).map( ob =>
      ({[ob[0]]:{ Action: 'PUT', Value: ob[1] }})
    )
  )
  const dynamoParamsb = {
    Key : Object.assign({[keyName]: String(obj.id)}),
    AttributeUpdates : attributeUpdates,
    TableName : tableName
  };
  return await dynamo.update(dynamoParamsb).promise()
    .then(data => { console.log('processed queue: ', obj.id) })
    .catch(err => { console.log('dynamo err', obj.id, err) })
}
