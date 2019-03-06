const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });
const qs = require('querystring')

let token = false
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()

  const url = 'https://clients.mindbodyonline.com/ASP/adm/adm_rpt_mailer.asp?category=Clients'
  const method = 'post'
  const headers = {
    "Cookie": token,
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded"
  }
  const body = qs.stringify({
    "frmGenReport": true,
    "frmExpReport": true,
    "optListType": 1,
    "optListFor": 13,
    "optProspectYN": 2
  })
  await fetch(url, { method, headers, body })
    .then(resp => resp.text())
    .then(async resp => {
      const $ = cheerio.load(resp)
      const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
      if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
        token = await getToken()
        return false
      }
      const totalUsers = dig($('[colspan=20]').text().match(/Total clients: (.*?)$/), '1')
      const users =  $('.resultRow').map( (i, row) => {
        return {
          id: $(row).children().eq(3).text(),
          firstName: $(row).children().eq(1).text(),
          lastName: $(row).children().eq(0).text(),
          email: $(row).children().eq(4).text(),
          phone: $(row).children().eq(5).text()
        }
      }).get()
      let filteredUsers = users.filter(user => {
        const id = user.id !== ''
        const firstName = user.firstName !== ''
        const lastName = user.lastName !== ''
        const email = user.email !== ''
        const phone = user.phone !== ''
        return id && firstName && lastName && email && phone
      })

      const chunkSize = event.chunkSize || 10
      const endSlice = filteredUsers.length
      const startSlice = filteredUsers.length - chunkSize
      filteredUsers = filteredUsers.slice(startSlice, endSlice)

      let entries = []
      for (const user of filteredUsers) {
          const Id = `user-${user.id}`
          const MessageBody = JSON.stringify(user)
          entries.push({ Id, MessageBody })
      }
      console.log('entries', entries)

      let i,j,entryChunk
      for (i=0,j=entries.length; i<j; i+=10) {
        entryChunk = entries.slice(i,i+10)
        params = {
          Entries: entryChunk,
          QueueUrl: process.env.clientQueueUrl
        };
        await sqs.sendMessageBatch(params).promise()
          .then(data => {
            const passCount = data.Successful.length
            const failCount = data.Failed.length
            console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
          })
          .catch(err => { console.log('sqs send error:', err, err.stack) })
      }
      console.log({ users: filteredUsers, expectedTotalUsers: totalUsers, totalUsers: users.length })
    })
  return Promise.resolve()

}
