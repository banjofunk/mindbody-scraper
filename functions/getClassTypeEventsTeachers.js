const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const qs = require('querystring')
const moment = require('moment')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  const { id, classId } = item
  await logger(session, `Item: ${JSON.stringify(item)}`)
  await logger(session, `fetching class type events teachers: ${id}, classId: ${classId}`)
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_cs_e.asp'
  const query = qs.stringify({ classID: id })
  const fetchParams = { session, url: `${url}?${query}`, options: {}, parser: 'classTypeEventsTeachersParser' }
  const classTypeEventsTeachers = await mbFetch(fetchParams)
  const classEvents = classTypeEventsTeachers.map(teachers => ({
    ...teachers, 
    id: `${classId}_${teachers.classDate}`,
    classId, 
    scheduleId: id
  }))

  const queueItems = session.prod 
    ? classEvents 
    : classEvents
        .filter(cls => (moment(cls.classDate, 'M/D/YYYY') < moment()))
        .filter(cls => cls.teacher)
        .slice(0,10)
  await logger(session, `classEvents: ${JSON.stringify(queueItems)}`)
  await Promise.all(queueItems.map( queueItem => 
    sendToQueue(queueItem, 'getClassEventUsers', session)
  ))

  return Promise.resolve()
}
