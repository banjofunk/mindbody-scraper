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
  const { Resources, Locations, ServiceCategoryVisitTypes } = await mbFetch(fetchParams)
  const locations = Locations.map(l => ({...l, id: l.Id}))
  const resources = Resources.map(r => ({...r, id: r.ResourceId}))
  const visits = ServiceCategoryVisitTypes.map(v => ({...v, id: v.VisitTypeId}))
  const resourceLengths = { locations: locations.length, resources: resources.length, visits: visits.length }
  await logger(session, `Processing Resources: ${JSON.stringify(resourceLengths)}`)
  await Promise.all(resources.map(resource => 
    writeToDynamo('resourceId', resource, 'ResourcesTable')
  ))
  await Promise.all(locations.map(location => 
    writeToDynamo('locationId', location, 'LocationsTable')
  ))
  await Promise.all(visits.map(visit => 
    writeToDynamo('serviceCategoryVisitTypeId', visit, 'ServiceCategoryVisitTypesTable')
  ))
  return Promise.resolve()
}
