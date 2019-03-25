const cheerio = require('cheerio')
const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `getting product variants for product: ${item.id}`)
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_tlbx_prod.asp'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const body = searchQueryParams(item.id, session.studioId)
  const fetchParams = {
    session,
    url,
    options: { method, headers, body },
    parser: 'ProductsByVariantParser'
  }
  const products = await mbFetch(fetchParams)
  await sendToQueue(products, 'getProductDetails', session)
  return Promise.resolve()
}

const searchQueryParams = (variantId, studioId) => {
  return qs.stringify({
    frmSubmitted: studioId,
    frmAddEdit:"Edit",
    showSearchResults:"true",
    newProdSelected:"true",
    advSearch:"true",
    optFltSupplier:"0",
    optFltCategory: "0",
    optFilterBy: "0",
    optIncludeUnused:"on",
    optCreatedDate:"7d",
    optSearchMeth:"all",
    optGroupMeth:"all",
    frmVariantID: variantId
  })
}
