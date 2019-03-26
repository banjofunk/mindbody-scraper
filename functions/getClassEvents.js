const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const FormData = require('form-data')
const qs = require('querystring')
const logger = require('./utils/logger')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const method = 'post'
  // const url = 'https://clients.mindbodyonline.com/classic/admmainclass'
  const url = 'https://clients.mindbodyonline.com/classic/admmainclas'
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
  return await mbFetch(fetchParams)
    .then( async classEvents => {
      console.log('classEvents', classEvents)
      await logger(session, `fetched class Events for: ${item}`)
      // await sendToQueue(classEvents, 'getClassEventUsers', session)
      return Promise.resolve()
    })
    .catch( async err => {
      await logger(session, `**Error fetching class Events for ${item}**`)
      return Promise.reject()
    })
}
