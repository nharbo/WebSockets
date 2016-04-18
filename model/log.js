var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageLogSchema = new Schema({
    username: String,
    message: String,
    postedAt: Date
});

module.exports = mongoose.model('MsgLog', MessageLogSchema);