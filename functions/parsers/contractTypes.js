const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.contract-item').get().map(contract => ({
    id: $(contract).attr('id'),
    contractName: $(contract).attr('title'),
    active: !$(contract).hasClass('deactivated'),
    soldOnline: $(contract).find('.table-relative i').length > 0
  }))
}
