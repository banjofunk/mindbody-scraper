const cheerio = require('cheerio')
const dig = require('object-dig')
const moment = require('moment')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  const createDateStr = $('#contactloginfo .textOnly').text()
  const createdOn = moment(createDateStr, "MMMM D, YYYY").format('MM/DD/YYYY')
  const relationships = $('#relationships .smallTextBlack').get().map(r => {
    const relationshipData = dig($(r).parent().children().eq(0).attr('href').match(/\((.*?)\);$/), '1') || ""
    return {
      typeId:relationshipData.split(',')[0],
      type: $(r).parent().text().trim().split('\n')[0],
      id:relationshipData.split(',')[1],
      name: $(r).text()
    }
  })
  return {
    id: $('#rssidAssignConsumerId').val(),
    barcode: $('#numClientID').val(),
    name:{
      firstName: $('#requiredtxtFirst_Name').val(),
      middleName: $('#txtMiddleName').val(),
      lastName: $('#requiredtxtLast_Name').val(),
      nickname: $('#txtDear').val()
    },
    email: $('#txtEmail').val(),
    phone: {
      cellPhone: $('#txtCellPhone').val(),
      homePhone: $('#txtHomePhone').val(),
      workPhone: $('#txtWorkPhone').val(),
      workPhoneExt: $('#txtWorkExtension').val()
    },
    address: {
      address1:$('[name=origtxtAddress]').val(),
      address2:$('[name=origtxtAddress2]').val(),
      city:$('[name=origtxtCity]').val(),
      state:$('[name=origState]').val(),
      zip:$('[name=origtxtZip]').val()
    },
    billing: {
      billingAddress: $('#txtBillingAddress').val(),
      billingCity: $('#txtBillingCity').val(),
      billingState: $('#optBillingState [selected]').val(),
      billingZip: $('#txtBillingZip').val(),
      ccNumber: $('#txtCCNumber').val(),
      ccExpMonth: $('#optExpMonth [selected]').val() || '',
      ccExpYear: $('#optExpYear [selected]').val() || '',
      ccExpMonth: $('#optExpMonth [selected]').val() || ''
    },
    notes: $('#txtClientNotes').text(),
    memberStatus: $('#memberstatus label').eq(0).text(),
    gender: $('#optGender [selected]').text(),
    birthday: $('#txtBirthday').val(),
    location: $('#optHomeStudio [selected]').not(function(i, loc){return $(this).val() === "0"}).eq(0).text(),
    createdOn,
    relationships,
    emergencyContact: {
      name: $('#emergencycontact #txtEmergContact').val(),
      relationship: $('#emergencycontact #txtRelationship').val(),
      phone: $('#emergencycontact #txtEmerPhone').val(),
      email: $('#emergencycontact #txtEmerEmail').val()
    },
    reminderEmails:{
      account: $('#optAccountEmail').attr('checked') === "checked",
      schedule: $('#optScheduleEmail').attr('checked') === "checked",
      promo: $('#optPromoEmail').attr('checked') === "checked"
    }
  }
}
