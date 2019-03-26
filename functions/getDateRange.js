const sendToQueue = require('./utils/sendToQueue')
const logger = require('./utils/logger')
const moment = require('moment')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session, item } = event
  await logger(session, `starting class event scraper`)
  let currentMoment = moment()
  const endMoment = session.prod
    ? moment(item.endDate, "MM/DD/YYYY")
    : moment().subtract(1, "days")
  console.log('currentMoment',currentMoment.format('MM/DD/YYYY'))
  console.log('endMoment',endMoment.format('MM/DD/YYYY'))
  let date
  while(currentMoment > endMoment){
    date = currentMoment.format('MM/DD/YYYY')
    console.log('date', date)
    await sendToQueue(date, 'getClassEvents', session)
    currentMoment = currentMoment.subtract(7, "days")
  }
  return Promise.resolve()
}
