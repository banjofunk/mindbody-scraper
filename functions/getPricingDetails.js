const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching pricing: ${item.id} - ${item.title}`)

  const url = 'https://clients.mindbodyonline.com/AddEditPricingOption/Edit'
  const query = qs.stringify({ id: item.id })
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'pricingDetailsParser'
  }
  const pricingDetails = await mbFetch(fetchParams)
  await writeToDynamo('pricingDetailId', {...pricingDetails, active: item.active}, 'PricingDetailsTable')
  return Promise.resolve()
}
