const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')
const logger = require('./utils/logger')
const moment = require('moment')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const method = 'POST'
  const url = 'https://clients.mindbodyonline.com/MonthCalendar/GetSchedule'
  const fetchParams = {
    session,
    url,
    respType: 'json',
    form: {
      "start": moment(item, "MM/DD/YYYY").startOf('month').unix(),
      "end": moment(item, "MM/DD/YYYY").endOf('month').unix(),
      "optViewBy": 0,
    },
    options: { method }
  }
  return await mbFetch(fetchParams)
    .then( async classEvents => {
      console.log('classEvents', classEvents)
      await logger(session, `fetched class Events for: ${item}`)
      await sendToQueue(classEvents, 'getClassEventUsers', session)
      return Promise.resolve()
    })
    .catch( async err => {
      await logger(session, `**Error fetching class Events for ${item}**`)
      return Promise.reject()
    })
}
