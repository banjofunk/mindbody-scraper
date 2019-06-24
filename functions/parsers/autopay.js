const cheerio = require('cheerio')
const qs = require('querystring')
const dig = (...args) => args.reduce((obj, arg) => "function" === typeof arg && obj ? arg(obj) : obj[arg] || false)

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.AutoPayRow').get().map( row => {
    const clientId = dig($(row),
      r => r.find('#nameCell a'), 
      r => r.eq(0), 
      r => r.attr('href'), 
      r => r.split('?'),
      '1',
      r => qs.parse(r),
      'id'
    )
    const contractId = dig($(row),
      r => r.find('#contractCell a'), 
      r => r.eq(0), 
      r => r.attr('href'), 
      r => r.split('?'),
      '1',
      r => qs.parse(r),
      'cltcontractID'
    )

    const date = $(row).find('#dateCell').text().trim()
    const id = `${contractId}_${date}`
    
    return {
      id,
      amount: $(row).find('#amountCell input').val(),
      card: $(row).find('#ccInfoCell a').eq(0).text().trim(),
      clientId,
      contract: $(row).find('#contractCell a').eq(0).text().trim(),
      contractId,
      date,
      email: $(row).find('#nameCell a').eq(1).attr('title'),
      item: $(row).find('#itemCell').text().trim(),
      location: $(row).find('#locationCell').text().trim(),
      name: $(row).find('#nameCell a').eq(0).text().trim(),
      phone: $(row).find('#phoneNumCell').text().trim(),
      status: $(row).find('#statusCell').text().trim(),
    }
  })

}
