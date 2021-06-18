const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants })
    })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入餐廳名稱')
      return res.redirect('back')
    }
    const { name, tel, address, opening_hours, description } = req.body
    return Restaurant.create({
      name, tel, address, opening_hours, description
    }).then((restaurant) => {
      req.flash('success_messages', '成功新增餐廳！')
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => res.render('admin/restaurant', { restaurant }))
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => res.render('admin/create', { restaurant }))
  },
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '餐廳名稱不可以空白')
      return res.redirect('back')
    }
    const { name, tel, address, opening_hours, description } = req.body
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.update({
        name, tel, address, opening_hours, description
      })
    }).then((restaurant) => {
      req.flash('success_messages', '成功修改餐廳！')
      res.redirect('/admin/restaurants')
    })
  }
}
module.exports = adminController