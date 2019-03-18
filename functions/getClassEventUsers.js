const mbFetch = require('./utils/mbFetch')
const writeToDynamo = require('./utils/writeToDynamo')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const yogaClass = event.item
  const url = 'https://clients.mindbodyonline.com/classic/admclslist'
  const query = qs.stringify({
    pDate: yogaClass.date,
    pClsID: yogaClass.id
  })
  const students = await mbFetch(`${url}?${query}`)
    .then(resp => parseClassEventUsers(resp))
  await writeToDynamo('classId', {...yogaClass, students}, 'ClassEventsTable')
  return Promise.resolve()
}

const parseClassEventUsers = (resp) => {
  const $ = cheerio.load(resp)
  return $('.clientName').get().map(client => {
    const id = $(client).attr('href').match(/ID=(.*?)&/)[1]
    const name = $(client).text().trim()
    const firstName = name.split(',')[1].trim()
    const lastName = name.split(',')[0].trim()
    return { id, firstName, lastName }
  })
}
