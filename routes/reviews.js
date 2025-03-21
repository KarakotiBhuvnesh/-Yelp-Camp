const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const Campground = require('../models/campgrounds.js');
const Review = require('../models/review.js');
const {reviewSchema} = require('../schemas.js')

const validateReview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

router.post('/',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();            
    req.flash('success','Created new review!!!')
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:reviewId', catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
    req.flash('success','Successfully deleted a review!!!')
}))

module.exports = router;