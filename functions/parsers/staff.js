const cheerio = require('cheerio')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.staffTable tbody tr').get().map(s => {
    const id = dig($(s).find('.staffNameLink').attr('href').match(/trnID=(.*?)$/), "1" )
    return { id, ...$(s).data()}
  })
}
