const cheerio = require('cheerio')
const dig = require('../utils/dig')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return {
    email: $('#txtEmail').val(),
    cellPhone: $('#txtCellPhone').val(),
    homePhone: $('#txtHomePhone').val(),
    workPhone: $('#txtWorkPhone').val(),
    workExt: $('#txtWorkExt').val(),
    notifyBy: $('#optContactBy [selected]').text(),
    address: $('#txtAddress').val(),
    city: $('#txtCity').val() || '',
    zip: $('#txtZip').val() || '',
    description: $('#txtBio').text(),
    group: $('#staffGroup [selected]').text(),
    locations: $('#locDDMulti [selected]').get().map(loc => $(loc).text()),
    gender: $('.gender [checked]').val(),
    image: $('.staff-profile-logo').attr('src')
  }
}
