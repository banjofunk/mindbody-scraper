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
  await sendToQueue(staff, 'getStaffMember', session)
  return Promise.resolve()
}
