//Express Dependencies
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');

app.engine('ejs', ejsMate);
app.set('view engine','ejs');;
app.set('views',path.join(__dirname,'views'));

const mongoose = require('mongoose');
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const Campground = require('./models/campgrounds.js');
const Review = require('./models/review.js');

const ExpressError = require('./utils/ExpressError.js');
const catchAsync = require('./utils/catchAsync.js');

const campgrounds=  require('./routes/campgrounds');

// Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');                  
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const methodOverride = require('method-override');
app.use(express.urlencoded({extended:true}));                      //middleware added
app.use(methodOverride('_method'));


const validateReview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

app.use('/campgrounds',campgrounds)
app.get('/',(req,res)=>{
    res.render('home')
});
 

app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
});

app.use((err,req,res,next)=>{  
    if(!err.message) err.message='Oh no !!! Something went wrong!'
    const {statusCode = 500, message = 'Something went Wrong'} = err;
    res.status(statusCode).render('error',{err})                               // error handling
});

app.listen(3000,()=>{
    console.log('Serving port 3000')
});