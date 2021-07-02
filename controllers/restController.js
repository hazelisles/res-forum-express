const { sequelize } = require('../models')
const db = require('../models')
const restaurant = require('../models/restaurant')
const { Restaurant, Category, Comment, User } = db
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
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
        { model: User, as: 'FavoritedUsers', attributes: ['id'] },
        { model: User, as: 'LikedUsers', attributes: ['id'] },
        { model: Comment, include: [User] }
      ],
      order: [
        [Comment, 'updatedAt', 'DESC']
      ]
    }).then(async (restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.viewCounts += 1
      await restaurant.save({ fields: ['viewCounts'] })
      return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
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
  },
  getTop10: (req, res) => {
    return Restaurant.findAll({
      attributes: [
        'id', 'name', 'image', 'description', 'viewCounts',
        [sequelize.fn('count', sequelize.col('FavoritedUsers.id')), 'favoriteCount']
      ],
      group: 'id',
      include: [
        { model: User, as: 'FavoritedUsers', attributes: [] }
      ],
      limit: 10,
      order: [[sequelize.literal('favoriteCount'), 'desc'], ['viewCounts', 'desc']],
      subQuery: false,
      raw: true,
      nest: true
    }).then(restaurant => {
      restaurant = restaurant.map(r => ({
        ...r,
        isFavorited: req.user.FavoritedRestaurants.some(d => d.id === r.id)
      }))
      return res.render('top10', { restaurant })
    })
  }
}
module.exports = restController