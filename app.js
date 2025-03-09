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

const ExpressError = require('./utils/ExpressError.js');
const catchAsync = require('./utils/catchAsync.js');

const Review = require('./models/review.js')

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

const validateCampground = (req,res,next)=>{                       //validation middleware
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

app.get('/',(req,res)=>{
    res.render('home')
});
 
app.get('/campgrounds', catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs',{campgrounds});
}));

app.get('/campgrounds/new', async (req,res)=>{                     // adding new campgrounds to the database
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground,catchAsync(async(req,res,next)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));


app.get('/campgrounds/:id', catchAsync(async (req,res)=>{                                //opening individual campground element by id
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground);
    res.render('campgrounds/show.ejs',{campground});
})) ;

app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs',{campground});
}));

app.put('/campgrounds/:id', async(req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground.id}`);
});

app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}));

app.post('/campgroeunds/:id/reviews',validateReview)
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