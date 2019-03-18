const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const url = 'https://clients.mindbodyonline.com/ASP/adm/adm_rpt_mailer.asp'
  const query = qs.stringify({ category: 'Clients' })
  const method = 'post'
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  }
  const body = bodyQueryParams()
  const users = await mbFetch(`${url}?${query}`, { method, headers, body })
    .then(resp => parseUsers(resp))

  const endSlice = users.length
  const startSlice = users.length - 10
  const filteredUsers = users.slice(startSlice, endSlice)

  await sendToQueue(filteredUsers, 'getUserProfile')
  return Promise.resolve()
}

const parseUsers = resp => {
  const $ = cheerio.load(resp)
  return $('.resultRow').get().map(user => {
    return {
      id: $(user).children().eq(3).text(),
      firstName: $(user).children().eq(1).text(),
      lastName: $(user).children().eq(0).text(),
      email: $(user).children().eq(4).text(),
      phone: $(user).children().eq(5).text()
    }
  })
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
