const db = require('../models')
const Category = db.Category
const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true, nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then((category) => {
          return res.render('admin/categories', { categories, category: category.toJSON() })
        })
      } else {
        return res.render('admin/categories', { categories })
      }
    })
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入分類！')
      return res.redirect('back')
    } else {
      return Category.create({ name: req.body.name }).then((category) => res.redirect('/admin/categories'))
    }
  },
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '分類名稱不能空白！')
      return res.redirect('back')
    } else {
      req.flash('success_messages', '成功修改分類！')
      return Category.findByPk(req.params.id).then((category) => {
        category.update(req.body).then(() => res.redirect('/admin/categories'))
      })
    }
  }
}
module.exports = categoryController