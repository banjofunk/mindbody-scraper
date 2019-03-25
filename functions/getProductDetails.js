const mbFetch = require('./utils/mbFetch')
const writeToDynamo = require('./utils/writeToDynamo')
const logger = require('./utils/logger')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching product: ${item.id} - ${item.name}`)
  const url = 'https://clients.mindbodyonline.com/productmanagement/editproduct'
  const query = qs.stringify({ descriptionId: item.id })
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'productDetailsParser'
  }
  const productDetails = await mbFetch(fetchParams)
  await writeToDynamo('productId', {...item, ...productDetails}, 'ProductsTable')
  return Promise.resolve()
}
