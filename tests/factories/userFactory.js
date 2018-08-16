var mongoose = require('mongoose')
var User = mongoose.model('User')

module.exports = () => {
    return new User({}).save()
}