const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching staff member: ${item.id} - ${item.firstname} ${item.lastname}`)

  const url = `https://clients.mindbodyonline.com/asp/adm/adm_trn_e.asp`
  const query = qs.stringify({ trnID: item.id })

  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'staffMemberParser'
  }
  const staffMember = await mbFetch(fetchParams)
  await sendToQueue({...item, ...staffMember}, 'getStaffMemberPayRates', session)
  return Promise.resolve()
}
