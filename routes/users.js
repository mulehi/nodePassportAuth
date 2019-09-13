const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Call User model
const User = require('../models/User');

const router = express.Router();

//Login page
router.get('/login', (req, res) => {
    res.render("login");
});

//Registration page
router.get('/register', (req, res) => {
    res.render("register");
});

//Register handler
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    //check all required fields
    if(!name || !email || !password || !password2){
        errors.push({msg : 'Fill in all the fields'});
    }

    //check password match 
    if(password !== password2){
        errors.push({msg : 'Passwords should match'});
    }

    //Check password length
    if(password.length < 8){
        errors.push({msg : 'Password should be atleast 8 characters.'});
    }
    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
        User.findOne({email : email})
        .then(user => {
            if(user){
                //User exists
                errors.push({msg : 'Email is already registered'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            }else{
                const newUser = new User({
                    name,
                    email,
                    password
                });

                //Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err;
                        //Set hash as the new user password
                        newUser.password = hash;
                        //save user
                        newUser.save()
                            .then(user =>{
                                req.flash('success_msg', 'You are now registered and you can login.');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err))
                    })
                })
            }
        });
    }
    
});

//Login handler
router.post('/login', (req, res, next) =>{
  passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
  })(req, res, next);  
});

//Logout
router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;