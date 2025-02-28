require('dotenv').config();

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');
var Handlebars = require('handlebars');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3033;

console.log("host ", process.env.DB_HOST);

const mysql = require('mysql2');
const pool = mysql.createPool({
    host:"classmysql.engr.oregonstate.edu",
    user:"cs340_wileypa",
    password:"0573",
    database:"cs340_wileypa",
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
  });

  pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database')
    connection.release();
  });

  module.exports = pool;

var app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static'))); // Serve static files from 'static'

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}));

app.set("view engine", "handlebars");


// Display Home page
app.get('', function (req, res, next) {
    res.status(200).render("homepage");
});


// Display Recipes page
app.get('/recipes', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT cuisine_ID, name FROM Cuisines; SELECT Recipes.recipe_ID AS 'recipe_ID', Recipes.name AS 'recipe_name', Recipes.description AS 'recipe_description', Cuisines.name AS 'cuisine_name' FROM Recipes JOIN Cuisines ON Recipes.cuisine_ID = Cuisines.cuisine_ID; SELECT ingredient_ID, name FROM Ingredients", [1, 2], (err, results, fields) => {
            if (err) throw err;
            //res.send(results);
            res.status(200).render("recipes", { cuisineList: results[0], recipes: results[1], ingredientList: results[2] });
        });
        connection.release();
    });
});

app.delete('/deleteRecipe/:recipeid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("DELETE FROM Recipes WHERE recipe_ID = ?", [req.params.recipeid], (err, results) => {
            if (err) throw err;
        });
        connection.release();
        res.sendStatus(204);
    })
});

app.get('/getRecipeIngredientsById/:recipeid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("SELECT ir.recipe_ID, ir.ingredient_ID, r.name AS 'recipe_name', i.name AS 'ingredient_name', ingredient_qty, ingredient_qty_display_uom, ingredient_qty_to_gram  FROM IngredientsOfRecipes ir JOIN Recipes r ON ir.recipe_ID = r.recipe_ID JOIN Ingredients i ON ir.ingredient_ID = i.ingredient_ID WHERE ir.recipe_ID = ?", [req.params.recipeid], (err, results) => {
            if (err) throw err;
            res.status(200).send(results);
        });
        connection.release();
    });
});

app.get('/getRecipeById/:recipeid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("SELECT r.recipe_ID, r.name as 'recipe_name', r.description as 'recipe_description', r.cuisine_ID, c.name AS 'cuisine_name' FROM Recipes r LEFT JOIN Cuisines c ON r.cuisine_ID = c.cuisine_ID WHERE recipe_ID = ?", [req.params.recipeid], (err, results) => {
            if (err) throw err;
            res.status(200).send(results);
        });
        connection.release();
    });
});

app.put('/updateRecipe', function(req, res, next) {
    // console.log(req.body);
    const recipe_id = parseInt(req.body.recipe_ID);
    const cuisine_id = parseInt(req.body.cuisine_ID);

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Recipes SET name = ?, description = ?, cuisine_ID = ? WHERE recipe_ID = ?", [req.body.recipe_name, req.body.recipe_description, cuisine_id, recipe_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});

// Display Ingredients page
app.get('/ingredients', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT ingredient_ID, name, cost_per_gram FROM Ingredients;", (err, results, fields) => {
            if (err) throw err;
            //res.send(results);
            res.status(200).render("ingredients", { ingredients: results });
        });
        connection.release();
    });
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

// get cuisines list
app.get('/getCuisineList', function(req, res) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("Select cuisine_ID, name from Cuisines", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
        connection.release();
    });
});

// get ingredients
app.get('/getIngredientList', function(req, res) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("Select ingredient_ID, name from Ingredients", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
        connection.release();
    });
});

app.post('/addRecipeWithIngredients', function(req, res) {
    const { recipe_name, description, cuisine_ID, ingredients } = req.body;
    console.log("name ", recipe_name);
    console.log("desc ", description);
    console.log("name ", recipe_name);
    console.log("ingredients: ", ingredients);
    pool.query(
        "INSERT INTO Recipes (name, description, cuisine_ID) VALUES (?, ?, ?)",
        [recipe_name, description, cuisine_ID],
        (err, results) => {
            if (err) {
                console.error('Error inserting into Recipes:', err);
                return res.status(500).json({ success: false, message: "Error adding recipe." });
            }

            const recipe_ID = results.insertId;

            const ingredientPromises = ingredients.map(ingredient => {
                const { ingredient_ID, ingredient_qty, ingredient_uom } = ingredient;

                // calculate quantity in grams
                let uom_grams;
                if (ingredient_uom === "g") {
                    uom_grams = 1;
                } else if (ingredient_uom === "slices") {
                    uom_grams = 20;
                } else {
                    uom_grams = 1; 
                }
                const qty_to_gram = ingredient_qty * uom_grams;

                return new Promise((resolve, reject) => {
                    pool.query(
                        "INSERT INTO IngredientsOfRecipes (recipe_ID, ingredient_ID, ingredient_qty, ingredient_qty_to_gram, ingredient_qty_display_uom) VALUES (?, ?, ?, ?, ?)",
                        [recipe_ID, ingredient_ID, ingredient_qty, qty_to_gram, ingredient_uom],
                        (err, results) => {
                            if (err) {
                                console.error('Error inserting into IngredientsOfRecipes:', err);
                                reject("Error adding ingredient to recipe.");
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            });

            Promise.all(ingredientPromises)
                .then(() => {
                    res.status(500).json({ success: true, message: "added ingredients." });
                })
                .catch((error) => {
                    console.error('Error adding ingredients:', error);
                });
        }
    );
});


// Display ingredientsOfRecipe page
app.get('/ingredientsOfRecipes', function (req, res, next) {
    console.log("now here");
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT * FROM IngredientsOfRecipes", (err, results, fields) => {
            if (err) throw err;
            console.log("Results from IngredientsOfRecipes query:", results); // Log query result
            res.status(200).render("ingredientsOfRecipes", { ingredientsOfRecipe: results });
        });
        connection.release();
    });
});

// Display 404 page
app.get('*', function (req, res, next) {
    res.status(404).render("404Page");
});

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});

