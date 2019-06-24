const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)

  const students = $('.clientCell').get().map(client => {
    const row = $(client).parent()
    const id = row.find('.clientName').attr('href').match(/ID=(.*?)&/)[1]
    const name = row.find('.clientName').text().trim()
    const firstName = name.split(',')[1].trim()
    const lastName = name.split(',')[0].trim()
    return { 
      id, 
      firstName, 
      lastName,
      remaining: row.find('.client-payment-remaining-visits').text().trim(),
      paymentType: row.find('.client-payment-type span').attr('title'),
      expiration: row.find('.client-payment-expiration').text().trim(),
      web: row.find('input[name="optWeb"]').attr('checked') ? true : false,
      signedIn: row.find('.clientSignedIn').attr('checked') ? true : false,
    }
  })
  const teacherId = $('#frmSelectedTrn1').val()
  return { teacherId, students }
}
