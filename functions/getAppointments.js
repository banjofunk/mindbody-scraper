const qs = require('querystring')
const moment = require('moment-timezone')
const { mbFetch, logger, sendToQueue, writeToDynamo } = require('./utils')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const format = 'MM/DD/YYYY'
  await logger(session, `starting appointments scraper`)
  const startDate = moment.utc(item.startDate, format).startOf('month')
  const endDate = moment.utc(item.endDate, format).endOf('month').startOf('day')
  const startMonth = endDate.clone().startOf('month')

  const url = 'https://clients.mindbodyonline.com/DailyStaffSchedule/DailyStaffSchedules'
  const params = {
    studioID: 6655,
    isLibAsync: true,
    isJson: true,
    startDate: startMonth.unix(),
    endDate: endDate.unix(),
    view: 'week',
    tabID: 9
  }
  const query = qs.stringify(params)
  console.log({session, startDate, endDate, params})

  const fetchParams = { 
    session, 
    url: `${url}?${query}`, 
    options: {},
    respType: 'json'
  }
  const appointments = await mbFetch(fetchParams)
    .then(resp => 
      Array.prototype.concat.apply([], 
        resp.json.map( d => d.Appointments)
      )
    )
  console.log('appointments', appointments)

  if(appointments && appointments.length > 0){
    const appointmentsId = `${startMonth.format(format)}_${endDate.format(format)}`
    await writeToDynamo('appointmentsId', { id: appointmentsId, appointments, total: appointments.length }, 'AppointmentsTable') 
  }

  if(startDate < startMonth){
    const newEndDate = startMonth.subtract(1, 'month').format(format)
    await logger(session, `queuing appointments: ${newEndDate}`)
    await sendToQueue({ endDate: newEndDate, startDate: item.startDate }, 'getAppointments', session)
  } else {
    await logger(session, `appointments scraper is complete`)
  }
  return appointments ? Promise.resolve() : Promise.reject()
}
