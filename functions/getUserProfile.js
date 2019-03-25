const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching user: ${item.id} - ${item.firstName} ${item.lastName}`)

  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_clt_profile.asp'
  const query = qs.stringify({ id: item.id })

  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'userProfileParser'
  }
  const client = await mbFetch(fetchParams)
  await writeToDynamo('clientId', client, 'ClientsTable')
  return Promise.resolve()
}
