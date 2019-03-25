const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const { id, active, name, programId } = item
  await logger(session, `fetching class type details: ${id} - ${name}`)
  const url = 'https://clients.mindbodyonline.com/ServicesAndPricingClassDetail/Edit'
  const query = qs.stringify({ classDetailID: id, programID: programId })
  const fetchParams = { session, url: `${url}?${query}`, options: {}, parser: 'classTypeParser' }
  const classType = await mbFetch(fetchParams)
  await writeToDynamo('classTypeId', { ...classType, id, active }, 'ClassTypesTable')
  return Promise.resolve()
}
