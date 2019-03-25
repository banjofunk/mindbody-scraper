const parseAppointmentTypes = require('../parsers/appointmentTypes')
const parseUsers = require('../parsers/users')
const parseUserProfile = require('../parsers/userProfile')
const parseClassEvents = require('../parsers/classEvents')
const parseClassEventUsers = require('../parsers/classEventUsers')
const parseClassTypes = require('../parsers/classTypes')
const parseClassType = require('../parsers/classType')
const parseProductsByLetter = require('../parsers/productsByLetter')
const parseProductsByVariant = require('../parsers/productsByVariant')
const parseProductDetails = require('../parsers/productDetails')
const parsePricingDetails = require('../parsers/pricingDetails')
const parsePricings = require('../parsers/pricings')

module.exports = async (parser, resp) => {
  console.log('parser:', parser)
  switch (parser) {
    case 'usersParser':
      return parseUsers(resp)
    case 'userProfileParser':
      return parseUserProfile(resp)
    case 'appointmentTypesParser':
      return parseAppointmentTypes(resp)
    case 'classEventsParser':
      return parseClassEvents(resp)
    case 'classEventUsersParser':
      return parseClassEventUsers(resp)
    case 'classTypesParser':
      return parseClassTypes(resp)
    case 'classTypeParser':
      return parseClassType(resp)
    case 'ProductsByLetterParser':
      return parseProductsByLetter(resp)
    case 'ProductsByVariantParser':
      return parseProductsByVariant(resp)
    case 'productDetailsParser':
      return parseProductDetails(resp)
    case 'pricingDetailsParser':
      return parsePricingDetails(resp)
    case 'pricingsParser':
      return parsePricings(resp)
    default:
      return resp
  }
}
