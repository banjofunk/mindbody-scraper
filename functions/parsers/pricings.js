const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.contract-item').get().map(item => {
    return {
      id: $(item).attr('id').trim(),
      title: $(item).attr('title').trim(),
      active: !$(item).attr('class').includes('deactivated')
    }
  })
}
