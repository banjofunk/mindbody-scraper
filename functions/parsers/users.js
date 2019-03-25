const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.resultRow').get().map(user => {
    return {
      id: $(user).children().eq(3).text(),
      firstName: $(user).children().eq(1).text(),
      lastName: $(user).children().eq(0).text(),
      email: $(user).children().eq(4).text(),
      phone: $(user).children().eq(5).text()
    }
  })
}
