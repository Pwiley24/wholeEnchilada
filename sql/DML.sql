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
	SELECT *
	FROM Cuisines
	WHERE cuisine_ID = :cuisine_ID;

	-- for selection boxes
	SELECT cuisine_ID, name
	FROM Cuisines;
-- UPDATE
	UPDATE Cuisines
	SET Name = :cuisine_name
	WHERE cuisine_ID = :cuisine_ID;
-- DELETE
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
	SELECT *
	FROM Reviews;
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
	SELECT *
	FROM CookedRecipes;
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
	SELECT *
	FROM IngredientsOfRecipes;

	-- all ingredients for one recipe
	SELECT * 
	FROM IngredientsOfRecipes
	WHERE recipe_id = :recipe_id;
-- UPDATE
	UPDATE IngredientsOfRecipes
	SET recipe_id = :recipe_id, ingredient_ID = :ingredient_ID, ingredient_qty = :ingredient_qty, ingredient_qty_to_gram = :ingredient_qty_to_gram, ingredient_qty_display_uom = :ingredient_qty_display_uom
	WHERE recipe_ingredient_ID = :recipe_ingredient_ID;
-- DELETE
	DELETE FROM IngredientsOfRecipes
	WHERE recipe_ingredient_ID = :recipe_ingredient_ID;