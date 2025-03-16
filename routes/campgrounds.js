const express = require('express');
const router = express('router');
const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campgrounds.js');


const validateCampground = (req,res,next)=>{                       //validation middleware
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}


router.get('', catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs',{campgrounds});
}));

router.get('/new', async (req,res)=>{                     // adding new campgrounds to the database
    res.render('campgrounds/new');
});

router.post('', validateCampground,catchAsync(async(req,res,next)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));


router.get('/:id', catchAsync(async (req,res)=>{            //opening individual campground element by id
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground);
    res.render('campgrounds/show.ejs',{campground});
})) ;

router.get('/:id/edit',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs',{campground});
}));

router.put('/:id', async(req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground.id}`);
});

router.delete('/:id',catchAsync(async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds/${id}')
}));

module.exports = router;