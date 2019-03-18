const sendToQueue = require('./utils/sendToQueue')
const moment = require('moment')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { start, end } = event
  let currentMoment = moment(start, "MM/DD/YYYY")
  const endMoment = moment(end, "MM/DD/YYYY")
  let dates = []
  while(currentMoment > endMoment){
    dates.push(currentMoment.format('MM/DD/YYYY'))
    currentMoment = currentMoment.subtract(7, "days")
  }
  await sendToQueue(dates, 'getClassEvents')
  return Promise.resolve()
}
