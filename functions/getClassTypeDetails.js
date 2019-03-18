const mbFetch = require('./utils/mbFetch')
const writeToDynamo = require('./utils/writeToDynamo')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { classDetailID, programID, active } = event.item
  const url = 'https://clients.mindbodyonline.com/ServicesAndPricingClassDetail/Edit'
  const query = qs.stringify({ classDetailID, programID })
  const classType = await mbFetch(`${url}?${query}`)
    .then(resp => parseClassType(resp, classDetailID, active))
  await writeToDynamo('classTypeId', classType, 'ClassTypesTable')
  return Promise.resolve()
}

const parseClassType = async (resp, classDetailID, active) => {
    const $ = cheerio.load(resp)
    return {
      id: classDetailID,
      name: $('#ClassDetail_Name').val().trim(),
      description: $('#ClassDetailDescription').text(),
      PrerequisiteNotes: $('#ClassDetailPrereqNotes').text(),
      registrationNotes: $('#ClassDetailRegistrationNotes').text(),
      imgUrl: $('.imageUploaderBox [alt=defaultImage]').attr('src') || false,
      serviceCategory: {
        id: $('#ServiceTag_CategoryID [selected]').val() || '',
        name: $('#ServiceTag_CategoryID [selected]').text()
      },
      serviceSubCategory: {
        id: $('#ServiceTag_SubCategoryID [selected]').val() || '',
        name: $('#ServiceTag_SubCategoryID [selected]').text()
      },
      classCategory: {
        id: $('#sessionTypeList [selected]').val() || '',
        name: $('#sessionTypeList [selected]').text()
      },
      active: active
    }
}
