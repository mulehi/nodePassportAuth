const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

//passport config
require('./config/passport')(passport);

//DB COnfig
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true})
    .then( () => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Variables
app.use((req,res, next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
})

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//static folder
app.use('/public', express.static('public'));

//Body Parser
app.use(express.urlencoded({extended:false}));

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.listen(PORT, () =>{
    console.log(`Server start on port ${PORT}`);
}); 