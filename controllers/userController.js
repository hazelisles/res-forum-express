const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like } = db
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', 'Error: 密碼與確認密碼不一致')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', 'Error: 此信箱已註冊過')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          })
            .then(user => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        {
          model: Comment, include: [
            { model: Restaurant, attributes: ['name', 'image'] }
          ]
        }
      ],
      group: ['RestaurantId']
    }).then(u => {
      const theuser = u.toJSON()
      const count = theuser.Comments.length
      return res.render('profile', { theuser, count })
    })
  },
  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(u => {
      const theuser = u.toJSON()
      return res.render('editprofile', { theuser })
    })
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "名稱不能空白！")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then((user) => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          }).then(() => {
            req.flash('success_messages', '成功更新個人資料！')
            res.redirect(`/users/${req.params.id}`)
          })
        })
      })
    } else {
      return User.findByPk(req.params.id).then((user) => {
        user.update({
          name: req.body.name,
          image: user.image
        }).then(() => {
          req.flash('success_messages', '成功更新個人資料！')
          res.redirect(`/users/${req.params.id}`)
        })
      })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      req.flash('success_messages', '成功新增餐廳至最愛')
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then((favorite) => {
      favorite.destroy().then((restaurant) => {
        req.flash('success_messages', '成功移除最愛餐廳')
        return res.redirect('back')
      })
    })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(() => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then((like) => {
      like.destroy().then(() => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = userController