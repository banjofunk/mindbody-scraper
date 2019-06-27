const moment = require('moment')
const qs = require('querystring')
const { mbFetch, logger, sendToQueue, writeToDynamo } = require('./utils')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session, item } = event
  const format = 'MM/DD/YYYY'
  const startDate = item.startDate ? moment(item.startDate, format) : moment().subtract(1, 'month')
  let endDate = item.endDate ? moment(item.endDate, format) : moment()
  await logger(session, `getting sales range: ${startDate.format(format)} - ${endDate.format(format)}`)
  let endDateStr, startDateStr
  let qparams = []
  while(startDate <= endDate) {
    endDateStr = endDate.format(format)
    startDateStr = startDate.format(format)
    qparams.push({ endDate: endDateStr, startDate: startDateStr})
    endDate = endDate.subtract(1, 'month')
  }
  await Promise.all(qparams.map( params => {
    return sendToQueue(params, 'getSales', session)
  }))
  await logger(session, `queued sales calls: ${qparams.length}`)
  return Promise.resolve()
}

