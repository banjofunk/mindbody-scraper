const cheerio = require('cheerio')

module.exports = (resp) => {
  const $ = cheerio.load(resp)
  return $('.productRow').get().map( prod => {
    const prodId = $(prod).find('.optDiscontinued').attr('name').match(/\d+/g).join('')
    const variants = $(prod).find('.productWithVariants').attr('href') ? true : false
    return {
      id: prodId,
      variants,
      name: $(prod).find('.productNameCell').text().trim(),
      price: $(prod).find('.requiredtxtPrice').val(),
      onlinePrice: $(prod).find('.requiredtxtOnlinePrice').val(),
      cost: $(prod).find('.requiredtxtOurCost').val(),
      weight: $(prod).find('.requiredtxtWeight').val(),
      active: !$(prod).find('.optDiscontinued').prop('checked'),
      createdDate: $(prod).find(`[name=optProdCreatedDate${prodId}]`).val(),
      modifiedDate: $(prod).find(`[name=optProdModifiedDate${prodId}]`).val(),
      userId: $(prod).find(`[name=optProdCreatedBy${prodId}]`).val(),
      user: $(prod).find(`[name=optProdCreatedBy${prodId}]`).parent().text().trim().replace('---',''),
    }
  })
}
