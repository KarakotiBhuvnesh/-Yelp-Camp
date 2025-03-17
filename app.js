//Express Dependencies
const express = require('express');
const app = express();
const session = require('express-session')
const flash = require('connect-flash')
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
const reviews=  require('./routes/reviews');

// Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp'),{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};                  
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const methodOverride = require('method-override');
app.use(express.urlencoded({extended:true}));                      //middleware added
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

const sessionConfig = {
    secret:'thisisthesecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{ 
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/campgrounds',campgrounds)                                 // importing reouters                                                       
app.use('/campgrounds/:id/reviews',reviews)

app.get('/',(req,res)=>{
    res.render('home')
});
 
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