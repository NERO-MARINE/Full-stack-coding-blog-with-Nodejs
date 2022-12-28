const Category = require("../model/categories");
const Post = require("../model/post");
const User = require('../model/user');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
//require passport file
require('./passportlocals')(passport);

// check if authenticated
const checkAuth = function(req,res,next){
  if(req.isAuthenticated()){
      // to prevent caching
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
    next()
  }else{
    res.redirect('/login')
  }
}



const homePage = async (req, res) => {
  try {
    const categories = await Category.find();
   if(req.isAuthenticated()){
    // console.log(req.user)
    res.render("index", { title: "home-page", categories, username: req.user.username, loggedin: true, csrfToken: req.csrfToken()});
   }
   else{
    res.render("index", { title: "home-page", categories, username: '', loggedin: false, csrfToken: req.csrfToken() });
   }
  } catch (err) {
    console.log(err);
  }
};


const categoriesContent = async(req, res) => {
    try{
          const category_Name = req.params.categoryName;
          const posts = await Post.find({category:category_Name});  
          // FIND CATEGORIES
          const categories = await Category.find({name:category_Name});
          if(req.isAuthenticated()){
            res.render('categories-content', { title: 'categories-content', posts, categories, loggedin: true ,csrfToken: req.csrfToken()});
           }
           else{
            res.render('categories-content', { title: 'categories-content', posts, categories, loggedin: false,csrfToken: req.csrfToken() });
           }
          
    }

    catch(err){
         console.log(err)
    }
    
  };

  // for post details
const postDetails = async(req,res)=>{
    try{
        const id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
             res.redirect('back');
             return;
        }
        const postName = req.params.postName;
        const postDetails = await Post.findById(id);
        const post_Names = await Post.find({category: postName}); 
        if(req.isAuthenticated()){
          res.render('categories-content',{ title: `${postDetails.name}`, postDetails, post_Names, loggedin: true,csrfToken: req.csrfToken()})

         }
         else{
          res.render('categories-content',{ title: `${postDetails.name}`, postDetails, post_Names, loggedin: false,csrfToken: req.csrfToken()})
         }
    }
    catch(err){
     console.log(err)
    }
  }

  const searchPost = async (req,res)=>{
    try{
      let searchPost = req.body.searchPost;
      let searchResults = await Post.find({$text:{
       $search:searchPost,
       $diacriticSensitive:true
      }});
      // res.json(searchResults);
      res.render('search',{title:'Search-results',searchResults, csrfToken: req.csrfToken()});
    }
    catch(err){
      console.log(err)
    }
  }
  // create post
  const create_get = async (req,res)=>{
try{
res.render('create',{title:'create-post',csrfToken: req.csrfToken()})
}
catch(err){
console.log(err) 
}
  }

  

  const create_post = async(req, res)=>{
    try{

      // create new post
         const newPost = new Post({
            'name': req.body.name,
            'body': req.body.body,
            'category': req.body.category
         });
         await newPost.save();
         res.redirect('/');
    }

    catch(err){
      console.log(err);
    }
  }
  //edit post
  const edit_post= async (req,res)=>{
        try{
            const id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
              res.redirect('back');
              return;
         }
            const editPost = await Post.findById(id);
            res.render('edit_post', {title: 'edit_post', editPost,csrfToken: req.csrfToken()})
        }
        catch(err){
            console.log(err)
        }
  }

  const editPost_put = async (req,res)=>{
    try{
        const id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
          res.redirect('back');
          return;
     }
        const toBEditedPost = await Post.findByIdAndUpdate(id);

        toBEditedPost.name = req.body.name;
        toBEditedPost.body = req.body.body ;
        toBEditedPost.category = req.body.category;
        await toBEditedPost.save();
        res.redirect(`/post/${toBEditedPost._id}/${toBEditedPost.category}`)
    }
    catch(err){
      console.log(err)
    }
  }

  //delete post
  const deletePost = async (req,res)=>{
    try{
         const id = req.params.id;
         if(!mongoose.Types.ObjectId.isValid(id)){
          res.redirect('back');
          return;
     }
         await Post.findByIdAndDelete(id);
         res.redirect('/')
    }
    catch(err){
      console.log(err)
    }
  }


  //get add new category page
  const add_category = async (req,res)=>{
    try{
    res.render('category-add',{title:'new-category', csrfToken: req.csrfToken()})
    }
    catch(err){
    console.log(err) 
    }
      }
  //new category
  const newCategory = async (req,res)=>{

      let theImage;
      let imageName;
      let uploadPath;
          
      if(!req.files || Object.keys(req.files).length === 0){
        console.log('no file to upload')
      } else{
          theImage = req.files.image ; // replace body with files - grabbing the image file from the form
           imageName = theImage.name;
          uploadPath = require('path').resolve('./') + '/public/' + imageName;
          
         theImage.mv(uploadPath, function(err){
          if(err){
           console.log(err);
          }
      })

      }
     
    try{
         const newCategory = new Category({
          'name':req.body.name,
          'body':req.body.body,
          'image': imageName,
         })
         await newCategory.save()
         res.redirect('/')
    }
    catch(err){
    console.log(err)
    }
  }

const privacyPage = (req, res) => {
  res.render("privacy", { title: "privacy-policy",csrfToken: req.csrfToken()});
};


// Edit Category

const editCategory_get = async(req,res)=>{
   try{
    const id = req.params.id
    if(!mongoose.Types.ObjectId.isValid(id)){
      res.redirect('back');
      return;
 }
    const toBeEditedCategory = await Category.findById(id);
    // console.log(id);
    res.render('editCategory', {title: 'edit_category', toBeEditedCategory, csrfToken: req.csrfToken()});
   }

   catch(err){
    console.log(err)
   }
}


const editCategory_put = async(req,res)=>{
     
  let theImage;
  let imageName;
  let uploadPath;
      
  if(!req.files || Object.keys(req.files).length === 0){
    console.log('no file to upload')
  } else{
      theImage = req.files.image ; // replace body with files - grabbing the image file from the form
       imageName = theImage.name;
      uploadPath = require('path').resolve('./') + '/public/' + imageName;
      
     theImage.mv(uploadPath, function(err){
      if(err){
       console.log(err);
      }
  })

  }
 
try{
   
   const id = req.params.id
   if(!mongoose.Types.ObjectId.isValid(id)){
    res.redirect('back');
    return;
}
   const editedCategory = await Category.findByIdAndUpdate(id);
   editedCategory.name = req.body.name;
   editedCategory.body = req.body.body;
   editedCategory.image = imageName

   await editedCategory.save();
  //  res.json(editedCategory)
   res.redirect(`/category/${editedCategory.name}`);
   
}
catch(err){
console.log(err)
}
}

const deleteCategory = async (req,res)=>{
  try{
      const id = req.params.id;
      if(!mongoose.Types.ObjectId.isValid(id)){
        res.redirect('back');
        return;
   }
    //  res.send(id)
      const catDelete = await Category.findByIdAndDelete(id)
      res.redirect('/')
  }
  catch(err){
    console.log(err)
  }
}

const getSignup = async (req,res)=>{
  try{
    res.render('signup',{title:'signup', csrfToken: req.csrfToken()})
  }catch(err){
    console.log(err)
  }
}

const postSignup = async(req,res)=>{
  /// get all form values
  const {email,uname,psw,psw_repeat} = req.body;
  // check if fields are empty;
  if(!email || !uname || !psw || !psw_repeat){
   res.render('signup',{title:'signup', err:'All fields are required', csrfToken: req.csrfToken()});

  }else if(psw != psw_repeat){
   res.render('signup',{title:'signup', err:'Password and repeat password does not match', csrfToken: req.csrfToken()});

  } else{
    // check if user exists
    User.findOne({$or: [{email: email}, {username: uname}]}, function(err, data){
      if(err) throw err;
      if(data){
        res.render('signup',{title:'signup', err:'User already exist', csrfToken: req.csrfToken()});
 
      } else{
        // generate salt using bcryptjs
        bcryptjs.genSalt(12, function(err,salt){
          if(err) throw err;
          if(salt){
            bcryptjs.hash(psw, salt, function(err,hash){
              if(err) throw err;
              // else create a new instance of a user
              const newUser = new User({
                email: email,
                username: uname,
                password: hash,
                googleId: null,
                provider: 'email'
              });
              newUser.save((err, data)=>{
                 if(err) throw err;
                 res.redirect('/login');
              })
            })
          }
        })
      }
    })
  }

}

const getLogin = async (req,res)=>{
  try{
    res.render('login',{title:'Login', csrfToken: req.csrfToken()})
  }catch(err){
    console.log(err)
  }
}



const postLogin = async(req,res,next)=>{
  passport.authenticate('local',{
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true

  })(req, res, next)
}

// logout
const logout = (req,res,next)=>{
  req.logout(function(err) {
      if (err) { return next(err); }
      req.session.destroy(function(err){
          res.redirect('/');
      })
    });

}


module.exports = {
  homePage,
  privacyPage,
  categoriesContent,
  postDetails,
  searchPost,
  create_get,
  add_category,
  create_post,
  edit_post,
  editPost_put,
  deletePost,
  newCategory,
  editCategory_get,
  editCategory_put,
  deleteCategory,
  getSignup,
  getLogin,
  postLogin,
  postSignup,
  checkAuth,
  logout
};
