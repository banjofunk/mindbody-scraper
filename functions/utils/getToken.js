const fetch = require('node-fetch')
const setCookie = require('set-cookie-parser')
const FormData = require('form-data')
const moment = require('moment')

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
const sessionUrl = 'https://clients.mindbodyonline.com/classic/home?studioid=6655'
const loginUrl = 'https://clients.mindbodyonline.com/Login?studioID=6655&isLibAsync=true&isJson=true'

module.exports = async () => {
  const session = await fetch(sessionUrl, { headers: { 'User-Agent': userAgent } })
    .then(resp => resp.headers.get('set-cookie'))
    .then(combinedCookies => setCookie.splitCookiesString(combinedCookies))
    .then(parseCookies => setCookie.parse(parseCookies))
    .then(cookies => cookies.find(c => c.name === "SessionFarm%5FGUID"))
    .then(session => `${session.name}=${session.value}`)
  await fetch(sessionUrl, { headers: { 'User-Agent': userAgent, 'Cookie': session } })

  const form = new FormData()
  form.append('requiredtxtUserName', 'JoshGarner')
  form.append('requiredtxtPassword', 'Namaspa108')
  const token = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Cookie': session, 'User-Agent': userAgent },
    body: form
  })
    .then(resp => resp.headers.get('set-cookie'))
    .then(combinedCookies => setCookie.splitCookiesString(combinedCookies))
    .then(parseCookies => setCookie.parse(parseCookies))
    .then(cookies => {
      const idsrvauth = cookies.find(c => c.name === "idsrvauth")
      const idsrvauth1 = cookies.find(c => c.name === "idsrvauth1")
      return `${session};${idsrvauth.name}=${idsrvauth.value};${idsrvauth1.name}=${idsrvauth1.value};`
    })
  await fetch(sessionUrl, { headers: { 'User-Agent': userAgent, 'Cookie': session } })

  return token
}
