const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const FormData = require('form-data')
const qs = require('querystring')
const logger = require('./utils/logger')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching class Events: ${item}`)
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/classic/admmainclass'
  const query = qs.stringify({ tabID: 7 })
  const body = new FormData()
  body.append("txtDate", item)
  body.append("optLocation", 0)
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: { method, body },
    parser: 'classEventsParser'
  }
  const classEvents = await mbFetch(fetchParams)
  console.log('classEvents', classEvents)
  await sendToQueue(classEvents, 'getClassEventUsers', session)
  return Promise.resolve()
}
