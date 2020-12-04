var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');


Comment = new Schema({
    text:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:false,
        default:"anonymous"
    },
    createDate:{
        type:String,
        required:false,
        default: Date.now
    }
});


var UserPosts = new Schema({
  user_post_id:{
    type:String,
    require:true
  },
    title:{
        type:String,
        required:true,
      
    },
    text:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:false,
        default:"anonymous"
    },
    comments: {type: [Comment]},
   
},{timestamps:true});

UserPosts.plugin(passportLocalMongoose);
module.exports = mongoose.model('UserPosts', UserPosts);