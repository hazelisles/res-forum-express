const moment = require('moment')
module.exports = {
  eq: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  howlong: function (a) {
    return moment(a).fromNow()
  },
  neq: function (a, b, options) {
    if (a === b) {
      return options.inverse(this)
    }
    return options.fn(this)
  }
}