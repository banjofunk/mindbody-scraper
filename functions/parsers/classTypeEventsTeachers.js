const cheerio = require('cheerio')
const moment = require('moment')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  startVal = $('input[name=requiredtxtDateStart]').val()
  start = moment(startVal, 'M/D/YYYY');
  endVal = $('input[name=requiredtxtDateEnd]').val()
  end = moment(endVal, 'M/D/YYYY');
  classDates = [];

  days = []
  daysStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for(const [idx, day] of daysStr.entries()){
    if($(`input[name=optDay${day}old]`).val() === 'on') {
      days.push(idx)
    }
  }

  for( const day of days){
    tmp = start.clone().day(day);
    if( tmp.isAfter(start, 'd') ){
      classDates.push(tmp.format('M/D/YYYY'));
    }
    while( tmp.isBefore(end) ){
      tmp.add(7, 'days');
      classDates.push(tmp.format('M/D/YYYY'));
    }
  }

  const resourceId = dig(
    $('#table9 .trackResource').eq(0).attr('href') || '',
    x => x.match(/\((.*?),/),
    "1"
  )

  const resource = resourceId ? $('#table9 .trackResource').eq(0).parents('td').eq(0).text().replace('Clear all rooms', '').trim() : false

  defaultTeacher = {
    teacher: $('input[name=optClassTrainer]').prev().text().trim(),
    rate: $('input[name=optpayScale]').prev().text().trim(),
    days,
    resourceId,
    resource,
    locationId: $('input[name=locationOpt]').val(),
    location: $('input[name=locationOpt]').parent().text().replace('Location:','').trim(),
    startTime: $('input[name=requiredoptStartTime]').val(),
    endTime: $('input[name=requiredoptEndTime]').val(),
    startDate: $('input[name=requiredtxtDateStart]').val(),
    endDate: $('input[name=requiredtxtDateEnd]').val(),
    capacity: $('input[name=requiredtxtMaxCapacity]').val(),
    onlineCapacity: $('input[name=requiredtxtClassCapacity]').val(),
  }

  classTeachers = {}
  for(const classDate of classDates){
    classTeachers[classDate] = {...defaultTeacher, classDate}
  }

  $('#table11').find('tr[bgcolor]').get().forEach( row => {
    const classDate = $(row).find('td').eq(3).text().trim()
    const teacher = $(row).find('td').eq(0).text().trim()
    classTeachers[classDate] = {
      teacher: teacher === "Class Cancelled" ? teacher : false, 
      rate: $(row).find('td').eq(1).text().trim(),
      days,
      classDate,
      resourceId,
      resource,
      locationId: $('input[name=locationOpt]').val(),
      startTime: $('input[name=requiredoptStartTime]').val(),
      endTime: $('input[name=requiredoptEndTime]').val(),
      startDate: $('input[name=requiredtxtDateStart]').val(),
      endDate: $('input[name=requiredtxtDateEnd]').val(),
      capacity: $('input[name=requiredtxtMaxCapacity]').val(),
      onlineCapacity: $('input[name=requiredtxtClassCapacity]').val(),
    }
  })

  return Object.values(classTeachers)
}
