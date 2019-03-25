const cheerio = require('cheerio')

module.exports = (resp) => {
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
