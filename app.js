//Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

//Middleware
mongoose.connect('mongodb://localhost:27017/yelp-campground')

//Mongoose Conncetion
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database connected');
});

//Execute Express
const app = express();

//Set ejs as view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//Get express to pars the req body
app.use(express.urlencoded({ extended: true }))
// Use Method Override 
app.use(methodOverride('_method'));
//*****
// Set CRUD Routes
//*****
app.get('/', (req, res) => {
    res.render('home')
})

// Campground Index Route
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// Create New Campground Route
    //Render Form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
    //Post New Campground
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required().min(0),
            location: Joi.string().required(),
            image: Joi.string().required()
        }).required()
    })
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//Campground Show Route
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}))


//Campground Edit/Update Route
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

//Campground Delete/Destroy Route
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    if(!err.message) err.message = 'On no! Something went wrong!';
    if(!err.statusCode) err.statusCode = 500;
    res.status(statusCode).render('error', { err });
    
}) 

//CONFIM THAT SERVER IS UP
app.listen(3000, () => {
    console.log('CONNECTION IS OPEN ON PORT 3000!');
})