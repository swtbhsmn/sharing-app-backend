var express = require('express');
var router = express.Router();

var passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('../cors');
var User = require('../models/user_model');

var authentication = require('../authentication');
router.use(bodyParser.json());

const multer = require("multer");
const { json } = require('express');
const { verify } = require('jsonwebtoken');

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
  .post( cors.corsWithOptions, function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          err: info
        });
      }
      req.login(user, function(err) {
        if (err) { return next(err); }

        const token = authentication.getToken({ _id:user._id });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({
          success: true, token: token, status: 'You are successfully logged in!'
        });

        
      });

    })(req,res,next);
  });


 module.exports = router;
