//Requirements
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// Create New Campground Route
    //Render Form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
    //Post New Campground
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

//Campground Show Route
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
})


//Campground Edit/Update Route
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
})

//Campground Delete/Destroy Route
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

//CONFIM THAT SERVER IS UP
app.listen(3000, () => {
    console.log('CONNECTION IS OPEN ON PORT 3000!');
})