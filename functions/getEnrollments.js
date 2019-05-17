const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `starting enrollments scraper`)

  const url = 'https://clients.mindbodyonline.com/servicesandpricing/enrollments'
  const fetchParams = {
    session,
    url,
    options: {},
    parser: 'enrollmentsParser'
  }
  const enrollments = await mbFetch(fetchParams)
  const queueItems = session.prod ? enrollments : enrollments.slice(0,11)
  await sendToQueue(queueItems, 'getEnrollmentDetails', session)
  await logger(session, `processing ${queueItems.length} enrollments`)
  return Promise.resolve()
}
