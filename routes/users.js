var express = require('express');
var router = express.Router();

var passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('../cors');
var User = require('../models/user_model');
var UserPosts = require('../models/post_model');
var authentication = require('../authentication');
router.use(bodyParser.json());

const multer = require("multer");


const storage = multer.diskStorage(
  {
    destination: (req, file, callback) => {
      callback(null, 'public/profile_photo');
    },

    filename: (req, file, callback) => {
      callback(null, file.originalname)
    }
  }
);

const fileTypeValidation = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
    return callback(new Error("Check file extension!"));
  }
  callback(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileTypeValidation });

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.route('/signup')
  .options(cors.corsWithOptions, (req, res) => { res.statusCode = 200; })
  .post(cors.corsWithOptions, upload.single('photo'), (req, res, next) => {

    User.register(new User({ username: req.body.username }),
      req.body.password, (err, user) => {
        if (err) {

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
        }
        else {
          if (req.body.firstname)
            user.firstname = req.body.firstname;
          if (req.body.lastname)
            user.lastname = req.body.lastname;
          if (req.file.filename) {
            user.photo = req.file.filename;
          }
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');

              res.json({ err: err });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
            });
          });
        }
      });
  });

  router.route('/login')
  .options(cors.corsWithOptions, (req, res) => { res.statusCode = 200; })
  .post( cors.corsWithOptions, function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.json({
          success:false,errstatus:info.name
        });
      }
      req.login(user, function(err) {
        if (err) { return next(err); }

        const token = authentication.getToken({ _id:user._id ,photo:`http://localhost:3001/profile_photo/${user.photo}`,username:user.username});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({
          success: true, token: token, status: 'You are successfully logged in!'
        });

        
      });

    })(req,res,next);
  });

  router.route('/add-post')
  .options(cors.corsWithOptions, (req, res) => { res.statusCode = 200; })
  .post(cors.corsWithOptions,authentication.verifyUser,(req,res,next)=>{

    const data = new UserPosts({user_post_id:req.user._id,title:req.body.title,text:req.body.text,author:req.user.username});
    data.save((err, user) => {
      console.log(user);
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Your Post Created Successfully' });
    });

  });

  router.route('/home')
  .options(cors.cors, (req, res) => { res.statusCode = 200; })
  .get(cors.cors,(req,res,next)=>{

    UserPosts.find({}).then((post,err)=>{
      if(err){return res.json(err)}

      res.status=200;
      return res.json(post);
    })

  });


  router.route('/comment')
  .options(cors.corsWithOptions, (req, res) => { res.statusCode = 200; })
  .post(cors.corsWithOptions,authentication.verifyUser,(req,res,next)=>{

    const data = new UserPosts({comments:{Comment:{text:req.body.text,author:req.user.username}}});
    data.save((err, user) => {
      console.log(user);
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Comment Updated.' });
    });

  });

 module.exports = router;
