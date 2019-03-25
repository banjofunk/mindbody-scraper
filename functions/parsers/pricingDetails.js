const dig = require('object-dig')

module.exports = (resp) => {
  const regex = /var jsonModel = JSON.parse\((.*?)\);/
  const scriptStr = dig(resp.match(regex), '1') || ''
  const objStr = JSON.parse(scriptStr)
  const obj = JSON.parse(objStr) || {}
  const selectedDurationUnit = obj.AvailableDurationUnits.find( u =>
    u.DurationUnitId === obj.SelectedDurationUnit
  )
  const selectedFrequencyLimitation = obj.AvailableFrequencyLimitations.find( u =>
    u.FrequencyLimitaionId === obj.SelectedFrequencyLimitation
  )
  const selectedRevenueCategories = obj.AvailableRevenueCategories.find( u =>
    u.RevenueCategoryId === obj.SelectedRevenueCategory
  )
  const selectedServiceCategory = obj.AvailableServiceCategories.find( u =>
    u.ServiceCategoryId === obj.SelectedServiceCategory
  )
  const selectedServiceType = obj.AvailableServiceTypes.find( u =>
    u.ServiceTypeId === obj.SelectedServiceType
  )
  return {
    id: dig(obj, 'PricingOptionId'),
    productId: dig(obj, 'PricingOptionProductId'),
    title: dig(obj, 'Name', ob => ob.trim()),
    duration: dig(obj, 'Duration'),
    durationUnit: dig(selectedDurationUnit, 'DurationUnitDisplayName'),
    numberOfSessions: dig(obj, 'NumberOfSessions'),
    price: dig(obj, 'Price'),
    onlinePrice: dig(obj, 'OnlinePrice'),
    frequencyLimitation: dig(selectedFrequencyLimitation, 'FrequencyLimitaionName'),
    revenueCategory: dig(selectedRevenueCategories, 'RevenueCategoryName'),
    serviceCategory: dig(selectedServiceCategory, 'ServiceCategoryDisplayName'),
    serviceType: dig(selectedServiceType, 'ServiceTypeDisplayName'),
    soldOnline: dig(obj, 'SoldOnline'),
    sellInMarketplace: dig(obj, 'SellInMarketplace'),
    notes: dig(obj, 'Notes'),
    taxes: dig(obj, 'Taxes', taxes => taxes.filter(tax => tax.Enabled)),
  }
}
