# Fullstack coding blog with nodejs and mongodb
- node modules remove. run npm install
- add your mongodb atlas connection string @ config/database_con.js
- go to blog-routes.js and unprotect the signup page @ router.get('/signup') and router.post('/signup'). To do this, simply remove 'blogControllers.checkAuth,' on both routes
- sign up and login in as an admin. You can protect the signup page by adding 'blogControllers.checkAuth,' back
- create your categories and make post in markdown.
- to get code-blocks, specify them code-blocks with standard git-hub markdown.
- upload your images from the public/images folder
