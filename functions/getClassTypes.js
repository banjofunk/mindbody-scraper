const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const writeToDynamo = require('./utils/writeToDynamo')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const url = 'https://clients.mindbodyonline.com/servicesandpricing/classes'
  const { classCategories, classTypes } = await mbFetch(url)
    .then(resp => parseClassTypes(resp))
  await writeToDynamo('classCategoryId', classCategories, 'ClassCategoriesTable')
  await sendToQueue(classTypes, 'getClassTypeDetails')
  return Promise.resolve()
}

const parseClassTypes = resp => {
    const $ = cheerio.load(resp)
    const classCategories = $('.serviceCatName').get().map(cat => {
      return {
        id: $(cat).parents('.js-serviceCategory').data('id'),
        name: $(cat).text(),
        active: $(cat).parents('.inactiveWrapper').length === 0
      }
    })
    const classTypes = $('.classTitle.className').get().map(cl => {
      const query = $(cl).attr('href').split('?')[1]
      const params = qs.parse(query)
      const activeClass = !$(cl).parents('tr').attr('class').includes('hidden')
      const activeCat = $(cl).parents('.inactiveWrapper').length === 0
      return { ...params,
        name: $(cl).text().trim(),
        active: activeClass && activeCat
      }
    })
    return { classCategories, classTypes }
}
