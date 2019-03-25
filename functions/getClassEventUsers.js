const mbFetch = require('./utils/mbFetch')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')
const logger = require('./utils/logger')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { item, session } = event
  await logger(session, `fetching class event users: ${item.id}`)
  const url = 'https://clients.mindbodyonline.com/classic/admclslist'
  const query = qs.stringify({
    pDate: item.date,
    pClsID: item.id
  })
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'classEventUsersParser'
  }
  const students = await mbFetch(fetchParams)
  await writeToDynamo('classId', {...item, students}, 'ClassEventsTable')
  return Promise.resolve()
}
