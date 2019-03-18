const cheerio = require('cheerio')
const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const letter = event.item
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_tlbx_prod.asp'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const body = searchQueryParams(letter)
  let products = await mbFetch(url, { method, headers, body })
    .then(resp => parseProducts(resp))
  if(!letter.match(/^[a-zA-Z]/)){
    products = products.filter(prod => !prod.name.match(/^[a-zA-Z]/))
  }
  if(products.length < 500){
    console.log(`letter (${letter}): ${products.length} items`)
  }else{
    console.log(`too many items for letter (${letter})`)
  }
  const productItems = products.filter(r => !r.variants)
  const variantItems = products.filter(r => r.variants)

  await sendToQueue(productItems, 'getProductDetails')
  await sendToQueue(variantItems, 'getProductsByVariantId')

  return Promise.resolve()
}

const parseProducts = async (resp) => {
    const $ = cheerio.load(resp)
    return $('.productRow').get().map( prod => {
      const prodId = $(prod).find('.requiredtxtPrice').attr('name').match(/\d+/g).join('')
      const variants = $(prod).find('.productWithVariants').attr('href') ? true : false
      const name = variants
        ? $(prod).find('.productWithVariants').text()
        : $(prod).find('.productWithoutVariants').text()
      return {
        id: prodId,
        name,
        variants,
        price: $(prod).find('.requiredtxtPrice').val(),
        onlinePrice: $(prod).find('.requiredtxtOnlinePrice').val(),
        cost: $(prod).find('.requiredtxtOutCost').val(),
        weight: $(prod).find('.requiredtxtWeight').val(),
        active: !$(prod).find(`#optDiscontinued${prodId}`).prop('checked'),
        createdDate: $(prod).find(`[name=optProdCreatedDate${prodId}]`).val(),
        modifiedDate: $(prod).find(`[name=optProdModifiedDate${prodId}]`).val(),
        userId: $(prod).find(`[name=optProdCreatedBy${prodId}]`).val(),
        user: $(prod).find(`[name=optProdCreatedBy${prodId}]`).parent().text().trim().replace('---',''),
      }
    })
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
