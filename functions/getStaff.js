const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting staff scraper`)

  const url = 'https://clients.mindbodyonline.com/staff/manage'
  const fetchParams = {
    session,
    url,
    options: {},
    parser: 'staffParser'
  }
  const staff = await mbFetch(fetchParams)

  const queueItems = session.prod 
    ? staff 
    : staff.slice(0,10)

  await sendToQueue(queueItems, 'getStaffMember', session)
  return Promise.resolve()
}
