const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.js-parentRowForEdit').get().map(row => {
    const startDate = $(row).find('.dateBox').hasClass('hidden')
      ? false
      : $(row).find('.dateBox .startDate').val()
    const endDate = $(row).find('.dateBox').hasClass('hidden')
      ? false
      : $(row).find('.dateBox .startDate').val()
    return {
      day: $(row).find('.trash-can').data('day'),
      location: $(row).find('select.locations [selected]').text(),
      startTime: $(row).find('select.startTime [selected]').text(),
      endTime: $(row).find('select.endTime [selected]').text(),
      category: $(row).find('select[name=SelectedServiceIds] [selected]').text(),
      frequency: $(row).find('select.dateRangeTypeDropdown [selected]').text(),
      public: !$(row).find('.settingsMan').hasClass('hide'),
      startDate,
      endDate
    }
  })
}
