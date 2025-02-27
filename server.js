require('dotenv').config();

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');
var Handlebars = require('handlebars');
var port = process.env.PORT || 3033;


const mysql = require('mysql2');
const pool = mysql.createConnection({
    host: "classmysql.engr.oregonstate.edu",
    user: "cs340_wileypa",
    password: "0573",
    database: "cs340_wileypa",
    multipleStatements: true
  });

  pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database')
  });

  module.exports = pool;

var app = express();

app.use(express.json());

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
    pool.connect((err) => {
        if (err) throw err;

        pool.query("SELECT cuisine_ID, name FROM Cuisines; SELECT Recipes.recipe_ID AS 'recipe_ID', Recipes.name AS 'recipe_name', Recipes.description AS 'recipe_description', Cuisines.name AS 'cuisine_name' FROM Recipes JOIN Cuisines ON Recipes.cuisine_ID = Cuisines.cuisine_ID; SELECT ingredient_ID, name FROM Ingredients", [1, 2], (err, results, fields) => {
            if (err) throw err;
            //res.send(results);
            res.status(200).render("recipes", { cuisineList: results[0], recipes: results[1], ingredientList: results[2] });
        });
    });
});

// Display Ingredients page
app.get('/ingredients', function (req, res, next) {
    pool.connect((err) => {
        if (err) throw err;

        pool.query("SELECT ingredient_ID, name, cost_per_gram FROM Ingredients;", (err, results, fields) => {
            if (err) throw err;
            //res.send(results);
            res.status(200).render("ingredients", { ingredients: results });
        });
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

// get cuisines
app.get('/getCuisineList', function(req, res) {
    pool.connect((err) => {
        if (err) throw err;

        pool.query("Select cuisine_ID, name from Cuisines", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
    });
});

// get ingredients
app.get('/getIngredientList', function(req, res) {
    pool.connect((err) => {
        if (err) throw err;

        pool.query("Select ingredient_ID, name from Ingredients", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
    });
});

app.post('/addRecipeWithIngredients', function(req, res) {
    const { recipe_name, description, cuisine_ID, ingredients } = req.body;
    console.log("name ", recipe_name);
    console.log("desc ", description);
    console.log("name ", recipe_name);
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
                        "INSERT INTO IngredientsOfRecipes (recipe_ID, ingredient_ID, ingredient_qty, qty_to_gram, ingredient_uom) VALUES (?, ?, ?, ?, ?)",
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
                    res.status(200).json({ success: true, message: "Recipe and ingredients added successfully!" });
                })
                .catch((error) => {
                    console.error('Error adding ingredients:', error);
                    res.status(500).json({ success: false, message: "Error adding ingredients." });
                });
        }
    );
});



// Add ingredient to Recipe
app.post('/addIngredientToRecipe', function(req, res) {
    const { ingredient_ID: ingredient_ID, qty: ingredient_qty, uom: ingredient_uom } = req.body;

    // Fetch the latest recipe_ID
    pool.query('SELECT recipe_ID FROM Recipes ORDER BY recipe_ID DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error fetching latest recipe_ID:', err);
            return res.status(500).json({ success: false, message: "Error fetching latest recipe ID." });
        }

        // If no recipes exist, return an error
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "No recipes found." });
        }

        // Increment the latest recipe_ID by 1
        const recipe_ID = results[0].recipe_ID + 1;

        // Convert the quantity to grams
        let qty_to_gram;
        console.log("qttogram: ", ingredient_uom);
        switch (ingredient_uom) {
            case "g":
                qty_to_gram = ingredient_qty;  // Quantity is already in grams
                break;
            case "slices":
                qty_to_gram = ingredient_qty * 20;  // Example: 1 slice = 20 grams
                break;
            case "tbsp":
                qty_to_gram = ingredient_qty * 15;  // Example: 1 tbsp = 15 grams
                break;
            case "cup":
                qty_to_gram = ingredient_qty * 240;  // Example: 1 cup = 240 grams
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid UOM" });
        }

        //  Insert the ingredient into the IngredientsOfRecipes table
        pool.query(
            "INSERT INTO IngredientsOfRecipes (recipe_ID, ingredient_ID, ingredient_qty, ingredient_qty_to_gram, ingredient_qty_display_uom) VALUES (?, ?, ?, ?, ?)",
            [recipe_ID, ingredient_ID, ingredient_qty, qty_to_gram, ingredient_uom],
            (err, results) => {
                if (err) {
                    console.error('Error inserting into IngredientsOfRecipes:', err);
                    return res.status(500).json({ success: false, message: "Error adding ingredient to recipe." });
                }

                res.status(200).json({ success: true, message: "Ingredient added to recipe successfully!" });
            }
        );
    });
});




// Display 404 page
app.get('*', function (req, res, next) {
    res.status(404).render("404Page");
});

app.listen(port, function () {
    console.log("== Server is listening on port", port);
});

