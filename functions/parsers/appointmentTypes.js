const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.js-appointment-type').get().map( appt => {
    const pricing = $(appt).find('.pricing-table tbody tr').get().map( pricing => {
      return {
        id: $(pricing).find('.trash-can').data('seriesid'),
        title: $(pricing).find('.nameContainer span').eq(0).attr('title'),
        singleSession: $(pricing).find('.nameContainer .app-subText').text().trim() === "Single session"
      }
    })
    const staff = $(appt).find('.appointmentStaffTable tbody tr').get().map( staff => {
      return {
        id: $(staff).find('.trash-can').data('staffid'),
        name: $(staff).find('.trash-can').data('staffname'),
        payRateType: $(staff).find('.js-pay-rate-type [selected]').text(),
        percentageRate: $(staff).find('#spanForPercentPay input').val(),
        flatRate: $(staff).find('#spanForPayAmount input').val()
      }
    })
    return {
      id: $(appt).find('.js-toggle-appointment-type').data('appointmenttypeid'),
      title: $(appt).find('.js-collapseAppointmentTypeTitle').text().trim(),
      categoryId: $(appt).data('servicecategoryid'),
      category: $(appt).parents('.js-serviceCategory').find('.serviceCatName').text().trim(),
      pricing,
      staff
    }
  })
}
