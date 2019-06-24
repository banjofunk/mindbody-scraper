const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return {
    contractName: $('#contract-data').data('contractname'),
    billing: $('#contract-data').data('billing'),
    ticket: $('#contract-data').data('ticket'),
    newContract: $('#contract-data').data('newcontract'),
    contractDiscontinued: $('#contract-data').data('contractdiscontinued'),
    contractId: $('#contract-data').data('contractid'),
    isv2contract: $('#contract-data').data('isv2contract'),
    subscriptionLevel: $('#contract-data').data('subscriptionlevel')
  }
}
