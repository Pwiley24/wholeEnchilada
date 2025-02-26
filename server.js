require('dotenv').config();

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');
var Handlebars = require('handlebars');


const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
  });

//   connection.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to MySQL database!');
//   });

  module.exports = connection;

var app = express();
var port = process.env.PORT || 3033;

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
    connection.connect((err) => {
        if (err) throw err;

        connection.query("SELECT cuisine_ID, name FROM Cuisines; SELECT Recipes.recipe_ID AS 'recipe_ID', Recipes.name AS 'recipe_name', Recipes.description AS 'recipe_description', Cuisines.name AS 'cuisine_name' FROM Recipes JOIN Cuisines ON Recipes.cuisine_ID = Cuisines.cuisine_ID", [1, 2], (err, results, fields) => {
            if (err) throw err;
            //res.send(results);
            res.status(200).render("recipes", { cuisineList: results[0], recipes: results[1] });
        });
    });

    //res.status(200).render("recipes", { cuisineList: rows });
});

// Display Ingredients page
app.get('/ingredients', function (req, res, next) {
    res.status(200).render("ingredients");
});

// Display Cooked Recipes page
app.get('/cookedRecipes', function (req, res, next) {
    res.status(200).render("cookedRecipes");
});

// Display Cuisines page
app.get('/cuisines', function (req, res, next) {
    res.status(200).render("cuisines");
});

// Display Reviews page
app.get('/reviews', function (req, res, next) {
    res.status(200).render("reviews");
});

// get cuisines
app.get('/getCuisineList', function(req, res) {
    connection.connect((err) => {
        if (err) throw err;

        connection.query("Select cuisine_ID, name from Cuisines", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
    });
});

// Display 404 page
app.get('*', function (req, res, next) {
    res.status(404).render("404Page");
});

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});

