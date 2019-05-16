const cheerio = require('cheerio')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)

  //default pay rate
  defaultRate = $('[name=optDefaultRate] [selected]').text().trim()
  payRateTeacherId = $('[name=optTeacher] [selected]').val()

  //class rates
  classRates = $('.perClassRow').get().map( row => ({
    name: $(row).find('td').eq(0).text().trim(),
    perClass: $(row).find('[name^=txtRate]').val(),
    bonusAmount: $(row).find('.perClassBonusColumn input').eq(0).val(),
    bonusOver: $(row).find('.perClassBonusColumn input').eq(1).val(),
    minPay: $(row).find('[name^=txtMin]').val(),
    maxPay: $(row).find('[name^=txtMax]').val(),
    noRegRate: $(row).find('[name^=txtNoRegRate]').val(),
  }))

  //client rates
  clientRates = $('.perClientRow').get().map( row => ({
    name: $(row).find('td').eq(0).text().trim(),
    perClient: $(row).find('[name^=txtRate]').val(),
    bonusAmount: $(row).find('.perClientBonusColumn input').eq(0).val(),
    bonusOver: $(row).find('.perClientBonusColumn input').eq(1).val(),
    minPay: $(row).find('[name^=txtMin]').val(),
    maxPay: $(row).find('[name^=txtMax]').val(),
    noRegRate: $(row).find('[name^=txtNoRegRate]').val(),
  }))

  //percentage rates
  percentageRates = $('.percPayRow').get().map( row => ({
    name: $(row).find('td').eq(0).text().trim(),
    percent: $(row).find('[name^=txtRate]').val(),
    minPay: $(row).find('[name^=txtMin]').val(),
    maxPay: $(row).find('[name^=txtMax]').val(),
    noRegRate: $(row).find('[name^=txtNoRegRate]').val(),
  }))

  //incremental rates
  incrementalRates = $('.incPayRow').get().map( row => {
    const first = $(row).find('.right.incrementalColumn').get().map( col => ({
      key: $(col).text().trim(),
      value: $(col).next().find('input').val()
    }))
    const second = $(row).next().find('.right.incrementalColumn').get().map( col => ({
      key: $(col).text().trim(),
      value: $(col).next().find('input').val()
    }))
    return {
      name: $(row).find('.incrementalRateNameColumn').text().trim(),
      rates: [...first, ...second],
      noRegRate: $(row).find('[name^=txtNoRegRate]').val(),
    }
  })

  //hourly rates
  hourlyRates = $('.timeclockCommissionRateNameColumn').get().map( row => ({
    name: $(row).text().trim(),
    rate: $(row).next().find('input').val()
  }))

  return {
    payRateTeacherId, 
    defaultRate, 
    classRates, 
    clientRates, 
    percentageRates, 
    incrementalRates, 
    hourlyRates
  }
}
