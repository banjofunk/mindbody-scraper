const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching staff member appointment availability: ${item.id} - ${item.firstname} ${item.lastname}`)

  const url = 'https://clients.mindbodyonline.com/StaffSchedule/StaffCentricSchedule'
  const query = qs.stringify({ id: item.id })

  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'staffMemberApptAvailabilityParser'
  }
  const availabilities = await mbFetch(fetchParams)
  await writeToDynamo('staffMemberId', {...item, availabilities}, 'StaffTable')
  return Promise.resolve()
}
