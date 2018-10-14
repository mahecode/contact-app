var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Contact = require('../models/contacts');
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
var ObjectID = require('mongodb');

router.use(csrfProtection);
//mongoose connect
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-app');


router.get('/logout', (req, res, next)=>{
  req.logout();
  res.redirect('/');
});

router.get('/register',notloggedIn, (req,res)=>{
  var messages = req.flash('error');
  res.render('user/register', {csrfToken: req.csrfToken(), messages: messages, hasErrors : messages.length > 0});
});

router.post('/user/register',notloggedIn, passport.authenticate('local.signup',{
  successRedirect: '/home',
  failureRedirect: '/register',
  failureFlash: true
}));


/* GET home page. */
router.get('/', notloggedIn, (req, res, next) =>{
  var messages = req.flash('error');
  res.render('user/login', {token: req.csrfToken(), messages: messages, hasErrors: messages.length >0});
});

router.post('/user/login', notloggedIn , passport.authenticate('local.signin',{
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash: true
}));

//user register


router.get('/home', isloggedIn, (req, res, next)=>{
  Contact.find({
    _creator: req.user._id
  }).then((contact)=>{
    res.render('user/index', {contacts: contact});
  }, (e)=>{
    res.status(400).send();
  });
});


router.get('/add', isloggedIn, (req, res, next) =>{
  res.render('user/add', {token: req.csrfToken()});
});

router.post('/contact/add', isloggedIn, (req, res, next) =>{
  const record = new Contact({
    name: req.body.name,
    mo_no: req.body.number,
    _creator: req.user._id
  });
  record.save().then((doc) =>{
    console.log("contact added!");
  }, (e)=>{
    console.log("unable to add contact");
  });
  res.redirect('/home');
});


router.get('/edit/:id',isloggedIn, (req, res, next) =>{
  const q = {_id: req.params.id}
  Contact.findById(q, (err, doc)=>{
    if(err){
      return console.log(err);
    }
    console.log(doc);
    res.render('user/edit', {
      doc: doc,
      token: req.csrfToken()
    });
  });
});

router.post('/edit/:id', isloggedIn, (req, res, next) =>{
  const query = {_id : req.params.id}
  Contact.findOne(query, (err, doc) =>{
    if(err){
      return console.log(err);
    }
    doc.name = req.body.name;
    doc.mo_no = req.body.number;
    doc.save();
    console.log('contact updated...');
    res.redirect('/home');
  });
});


router.delete('/delete/:id', isloggedIn , (req, res, next)=>{
  const query = {_id: req.params.id}
  if(!ObjectID.isValid(query)){
    return res.status(400).send();
  }
  Contact.findOneAndRemove({
    _id: query,
    _creator: req.user._id
  }).then((contact)=>{
    if(!contact){
      return res.status(400).send();
    }
    console.log('contact removed');
    res.send(200);
  }).catch((e)=>{
    res.status(400).send();
  });
});



function isloggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notloggedIn(req, res, next){
if(!req.isAuthenticated()){
  return next();
}
res.redirect('/');
}

module.exports = router;
