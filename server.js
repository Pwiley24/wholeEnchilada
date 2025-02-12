var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');
var Handlebars = require('handlebars');

var app = express();
var port = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, 'static'))); // Serve static files from 'static'

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}));

app.set("view engine", "handlebars");

app.use(express.json());


// Display Home page
app.get('', function (req, res, next) {
    res.status(200).render("homepage");
});


// Display Recipes page
app.get('/recipes', function (req, res, next) {
    res.status(200).render("recipes");
});

// Display Reviews page
app.get('/reviews', function (req, res, next) {
    res.status(200).render("reviews");
});

// // Display Testimonies page
// app.get('/testimonials', function (req, res, next) {
//     var context = {
//         testimonyData: testimonyData
//     };
//     res.status(200).render("testimoniesPage", context);
// });

// Display 404 page
app.get('*', function (req, res, next) {
    res.status(404).render("404Page");
});

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});
