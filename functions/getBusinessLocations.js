const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting business & locations scraper`)

  const url = 'https://clients.mindbodyonline.com/BusinessAndConnectLocations/BusinessAndLocationData'
  const headers = {"Content-Type":"application/json"}
  const fetchParams = {
    session,
    url,
    options: { method:'post', headers, body:{} },
    respType: 'json'
  }
  const businessLocations = await mbFetch(fetchParams)
  console.log('businessLocations', businessLocations)
  return businessLocations
}
