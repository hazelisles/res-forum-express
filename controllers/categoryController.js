const db = require('../models')
const Category = db.Category
const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true, nest: true
    }).then(categories => res.render('admin/categories', { categories }))
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入分類！')
      return res.redirect('back')
    } else {
      return Category.create({ name: req.body.name }).then((category) => res.redirect('/admin/categories'))
    }
  }
}
module.exports = categoryController