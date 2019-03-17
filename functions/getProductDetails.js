const cheerio = require('cheerio')
const mbFetch = require('./utils/mbFetch')
const qs = require('querystring')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const url = 'https://clients.mindbodyonline.com/productmanagement/editproduct'
  const records = event.Records
  await Promise.all(records.map( async record => {
    const product = JSON.parse(record.body)
    const query = qs.stringify({ descriptionId: product.id })
    const productDetails = await mbFetch(`${url}?${query}`)
      .then(resp => parseProduct(resp, product))
    return writeDynamo('productId', productDetails, 'ProductsTable')
  }))
  return Promise.resolve()
}

const parseProduct = async (resp, product) => {
    const $ = cheerio.load(resp)
    const inventory = $('.js-inventoryOnHandInput').get().map( inv => {
      return {
        location: $(inv).siblings('label').text(),
        amount: $(inv).val()
      }
    })
    const restrictions = $('#membershipRestrictions [selected]').get().map(mem => {
      return {
        id: $(mem).val(),
        name: $(mem).text(),
      }
    })
    const discounts = $('#membershipDiscounts [selected]').get().map(mem => {
      return {
        id: $(mem).val(),
        name: $(mem).text(),
      }
    })
    return {
      ...product,
      name: $('#ProductName').val(),
      barcode: $('#Barcode').val(),
      manufacturerId: $('#ManufacturerId').val(),
      locations: $('#locations [selected]').text(),
      categoryId: $('#PrimaryCategoryId [selected]').val(),
      categoryName: $('#PrimaryCategoryId [selected]').text(),
      subcategoryId: $('#SubcategoryId [selected]').val(),
      subcategoryName: $('#SubcategoryId [selected]').text(),
      colorId: $('#colorsEdit [selected]').val(),
      colorName: $('#colorsEdit [selected]').text(),
      sizeId: $('#sizesEdit [selected]').val(),
      sizeName: $('#sizesEdit [selected]').text(),
      supplierId: $('#SelectedProductSuppliersId [selected]').val() || '0',
      supplierName: $('#SelectedProductSuppliersId [selected]').text(),
      inventory,
      maxLevel: $('#MaxLevel').val(),
      reorderLevel: $('#ReorderLevel').val(),
      lotSize: $('#LotSize').val(),
      restrictions,
      discounts,
      notes: $('#ProductNotes').text(),
      quickCash: $('#yesQuickCash').attr('checked') ? true : false,
      posFavorite: $('#yesPosFavorite').attr('checked') ? true : false
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
