const cheerio = require('cheerio')
const qs = require('querystring')

module.exports = (resp) => {
  console.log('classTypes Parser')
  const $ = cheerio.load(resp)
  const classCategories = $('.serviceCatName').get().map(cat => {
    const id = $(cat).parents('.js-serviceCategory').data('id') || 0
    return {
      id: id,
      name: $(cat).text(),
      active: $(cat).parents('.inactiveWrapper').length === 0
    }
  })
  const classTypes = $('.classTitle.className').get().map(cl => {
    const query = $(cl).attr('href').split('?')[1]
    const params = qs.parse(query)
    const activeClass = !$(cl).parents('tr').attr('class').includes('hidden')
    const activeCat = $(cl).parents('.inactiveWrapper').length === 0
    return {
      id: params.classDetailID,
      programId: params.programID,
      name: $(cl).text().trim(),
      active: activeClass && activeCat
    }
  })
  console.log('classTypes', classTypes)
  console.log('classCategories', classCategories)
  return { classCategories, classTypes }
}
