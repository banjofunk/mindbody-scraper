const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const logger = require('./utils/logger')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `getting prducts by letter: ${item}`)
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_tlbx_prod.asp'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const body = searchQueryParams(item)
  const fetchParams = {
    session,
    url,
    options: { method, headers, body },
    parser: 'ProductsByLetterParser'
  }
  let products = await mbFetch(fetchParams)
  if(!item.match(/^[a-zA-Z]/)){
    products = products.filter(prod => !prod.name.match(/^[a-zA-Z]/))
  }
  const productItems = products.filter(r => !r.variants)
  const variantItems = products.filter(r => r.variants)

  await sendToQueue(productItems, 'getProductDetails', session)
  await sendToQueue(variantItems, 'getProductsByVariantId', session)
  return Promise.resolve()
}

const searchQueryParams = (startsWith) => {
  return qs.stringify({
    frmSubmitted:"6655",
    frmAddEdit:"Edit",
    showSearchResults:"true",
    newProdSelected:"true",
    advSearch:"true",
    optFltSupplier:"0",
    optFltCategory: "0",
    optFilterBy: "0",
    optIncludeUnused:"on",
    optCreatedDate:"7d",
    optSearchMeth:"descB",
    optGroupMeth:"desc",
    txtSearch_Text: startsWith
  })
}
