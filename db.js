const config = require('./app_config');
const url = config.mongoUrl;
const mongoose = require('mongoose');
const connect = mongoose.connect(url);
module.exports = {connect}