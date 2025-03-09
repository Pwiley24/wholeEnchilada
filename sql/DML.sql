-- MySQL Script for the Whole Enchilada Database
-- Last Updated: Thur Feb 27  2025
-- Authors: Paige Wiley & Jason Stephens

-- -----------------------------------------------------
-- Cuisines
-- -----------------------------------------------------
-- CREATE
	INSERT INTO Cuisines (name)
	VALUES
	(:cuisineName);

-- READ
	SELECT cuisine_ID, name AS 'cuisine_name' 
	FROM Cuisines;

	-- for selection boxes
	SELECT cuisine_ID, name
	FROM Cuisines;

-- UPDATE
	UPDATE Cuisines
	SET Name = :cuisine_name
	WHERE cuisine_ID = :cuisine_ID;

-- DELETE
	UPDATE Recipes SET cuisine_id = NULL 
	WHERE cuisine_id = :cuisine_ID;

	DELETE FROM Cuisines 
	WHERE cuisine_ID = :cuisine_ID;

-- -----------------------------------------------------
-- Recipes
-- -----------------------------------------------------
-- CREATE
	INSERT INTO Recipes (name, description, cuisine_ID)
	VALUES
	(:name, :description, :cuisine_ID);

-- READ
	-- for selection boxes
	SELECT recipe_ID, name
	FROM Recipes;
	
	-- for display
	SELECT 
		r.recipe_ID AS 'recipe_ID', 
		r.name AS 'recipe_name', 
		r.description AS 'recipe_description', 
		c.name AS 'cuisine_name' 
	FROM Recipes r
		LEFT JOIN Cuisines c ON r.cuisine_ID = c.cuisine_ID;
	
	-- single recipe
	SELECT 
		r.recipe_ID, 
		r.name as 'recipe_name', 
		r.description as 'recipe_description', 
		r.cuisine_ID, 
		c.name AS 'cuisine_name' 
	FROM Recipes r 
		LEFT JOIN Cuisines c ON r.cuisine_ID = c.cuisine_ID 
	WHERE recipe_ID = :recipe_ID;

-- UPDATE
	UPDATE Recipes
	SET name = :name, description = :description, cusine_ID = :cuisine_ID
	WHERE recipe_ID = :recipe_ID;

-- DELETE
	DELETE FROM Recipies
	WHERE recipe_ID = :recipe_ID;

-- -----------------------------------------------------
-- Ingredients
-- -----------------------------------------------------
-- CREATE
	INSERT INTO Ingredients (name, cost_per_gram)
	VALUES
	(:name, :costpergram)

-- READ
	SELECT 
		ingredient_ID, 
		name, 
		cost_per_gram 
	FROM Ingredients;

	-- for selection boxes
	SELECT ingredient_ID, name
	FROM Ingredients;

-- UPDATE
	UPDATE Ingredients
	SET name = :name, cost_per_gram = :cpg
	WHERE Ingredient_ID = :ingredient_ID;

-- DELETE
	DELETE FROM Ingredients
	WHERE ingredients_ID = :ingredients_ID;

-- -----------------------------------------------------
-- Reviews
-- -----------------------------------------------------
-- CREATE
	INSERT INTO Reviews (recipe_ID, reviewer, timestamp, rating)
	VALUES
	(:recipe_ID, :reviewer,CURDATE(),:rating);

-- READ
	-- for display
	SELECT 
		rv.review_ID, 
		r.name AS 'recipe_name', 
		reviewer AS 'review_reviewer', 
		DATE_FORMAT(timestamp, '%Y-%m-%d') AS 'review_date', 
		rating as 'review_rating' 
	FROM Reviews rv 
		JOIN Recipes r ON rv.recipe_ID = r.recipe_ID;
	
	-- single review
	SELECT 
		review_ID, 
		recipe_ID, 
		reviewer, 
		DATE_FORMAT(timestamp, '%Y-%m-%d') as 'timestamp', 
		rating 
	FROM Reviews 
	WHERE review_ID = :review_ID;

-- UPDATE
	UPDATE Reviews
	SET recipe_ID = :recipe_ID, reviewer = :reviewer, timestamp = :date, rating = :rating
	WHERE review_ID = :review_ID;

-- DELETE
	DELETE FROM Reviews
	WHERE review_ID = :review_ID;

-- -----------------------------------------------------
-- CookedRecipes
-- -----------------------------------------------------
-- CREATE
	INSERT INTO CookedRecipes (recipe_ID, timestamp, alteration, notes)
	VALUES
	(:recipe_ID, CURDATE(), :alteration, :notes);

-- READ
	-- for display
	SELECT 
		cr.cooked_ID, 
		r.name AS 'recipe_name', 
		DATE_FORMAT(cr.timestamp, '%Y-%m-%d') as 'cooked_date', 
		IFNULL(cr.alteration, '') as 'cooked_alteration', 
		IFNULL(cr.notes, '') as 'cooked_notes' 
	FROM CookedRecipes cr 
		JOIN Recipes r on cr.recipe_ID = r.recipe_ID;
	
	-- single cooked recipe
	SELECT 
		cooked_ID, 
		recipe_ID, 
		DATE_FORMAT(timestamp, '%Y-%m-%d') as 'timestamp', 
		alteration, 
		notes 
	FROM CookedRecipes 
	WHERE cooked_ID = :cooked_ID;

-- UPDATE
	UPDATE CookedRecipes
	SET recipe_ID = :recipe_ID, timestamp = :date, alteration = :alteration, notes = :notes
	WHERE cooked_ID = :cooked_ID;

-- DELETE
	DELETE from CookedRecipes
	WHERE cooked_ID = :cooked_ID;

-- -----------------------------------------------------
-- Insert `IngredientsOfRecipes`
-- -----------------------------------------------------
-- CREATE
	INSERT INTO IngredientsOfRecipes (recipe_ID, ingredient_ID, ingredient_qty, ingredient_qty_to_gram, ingredient_qty_display_uom)
	VALUES
	(:recipe_ID, :ingredient_ID, :ingredient_qty, :ingredient_qty_to_gram, :ingredient_qty_display_uom);

-- READ
	-- all ingredients for one recipe
	SELECT 
		ir.recipe_ID, 
		ir.ingredient_ID, 
		r.name AS 'recipe_name', 
		i.name AS 'ingredient_name', 
		ingredient_qty, 
		ingredient_qty_display_uom, 
		ingredient_qty_to_gram
	FROM IngredientsOfRecipes ir 
		JOIN Recipes r ON ir.recipe_ID = r.recipe_ID 
		JOIN Ingredients i ON ir.ingredient_ID = i.ingredient_ID 
	WHERE ir.recipe_ID = :recipe_id;

-- UPDATE
	UPDATE IngredientsOfRecipes
	SET recipe_id = :recipe_id, ingredient_ID = :ingredient_ID, ingredient_qty = :ingredient_qty, ingredient_qty_to_gram = :ingredient_qty_to_gram, ingredient_qty_display_uom = :ingredient_qty_display_uom
	WHERE recipe_ingredient_ID = :recipe_ingredient_ID;
	
-- DELETE
	DELETE FROM IngredientsOfRecipes
	WHERE recipe_ingredient_ID = :recipe_ingredient_ID;