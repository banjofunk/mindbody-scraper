const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const writeToDynamo = require('./utils/writeToDynamo')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting class types scraper`)

  const url = 'https://clients.mindbodyonline.com/servicesandpricing/classes'
  const fetchParams = { session, url, options: {}, parser: 'classTypesParser' }
  const { classCategories, classTypes } = await mbFetch(fetchParams)
  await Promise.all(classCategories.map(category =>
    writeToDynamo('classCategoryId', category, 'ClassCategoriesTable')
  ))
  const queueItems = session.prod ? classTypes : classTypes.filter(ct => ct.programId === '22').slice(0,10)
  await Promise.all(queueItems.map(queueItem => sendToQueue(queueItem, 'getClassTypeEvents', session)))
  await Promise.all(queueItems.map(queueItem => sendToQueue(queueItem, 'getClassTypeDetails', session)))
  return Promise.resolve()
}
