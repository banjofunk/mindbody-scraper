const cheerio = require('cheerio')
const qs = require('querystring')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return {
    name: $('#EnrollmentDetail_Name').val(),
    categoryId: $('#ServiceTag_CategoryID [selected]').val(),
    category: $('#ServiceTag_CategoryID [selected]').text(),
    subCategoryId: $('#ServiceTag_SubCategoryID [selected]').val(),
    subCategory: $('#ServiceTag_SubCategoryID [selected]').text(),
    sessionType: $('#sessionTypeList [selected]').text(),
    sessionTypeId: $('#sessionTypeList [selected]').val(),
    description: $('#EnrollmentDetailDescription').text(),
    img: `https://clients.mindbodyonline.com${$('img[alt=defaultImage]').attr('src')}`
  }
}
