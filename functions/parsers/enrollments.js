const cheerio = require('cheerio')
const qs = require('querystring')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.cigarWithExpandable').get().map(row => {
    return {
      id: $(row).find('.delete a').data('typeid'),
      serviceCategoryId: $(row).parents('.js-collapseParentContainer').data('id'),
      serviceCategoryType: $(row).parents('.js-collapseParentContainer').data('type'),
      serviceCategoryName: $(row).parents('.js-collapseParentContainer').find('.serviceCatName').text().trim(),
      serviceCategoryActive: $(row).parents('.inactiveWrapper').length === 0,
      title: $(row).find('[href^="/ServicesAndPricingEnrollmentDetail/Edit"]').attr('title'),
      active: !$(row).hasClass('hide')
    }
  })
}
