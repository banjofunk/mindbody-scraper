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
  let date
  while(currentMoment > endMoment){
    date = currentMoment.format('MM/DD/YYYY')
    await sendToQueue(date, 'getClassEvents', session)
    currentMoment = currentMoment.subtract(7, "days")
  }
  return Promise.resolve()
}
