const mbFetch = require('./utils/mbFetch')
const sendToQueue = require('./utils/sendToQueue')
const FormData = require('form-data')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const date = event.item
  const method = 'post'
  const url = 'https://clients.mindbodyonline.com/classic/admmainclass?tabID=7'
  const query = qs.stringify({ tabID: 7 })
  const body = new FormData()
  body.append("txtDate", date)
  body.append("optLocation", 0)
  const classEvents = await mbFetch(`${url}?${query}`, { method, headers, body})
    .then(resp => parseClassEvents(resp))
  await sendToQueue(classEvents, 'getClassEventUsers')
  return Promise.resolve()
}

const parseClassEvents = resp => {
  const $ = cheerio.load(resp)
  let classEvents = []
  $('.cancelLink').map( (i, yogaClass) => {
    const classId = $(yogaClass).data('classid')
    if(classId){
      classEvents.push({
        id: classId,
        date: $(yogaClass).data('classdate'),
        teacherId: $(`a.trackResource[data-classid="${classId}"]`).data('trainerid'),
        location: $(yogaClass).parents('.gearColumn').siblings().eq(5).text().trim(),
        room: $(yogaClass).parents('.gearColumn').siblings().eq(6).text().trim(),
        teacher: $(yogaClass).data('teacher'),
        classTypeId: $(yogaClass).data('descriptionid'),
        classTitle: $(yogaClass).data('classname').trim(),
        time: $(yogaClass).parents('.gearColumn').siblings('.classTimeCol').text().trim()
      })
    }
  })
  return classEvents
}
