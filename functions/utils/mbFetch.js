const fetch = require('node-fetch')
const setCookie = require('set-cookie-parser')
const FormData = require('form-data')
const moment = require('moment')
const cheerio = require('cheerio')
const dig = require('object-dig')

const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36'
const sessionUrl = 'https://clients.mindbodyonline.com/classic/home?studioid=6655'
const loginUrl = 'https://clients.mindbodyonline.com/Login?studioID=6655&isLibAsync=true&isJson=true'

let token, resp
module.exports = async (input, init={}) => {
  if(token){
    console.log('----attempting to reuse token------')
  }
  token = token ? token : await getNewToken()
  resp = await fetchWithToken(input, init, token)
  for (const i of Array(5).fill(0)) {
    if(resp) { break } else {
      token = await getNewToken()
      resp = await fetchWithToken(input, init, token)
    }
  }
  return resp
}

const fetchWithToken = async (input, init, token) => {
  if(!init.headers) { init.headers = {} }
  init.headers['Cookie'] = token
  init.headers['User-Agent'] = userAgent
  return await fetch(input, init)
    .then(resp => resp.text())
    .then(resp => {
      const $ = cheerio.load(resp)
      const firstScript = $('body > script').eq(0).html().trim()
      if(firstScript === 'mb.sessionHelpers.resetSession();'){
        return false
      }
      return resp
    })
}

const getNewToken = async () => {
  console.log('---fetching token---')
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
  await fetch(sessionUrl, { headers: { 'User-Agent': userAgent, 'Cookie': token } })
  return token
}
