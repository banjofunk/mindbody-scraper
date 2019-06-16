const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  const payRates = $('.appointmentTypeDetails').get().map(row => {
    return {
      appointmentType: $(row).find('td.serviceCategory span').attr('title'),
      category: $(row).find('td.serviceName span').attr('title'),
      duration: $(row).find('input[name=PayRateTimeLength]').val(),
      payType: $(row).find('.commissionType [selected]').text(),
      percentPay: $(row).find('input[name=PayRatePercentageCommission]').val(),
      flatPay: $(row).find('input[name=PayRateFlatComision]').val(),
    }
  })
  const defaultPayRate = {
    payType: $('#DefaultAppointmentPayRate_PayRateType [selected]').text(),
    flatPay: $('#DefaultAppointmentPayRate_PayAmount').val(),
    percentPay: $('#DefaultAppointmentPayRate_PercentPay').val()
  }
  return { defaultPayRate, payRates }
}
