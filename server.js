// ### Initialization ###

require('dotenv').config();

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');
var Handlebars = require('handlebars');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3063;

const mysql = require('mysql2');
const pool = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
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

// #region RECIPES
// Display Recipes page
app.get('/recipes', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT cuisine_ID, name FROM Cuisines; SELECT r.recipe_ID AS 'recipe_ID', r.name AS 'recipe_name', r.description AS 'recipe_description', c.name AS 'cuisine_name' FROM Recipes r LEFT JOIN Cuisines c ON r.cuisine_ID = c.cuisine_ID; SELECT ingredient_ID, name FROM Ingredients", [1, 2], (err, results, fields) => {
            if (err) throw err;
            res.status(200).render("recipes", { cuisineList: results[0], recipes: results[1], ingredientList: results[2] });
        });
        connection.release();
    });
});

// Get a list of all recipes
app.get('/getRecipeList', function(req, res) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT recipe_ID, name FROM Recipes", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
        connection.release();
    });
});

// Delete a recipe by ID
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

// Get a single recipe's ingredients by ID
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

// Get a single recipe's ratings by ID
app.get('/getRecipeRatingsById/:recipeid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query(`
            SELECT rw.rating
            FROM Reviews rw
            WHERE rw.recipe_id = ?`, 
            [req.params.recipeid], 
            (err, results) => {
                if (err) throw err;
                console.log("results: ", results);
                if (results.length > 0) {
                    res.status(200).json(results); 
                } else {
                    res.status(404).json({ message: "No ratings found for this recipe." });
                }
            }
        );

        connection.release(); 
    });
});

// Get a single recipe by ID
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

// Update a recipe, pass recipe_ID, name, description, and cuisine_ID through the body
app.put('/updateRecipe', function(req, res, next) {
    const recipe_id = parseInt(req.body.recipe_ID);
    const cuisine_id = parseInt(req.body.cuisine_ID) || null;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Recipes SET name = ?, description = ?, cuisine_ID = ? WHERE recipe_ID = ?", [req.body.recipe_name, req.body.recipe_description, cuisine_id, recipe_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});
// #endregion

// #region INGREDIENTS
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

// Get a list of all ingredients
app.get('/getIngredientList', function(req, res) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT ingredient_ID, name FROM Ingredients", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
        connection.release();
    });
});

// Delete an ingredient by ID
app.delete('/deleteIngredient/:ingredientid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("SELECT * FROM IngredientsOfRecipes WHERE ingredient_ID = ?", [req.params.ingredientid], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                pool.query("DELETE FROM Ingredients WHERE ingredient_ID = ?", [req.params.ingredientid], (err, results) => {
                    if (err) res.send(err);
                    res.sendStatus(204);
                });
            }
            else {
                res.status(500).send("Ingredient is used by at least one recipe.");
            }
        });

        connection.release();
    })
});

// Update an ingredient, pass ingredient_ID, name, and cost through the body
app.put('/updateIngredient', function(req, res, next) {
    const ingredient_id = parseInt(req.body.ingredient_ID);

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Ingredients SET name = ?, cost_per_gram = ? WHERE ingredient_ID = ?", [req.body.ingredient_name, req.body.ingredient_cost, ingredient_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});

// Add an ingredient
app.post('/addIngredient', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("INSERT INTO Ingredients (name, cost_per_gram) VALUES (?, ?)", [req.body.ingredient_name, req.body.ingredient_cost], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});
// #endregion

// #region COOKED RECIPES
// Display Cooked Recipes page
app.get('/cookedRecipes', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT cr.cooked_ID, r.name AS 'recipe_name', DATE_FORMAT(cr.timestamp, '%Y-%m-%d') as 'cooked_date', IFNULL(cr.alteration, '') as 'cooked_alteration', IFNULL(cr.notes, '') as 'cooked_notes' FROM CookedRecipes cr JOIN Recipes r on cr.recipe_ID = r.recipe_ID; SELECT recipe_ID, name FROM Recipes;", (err, results, fields) => {
            if (err) throw err;
            res.status(200).render("cookedRecipes", {cookedRecipes: results[0], recipeList: results[1]});
        });
        connection.release();
    });
});

// Get a single cooked recipe by ID
app.get('/getCookedRecipeById/:recipeid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("SELECT cooked_ID, recipe_ID, DATE_FORMAT(timestamp, '%Y-%m-%d') as 'timestamp', alteration, notes FROM CookedRecipes WHERE cooked_ID = ?", [req.params.recipeid], (err, results) => {
            if (err) throw err;
            res.status(200).send(results);
        });
        connection.release();
    });
});

// Delete cooked recipe by ID
app.delete('/deleteCookedRecipe/:cookedid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("DELETE FROM CookedRecipes WHERE cooked_ID = ?", [req.params.cookedid], (err, results) => {
            if (err) throw err;
        });
        connection.release();
        res.sendStatus(204);
    })
});

// Add a cooked recipe
app.post('/addCookedRecipe', function(req, res, next) {
    var alteration = req.body.cookedrecipe_alteration;
    var note = req.body.cookedrecipe_note;
    
    if (alteration === '') alteration = null;
    if (note === '') note = null;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("INSERT INTO CookedRecipes (recipe_ID, timestamp, alteration, notes) VALUES (?, ?, ?, ?)", [req.body.cookedrecipe_recipe_ID, req.body.cookedrecipe_date, alteration, note], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});

// Update a cooked recipe
app.put('/updateCookedRecipe', function(req, res, next) {
    const cookedrecipe_id = parseInt(req.body.cookedrecipe_cooked_ID);

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE CookedRecipes SET recipe_ID = ?, timestamp = ?, alteration = ?, notes = ? WHERE cooked_ID = ?", [req.body.cookedrecipe_recipe_ID, req.body.cookedrecipe_date, req.body.cookedrecipe_alteration, req.body.cookedrecipe_note, cookedrecipe_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});
// #endregion

// #region CUISINES
// Display Cuisines page
app.get('/cuisines', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT cuisine_ID, name AS 'cuisine_name' FROM Cuisines;", (err, results, fields) => {
            if (err) throw err;
            res.status(200).render("cuisines", {cuisines: results});
        });
        connection.release();
    });
});

// Get a list of all cuisines
app.get('/getCuisineList', function(req, res) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT cuisine_ID, name FROM Cuisines", (err, results, fields) => {
            if (err) throw err;
            res.send(results);
        });
        connection.release();
    });
});

// Delete cooked recipe by ID
app.delete('/deleteCuisine/:cuisineid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Recipes SET cuisine_id = NULL WHERE cuisine_id = ?", [req.params.cuisineid], (err, results) => {
            if (err) throw err;
        });
        pool.query("DELETE FROM Cuisines WHERE cuisine_ID = ?", [req.params.cuisineid], (err, results) => {
            if (err) throw err;
        });
        connection.release();
        res.sendStatus(204);
    })
});

// Update a cuisine
app.put('/updateCuisine', function(req, res, next) {
    const cuisine_id = parseInt(req.body.cuisine_ID);

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Cuisines SET name = ? WHERE cuisine_ID = ?", [req.body.cuisine_name, cuisine_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});

// Add a cuisine
app.post('/addCuisine', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("INSERT INTO Cuisines (name) VALUES (?)", [req.body.cuisine_name], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});
// #endregion

// #region REVIEWS
// Display Reviews page
app.get('/reviews', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT rv.review_ID, r.name AS 'recipe_name', reviewer AS 'review_reviewer', DATE_FORMAT(timestamp, '%Y-%m-%d') AS 'review_date', rating as 'review_rating' FROM Reviews rv JOIN Recipes r ON rv.recipe_ID = r.recipe_ID; SELECT recipe_ID, name FROM Recipes", (err, results, fields) => {
            if (err) throw err;
            res.status(200).render("reviews", {reviews: results[0], recipeList: results[1]});
        });
        connection.release();
    });
});

// Get a single cooked recipe by ID
app.get('/getReviewById/:reviewid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("SELECT review_ID, recipe_ID, reviewer, DATE_FORMAT(timestamp, '%Y-%m-%d') as 'timestamp', rating FROM Reviews WHERE review_ID = ?", [req.params.reviewid], (err, results) => {
            if (err) throw err;
            res.status(200).send(results);
        });
        connection.release();
    });
});

// Delete review by ID
app.delete('/deleteReview/:reviewid', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("DELETE FROM Reviews WHERE review_ID = ?", [req.params.reviewid], (err, results) => {
            if (err) throw err;
        });
        connection.release();
        res.sendStatus(204);
    })
});

// Add a review
app.post('/addReview', function(req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("INSERT INTO Reviews (recipe_ID, reviewer, timestamp, rating) VALUES (?, ?, CURDATE(), ?)", [req.body.review_recipe_id, req.body.review_reviewer, req.body.review_rating], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});

// Update a review
app.put('/updateReview', function(req, res, next) {
    const review_id = parseInt(req.body.review_ID);
    const recipe_id = parseInt(req.body.recipe_ID);

    pool.getConnection((err, connection) => {
        if (err) throw err;
        pool.query("UPDATE Reviews SET recipe_ID = ?, reviewer = ?, timestamp = ?, rating = ? WHERE review_ID = ?", [recipe_id, req.body.review_reviewer, req.body.review_date, req.body.review_rating, review_id], (err, results) => {
            if (err) throw err;
        });
        connection.release();
    });

    res.status(200).send();
});
// #endregion

// #region RECIPE INGREDIENTS
// Display ingredientsOfRecipe page
app.get('/ingredientsOfRecipes', function (req, res, next) {
    pool.getConnection((err, connection) => {
        if (err) throw err;

        pool.query("SELECT * FROM IngredientsOfRecipes", (err, results, fields) => {
            if (err) throw err;
            res.status(200).render("ingredientsOfRecipes", { ingredientsOfRecipe: results });
        });
        connection.release();
    });
});

// Add a recipe and its ingredients
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
// #endregion

// Display 404 page
app.get('*', function (req, res, next) {
    res.status(404).render("404Page");
});

// Listener for calls
app.listen(port, function () {
    console.log("== Server is listening on port", port);
});
