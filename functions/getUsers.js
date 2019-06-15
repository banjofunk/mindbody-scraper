const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `starting users scraper`)

  const url = 'https://clients.mindbodyonline.com/ASP/adm/adm_rpt_mailer.asp'
  const query = qs.stringify({ category: 'Clients' })
  const method = 'post'
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  }
  const body = bodyQueryParams()
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: { method, headers, body },
    parser: 'usersParser'
  }
  const users = await mbFetch(fetchParams)

  const endSlice = users.length
  const startSlice = session.prod ? 0 : users.length - 100
  const filteredUsers = users.slice(startSlice, endSlice)
  console.log('filteredUsers', filteredUsers)

  await sendToQueue(filteredUsers, 'getUserProfile', session)
  await logger(session, `total users: ${users.length}`)
  await logger(session, `total users with id: ${users.filter(user => user.id).length}`)
  await logger(session, `finished users scraper`)
  return Promise.resolve()
}

const bodyQueryParams = () => {
  return qs.stringify({
    "frmGenReport": true,
    "frmExpReport": true,
    "optListType": 1,
    "optListFor": 13,
    "optProspectYN": 2
  })
}
