const express = require('express');
const router = express.Router();
const passport = require('passport');
const Account = require('../models/account');

const navJson = {
  items:[ createMenuItem("Home", ""),
          createMenuItem("My Projects", "projects"),
          createMenuItem("Cider", "services"),
          createMenuItem("About Me", "aboutme"),
          createMenuItem("Contact", "contact")
] }

function createMenuItem(name, route){
  let str = '/'+ route;
  return {"name": name, "route": str}
}

function updateNav(user){
  let tempBar = {...navJson};
  tempBar.items = [...navJson.items];
  if(user){
    tempBar.items.splice(1,0,createMenuItem("Your Devices","devices"));
    return tempBar;
  }
  return tempBar;
}

/* GET home page. */
router.get('/', function (req, res) {
  console.log(req.session);
  let tempBar = updateNav(req.user);
  tempBar.items.shift();
  res.render('pages/index', {user: req.user, tempBar });
});

router.get('/register', function(req, res) {
    let tempBar = updateNav(req.user);
    res.render('pages/register',  { user : req.user, tempBar });
});

router.post('/register', function(req, res) {
    let tempBar = updateNav(req.user);
    Account.findOne({ username: req.body.username }, function(err, user){
      if (err) {
          return res.render('pages/register', {tempBar,"errMsg": "There was an error registering, please try again..."}, );
      }
      if(user) { res.render('pages/register',{tempBar,"errMsg": "Username already exists, please try again..."}) }
      if(req.body.password === req.body.cpassword){
          Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
              if (err) {
                  return res.render('pages/register', {tempBar,"errMsg": "There was an error registering, please try again..."} );
              }
              passport.authenticate('local')(req, res, function () {
                  res.redirect('/');
              });
          });
      }else{
          res.render('pages/register',{tempBar,"errMsg": "Passwords did not match, please try again..."});
      }
    });
});

router.get('/login', function(req, res) {
    let tempBar = updateNav(req.user);
    res.render('pages/login', { user : req.user, tempBar } );
});

router.post('/login', function(req, res, next) {
  let tempBar = updateNav(req.user);
  Account.findOne({ username: req.body.username }, function(err, user) {
    if (err) { return res.render('pages/login', { tempBar,"errMsg": "There was an error logging in, please try again..."});}
    if (!user) { return res.render('pages/login', {tempBar,"errMsg": "Username does not exists, please try again..."});}
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.render('pages/login', {tempBar, "errMsg":"Incorrect password, please try again..." });}
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    })(req, res, next);
  });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
