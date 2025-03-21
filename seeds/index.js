
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds.js');
const cities = require('./cities.js');
const {places,descriptors} = require('./seedHelpers.js')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
}); 

app.get('/error',(req,res)=>{
    chicken.fly();
})
const sample = array => array[Math.floor(Math.random() * array.length)];             //random using math function where range is array.length

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for (let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location: ` ${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description:'lorem ipsum dolor sit amet',
            price
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})