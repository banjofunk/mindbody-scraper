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
  const products = await mbFetch(url, { method, headers, body }, session)
    .then(resp => parseProducts(resp))
  await sendToQueue(products, 'getProductDetails', session)
  console.log(`variant ${item.id}:`, products.length)
  return Promise.resolve()
}

const parseProducts = async (resp) => {
    const $ = cheerio.load(resp)
    return $('.productRow').get().map( prod => {
      const prodId = $(prod).find('.optDiscontinued').attr('name').match(/\d+/g).join('')
      const variants = $(prod).find('.productWithVariants').attr('href') ? true : false
      return {
        id: prodId,
        variants,
        name: $(prod).find('.productNameCell').text().trim(),
        price: $(prod).find('.requiredtxtPrice').val(),
        onlinePrice: $(prod).find('.requiredtxtOnlinePrice').val(),
        cost: $(prod).find('.requiredtxtOurCost').val(),
        weight: $(prod).find('.requiredtxtWeight').val(),
        active: !$(prod).find('.optDiscontinued').prop('checked'),
        createdDate: $(prod).find(`[name=optProdCreatedDate${prodId}]`).val(),
        modifiedDate: $(prod).find(`[name=optProdModifiedDate${prodId}]`).val(),
        userId: $(prod).find(`[name=optProdCreatedBy${prodId}]`).val(),
        user: $(prod).find(`[name=optProdCreatedBy${prodId}]`).parent().text().trim().replace('---',''),
      }
    })
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
