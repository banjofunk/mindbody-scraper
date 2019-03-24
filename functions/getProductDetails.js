const cheerio = require('cheerio')
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
  const productDetails = await mbFetch(`${url}?${query}`, {}, session)
    .then(resp => parseProduct(resp, item))
  await writeToDynamo('productId', productDetails, 'ProductsTable')
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
