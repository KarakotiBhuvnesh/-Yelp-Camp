const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campgrounds.js')
const methodOverride = require('method-override');
const campgrounds = require('./models/campgrounds.js');

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine','ejs');;
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));                               //middleware
app.use(methodOverride('_method'));

app.get('/',(req,res)=>{
    res.render('home')
});
 
app.get('/campgrounds', async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs',{campgrounds});
});

app.get('/campgrounds/new', async (req,res)=>{                               // adding new campgrounds to the database
    res.render('campgrounds/new');
});
app.post('/campgrounds', async(req,res)=>{
    const campground = new Campground(req.body.campgrounds);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
});

app.get('/campgrounds/:id', async (req,res)=>{                                //opening individual campground element by id
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show.ejs',{campground});
});

app.get('/campgrounds/:id/edit',async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs',{campground});
})

app.put('/campgrounds/:id', async(req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground.id}`);
});

app.delete('/campgrounds/:id',async(req,res)=>{
    const{id}=req.params;
    await campgrounds.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})



app.listen(3000,()=>{
    console.log('Serving port 3000')
});