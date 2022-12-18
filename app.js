const express = require('express');
const mongoose = require('mongoose');
const URI = require('./config/database_con');
const csrf = require('csurf');
const expressSession = require('express-session');
const methodOveride = require('method-override');
const fileUpload = require('express-fileupload');
const expresslayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser')
const MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const flash = require('connect-flash');
const app = express();


const port = process.env.PORT||3000;

const routes = require('./routers/blog-routes');
// const { urlencoded } = require('express');
// express layout
app.use(expresslayout);
app.set('layout', './layouts/main-layout');
app.set('view engine','ejs');

// connect to mongodb
mongoose.set('strictQuery', false);
mongoose.connect(URI)
.then(()=>{
    console.log('connected to db');
    app.listen(port, ()=>{
        console.log('listening for request');
    })
})

.catch((err)=>{
  console.log(err)
})
//use express.urlencoded to grab form values
app.use(express.urlencoded({extended:true}));
//use cookie parser
app.use(cookieParser('dolomite'));

//use express-session
app.use(expressSession({
  secret: 'my name is Nero_marine',
  resave: false,
  saveUninitialized: true,
  maxAge: 86400000,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
  // cookie: { secure: true }
}));

// use fileUpload
app.use(fileUpload());
//use csrf
app.use(csrf());
//use passport
app.use(passport.initialize());
app.use(passport.session());
//use connect flash
app.use(flash());

app.use(function(req, res, next){
  res.locals.error = req.flash('error');
  next();
})
//use method overide
app.use(methodOveride('_method'));


//use public folder
app.use(express.static('public'));

//use blog routes
app.use(routes);

//render 404 page
app.use((req,res)=>{
    res.status(404).render('404', {title: 'error-page', csrfToken: req.csrfToken()})
})
