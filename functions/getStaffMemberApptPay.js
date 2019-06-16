const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching staff member appointment pay rates: ${item.id} - ${item.firstname} ${item.lastname}`)
  const url = `https://clients.mindbodyonline.com/StaffServices/Index/${item.id}`
  const fetchParams = {
    session,
    url,
    options: {},
    parser: 'staffMemberApptPayParser'
  }
  const appointmentPayRates = await mbFetch(fetchParams)
  await sendToQueue({...item, appointmentPayRates}, 'getStaffMemberApptAvailability', session)
  return Promise.resolve()
}
