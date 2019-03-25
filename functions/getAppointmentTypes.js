const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const writeToDynamo = require('./utils/writeToDynamo')
const cheerio = require('cheerio')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting appointment type scraper`)

  const url = 'https://clients.mindbodyonline.com/servicesandpricing/appointments'

  const fetchParams = { session, url, options: {}, parser: 'appointmentTypesParser' }
  const appointmentTypes = await mbFetch(fetchParams)
  await Promise.all(appointmentTypes.map(appointmentType => {
    return writeToDynamo('appointmentTypeId', appointmentType, 'AppointmentTypesTable')
  }))
  return Promise.resolve()
}
