const mbFetch = require('./utils/mbFetch')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')
const logger = require('./utils/logger')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { item, session } = event
  const dynamoId = `${item.scheduleId}_${item.classDate}`
  await logger(session, `fetching class event users: ${dynamoId}`)
  const url = 'https://clients.mindbodyonline.com/classic/admclslist'
  const query = qs.stringify({
    pDate: item.classDate,
    pClsID: item.scheduleId
  })
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'classEventUsersParser'
  }
  const { students, teacherId } = await mbFetch(fetchParams)
  await writeToDynamo('classId', {...item, id: dynamoId, students, teacherId}, 'ClassEventsTable')
  return Promise.resolve()
}
