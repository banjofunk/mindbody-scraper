const cheerio = require('cheerio')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  payments = []
  if($('.div-results').children().length === 0){
    return false
  }
  $('.result-table').get().forEach(table => {
    const paymentType = $(table).find('caption').text().trim()
    $(table).find('tr.even, tr.odd').get().forEach(row => {
      const clientId = ($(row)
        .find('td[data-art=clientCell] a')
        .attr('href')
        .match(/ID=(.*?)&/) || [])[1]
      const mbSaleId = $(row).find('td[data-art=saleidCell] a').text().trim()
      
      let num = 0
      let id = mbSaleId
      while(payments.find(obj => obj.id === id)){
        num += 1
        id = `${mbSaleId}_${num}`
      }

      payments.push({
        id,
        paymentType,
        clientId,
        mbSaleId,
        date: $(row).find('td[data-art=saledateCell]').text().trim(),
        clientName: $(row).find('td[data-art=clientCell] a').text().trim(),
        itemName: $(row).find('td[data-art=itemnameCell]').text().trim(),
        locationName: $(row).find('td[data-art=locationCell]').text().trim(),
        notes: $(row).find('td[data-art=notesCell]').text().trim(),
        color: $(row).find('td[data-art=colorCell]').text().trim().replace('---',''),
        size: $(row).find('td[data-art=sizeCell]').text().trim().replace('---',''),
        itemPrice: $(row).find('td[data-art=itempriceCell]').text().trim(),
        quantity: $(row).find('td[data-art=quantityCell]').text().trim(),
        subtotal: $(row).find('td[data-art=subtotalCell]').text().trim(),
        discount: $(row).find('td[data-art=discountamountCell]').text().trim(),
        tax: $(row).find('td[data-art=taxCell]').text().trim(),
        itemTotal: $(row).find('td[data-art=itemtotalCell]').text().trim(),
        totalPaid: $(row).find('td[data-art=totalpaidwpaymentmethodCell]').text().trim(),
      })
    })
  })
  return payments
}
