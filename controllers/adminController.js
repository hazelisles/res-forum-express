const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
    const { file } = req
    const { name, tel, address, opening_hours, description } = req.body
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name, tel, address, opening_hours, description, image: file ? img.data.link : null
        }).then((restaurant) => {
          req.flash('success_messages', '成功新增餐廳！')
          res.redirect('/admin/restaurants')
        })
      })
    } else {
      return Restaurant.create({
        name, tel, address, opening_hours, description, image: null
      }).then((restaurant) => {
        req.flash('success_messages', '成功新增餐廳！')
        res.redirect('/admin/restaurants')
      })
    }
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
    const { file } = req
    const { name, tel, address, opening_hours, description } = req.body
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
          restaurant.update({
            name, tel, address, opening_hours, description, image: file ? img.data.link : restaurant.image
          }).then((restaurant) => {
            req.flash('success_messages', '成功修改餐廳！')
            res.redirect('/admin/restaurants')
          })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        restaurant.update({
          name, tel, address, opening_hours, description, image: restaurant.image
        })
      }).then((restaurant) => {
        req.flash('success_messages', '成功修改餐廳資訊！')
        res.redirect('/admin/restaurants')
      })
    }
  },
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.destroy().then(() => {
        res.redirect('/admin/restaurants')
      })
    })
  },
  getUsers: (req, res) => {
    return User.findAll({ raw: true }).then(users => {
      return res.render('admin/restaurants', { users })
    })
  },
  toggleAdmin: (req, res) => {
    console.log('toggle')
  }
}
module.exports = adminController