const cheerio = require('cheerio')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('#classSchedulesTable tbody tr').get().map( cls => ({
    id: $(cls).attr('id').replace('classSchedule', ''),
    active: $(cls).hasClass('activeClassSchedule')
  }))
}
