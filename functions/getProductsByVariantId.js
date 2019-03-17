const cheerio = require('cheerio')
const mbFetch = require('./utils/mbFetch')
const qs = require('querystring')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { variantId } = event
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_tlbx_prod.asp'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const records = event.Records
  await Promise.all(records.map( async record => {
    const variant = JSON.parse(record.body)
    const body = searchQueryParams(variant.id)
    return mbFetch(url, { method, headers, body })
      .then(resp => parseProducts(resp))
      .then(products => {
        if(products.length < 500){
          console.log(`variant ${variant.id}:`, products.length)
        }else{
          console.log(`too many items for variant ${variant.id}`)
        }
        return sendToQueue(products, 'productDetailQueueUrl', 'product')
      })
  }))
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

const searchQueryParams = (variantId) => {
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
    optSearchMeth:"all",
    optGroupMeth:"all",
    frmVariantID: variantId
  })
}

const sendToQueue = async (items, queueUrl, label) => {
  let entries = []
  for (const item of items) {
      const Id = `${label}-${item.id}`
      const MessageBody = JSON.stringify(item)
      entries.push({ Id, MessageBody })
  }
  let i,j,entryChunk
  for (i=0,j=entries.length; i<j; i+=10) {
    entryChunk = entries.slice(i,i+10)
    params = {
      Entries: entryChunk,
      QueueUrl: process.env[queueUrl]
    };
    await sqs.sendMessageBatch(params).promise()
      .then(data => {
        const passCount = data.Successful.length
        const failCount = data.Failed.length
        console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
      })
      .catch(err => { console.log('sqs send error:', err, err.stack) })
    return Promise.resolve()
  }
}
