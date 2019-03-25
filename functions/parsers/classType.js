const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return {
    name: ($('#ClassDetail_Name').val() || '').trim(),
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
    }
  }
}
