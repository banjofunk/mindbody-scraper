const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.clientName').get().map(client => {
    const id = $(client).attr('href').match(/ID=(.*?)&/)[1]
    const name = $(client).text().trim()
    const firstName = name.split(',')[1].trim()
    const lastName = name.split(',')[0].trim()
    return { id, firstName, lastName }
  })
}
