const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching staff member pay rates: ${item.id} - ${item.firstname} ${item.lastname}`)

  const url = `https://clients.mindbodyonline.com/asp/adm/adm_trn_cls_payrates.asp`
  const query = qs.stringify({ TID: item.id })

  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'staffMemberPayRateParser'
  }
  const payRates = await mbFetch(fetchParams)
  await sendToQueue({...item, payRates}, 'getStaffMemberApptPay', session)

  return Promise.resolve()
}
