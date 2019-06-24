const mbFetch = require('./utils/mbFetch')
const qs = require('querystring')
const logger = require('./utils/logger')
const moment = require('moment-timezone')
const writeToDynamo = require('./utils/writeToDynamo')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting autopay scraper`)
  const format = 'M/DD/YYYY'
  const sdate = moment().format(format)
  const edate = moment().add(1, 'year').format(format)
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_eft_det.asp'
  const query = qs.stringify({ category: "Paymentprocessing", sdate, edate, autopayStatus: 1 })
  const fetchParams = { session, url: `${url}?${query}`, options: {}, parser: 'autopayParser' }
  const autopays = await mbFetch(fetchParams)
  console.log('autopays', autopays)
  await logger(session, `autopays: ${autopays.length} scheduled`)
  await Promise.all(autopays.map(autopay => {
    return writeToDynamo('autopayId', autopay, 'AutopayTable')
  }))
  return Promise.resolve()
}
