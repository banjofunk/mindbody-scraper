const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const { id, active, name } = item
  await logger(session, `fetching class type events: ${id} - ${name}`)
  const url = 'https://clients.mindbodyonline.com/ServicesAndPricingClassDetail/Index'
  const query = qs.stringify({ id })
  const fetchParams = { session, url: `${url}?${query}`, options: {}, parser: 'classTypeEventsParser' }
  const classTypeEvents = await mbFetch(fetchParams)
  const classIds = classTypeEvents.map(evt => ({...evt, classId: id}))
  await logger(session, `classTypeEvents: ${JSON.stringify(classIds)}`)
  const queueItems = session.prod ? classIds : classIds.slice(0,10)
  await Promise.all(queueItems.map( queueItem => 
    sendToQueue(queueItem, 'getClassTypeEventsTeachers', session)
  ))
  return Promise.resolve()
}
