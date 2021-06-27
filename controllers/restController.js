const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const query = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      query.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: query, offset: offset, limit: pageLimit }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name
      }))
      Category.findAll({ raw: true, nest: true }).then(categories => {
        return res.render('restaurants', { restaurants: data, categories, categoryId, page, totalPage, prev, next })
      })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ],
      order: [
        [Comment, 'updatedAt', 'DESC']
      ]
    }).then(async (restaurant) => {
      restaurant.viewCounts += 1
      await restaurant.save({ fields: ['viewCounts'] })
      return res.render('restaurant', { restaurant: restaurant.toJSON() })
    })
  },
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'desc']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'desc']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants, comments
      })
    })
  },
  getDash: (req, res) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, {
        include: [Category]
      }),
      Comment.findAndCountAll({ where: { RestaurantId: req.params.id } })
    ]).then(([r, c]) => {
      const count = c.count
      const restaurant = r.toJSON()
      res.render('dashboard', { restaurant, count })
    })
  }
}
module.exports = restController