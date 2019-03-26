const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting resources scraper`)

  const url = 'https://clients.mindbodyonline.com/ResourceManagement/GetResourceManagementData'
  const fetchParams = {
    session,
    url,
    options: {},
    respType: 'json'
  }
  const resources = await mbFetch(fetchParams)
  console.log('resources', resources)
  return resources
}
