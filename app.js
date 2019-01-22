const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer');


mongoose.connect('mongodb://localhost:27017/restful_blog', { useNewUrlParser:true });

app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));

//MONGOOSE Model config schema setup
const blogSchema = new mongoose.Schema({
    title: String,
    image: String, 
    body: String,
    created: {
        type: Date, 
        default: Date.now
    }
});

const Blog = mongoose.model("Blog", blogSchema);

//restful routes
app.get('/', function(req, res){
    res.redirect('/blogs');
})
//INDEX route
app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log('error!')
        } else{
            //first name blogs - мы так называем чтобы передать в template; second blogs это то что получаем от Blog.find()
            res.render('index', {blogs: blogs});
        }
    });
});

// NEW route
app.get('/blogs/new', function(req, res){
    res.render('new')
});
// CREATE route
app.post('/blogs', function(req, res){
    //create blog
    //sanitize req.body.blog.body which means req.body - is whatever comes from form and 
    console.log(req.body)
    req.body.blog.body = req.sanitize(req.body.blog.body)//taking, sanitazing it and change 
    console.log(req.body)
    Blog.create(req.body.blog , function(err, newBlog){
        if(err){
            res.render('new')
        } else{
    //redirect to the index
    res.redirect('/blogs');
        }
    })
});

//show 
app.get('/blogs/:id', function(req, res){
    //find blog with an id req.params.id
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog})
        }
    })
})

//EDIT
app.get('/blogs/:id/edit', function(req, res){
    //to make id prefilled it is like show rout
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else{
            res.render('edit', {blog: foundBlog});
        }
    });
});

//UPDATE  route
app.put('/blogs/:id', function(req, res){
    //so it should take an id in the url find the existing blog and update with method findByIdAndUpdate(id, newData, callback)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
});
//DELETE route
app.delete('/blogs/:id', function(req, res){
    //destroy with method findByIdAndRemove it takes only id and callback has only err cuz we dont need data (if we delete it is gone)
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs');
        } else {
    //redirect
            res.redirect('/blogs');
        }
    })
});

app.listen(3000, ()=>{
    console.log('Blog is running on 3000')
});