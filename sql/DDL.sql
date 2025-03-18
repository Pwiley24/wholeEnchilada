-- MySQL Script for the Whole Enchilada Database
-- Last Updated: Thur Feb 13  2025
-- Authors: Paige Wiley & Jason Stephens


-- -----------------------------------------------------
-- Schema whole enchiladas
-- -----------------------------------------------------


SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Cuisines`;
DROP TABLE IF EXISTS `Recipes`;
DROP TABLE IF EXISTS `Ingredients`;
DROP TABLE IF EXISTS `CookedRecipes`;
DROP TABLE IF EXISTS `Reviews`;
DROP TABLE IF EXISTS `IngredientsOfRecipes`;


-- -----------------------------------------------------
-- Table `Cuisines`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Cuisines` (
  `cuisine_ID` INT NOT NULL AUTO_INCREMENT UNIQUE,   -- PK
  `name` VARCHAR(50) NULL,
  PRIMARY KEY (`cuisine_ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Recipes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Recipes` (
  `recipe_ID` INT NOT NULL AUTO_INCREMENT UNIQUE,     -- PK
  `name` VARCHAR(50) NULL,
  `description` VARCHAR(250) NULL,
  `cuisine_ID` INT NULL,                              -- FK
  PRIMARY KEY (`recipe_ID`),
  INDEX `cuisine_ID_idx` (`cuisine_ID` ASC),          -- Creates an Index for the cuisine_ID for quicker lookup
  CONSTRAINT `cuisine_ID_fk_recipes`
    FOREIGN KEY (`cuisine_ID`)
    REFERENCES `Cuisines` (`cuisine_ID`)
    ON DELETE NO ACTION                               -- Prevents deletion of a cuisine when a recipe is deleted
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ingredients` (
  `ingredient_ID` INT NOT NULL AUTO_INCREMENT UNIQUE, -- PK
  `name` VARCHAR(50) NULL,
  `cost_per_gram` DECIMAL(19,5) NULL,
  PRIMARY KEY (`ingredient_ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CookedRecipes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CookedRecipes` (
  `cooked_ID` INT NOT NULL AUTO_INCREMENT UNIQUE,       -- PK     
  `recipe_ID` INT NOT NULL,                             -- FK
  `timestamp` TIMESTAMP NULL,
  `alteration` TEXT NULL,
  `notes` TEXT NULL,
  PRIMARY KEY (`cooked_ID`),
  INDEX `recipe_ID_idx` (`recipe_ID` ASC),              -- Creates an Index for the recipe_ID for quicker lookup
  CONSTRAINT `recipe_ID_fk_cooked`
    FOREIGN KEY (`recipe_ID`)
    REFERENCES `Recipes` (`recipe_ID`)
    ON DELETE CASCADE                                   -- Cascade operations that allow a recipe to be deleted
    ON UPDATE CASCADE)                                  -- and automatically delete cooked recipe records associated
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Reviews` (
  `review_ID` INT NOT NULL AUTO_INCREMENT UNIQUE,       -- PK
  `recipe_ID` INT NOT NULL,                             -- FK 
  `reviewer` VARCHAR(50) NULL,
  `timestamp` TIMESTAMP NULL,
  `rating` INT NULL,
  PRIMARY KEY (`review_ID`),
  INDEX `recipe_ID_idx` (`recipe_ID` ASC),              -- Creates an Index for the recipe_ID for quicker lookup
  CONSTRAINT `recipe_ID_fk_reviews`
    FOREIGN KEY (`recipe_ID`)
    REFERENCES `Recipes` (`recipe_ID`)
    ON DELETE CASCADE                                   -- Cascade operations that allow a recipe to be deleted
    ON UPDATE CASCADE)                                  -- and automatically deletes reviews associated 
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `IngredientsOfRecipes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `IngredientsOfRecipes` (
  `recipe_ID` INT NOT NULL,                               -- FK, PK composite
  `ingredient_ID` INT NOT NULL,                           -- FK, PK composite
  `ingredient_qty` DECIMAL(19,2) NULL,
  `ingredient_qty_to_gram` DECIMAL(19,5) NULL,
  `ingredient_qty_display_uom` VARCHAR(10) NULL,
  INDEX `ingredient_ID_idx` (`ingredient_ID` ASC),        -- Creates an Index for the ingredient_ID for quicker lookup
  INDEX `recipe_ID_idx` (`recipe_ID` ASC),                -- Creates an Index for the recipe_ID for quicker lookup
  CONSTRAINT `pk_recipe_ID` 
    PRIMARY KEY (`recipe_ID`, `ingredient_ID`),           -- Set the PK to be a composite PK of recipe_ID and ingredient_ID
  CONSTRAINT `recipe_ID_constraint`
    FOREIGN KEY (`recipe_ID`)
    REFERENCES `Recipes` (`recipe_ID`)
    ON DELETE CASCADE                                     -- Cascade operations that allow a recipe to be deleted
    ON UPDATE CASCADE,                                    -- And removes references to the ingredients of the recipe
  CONSTRAINT `ingredient_ID_fk_Ing_recip`
    FOREIGN KEY (`ingredient_ID`)
    REFERENCES `Ingredients` (`ingredient_ID`)
    ON DELETE NO ACTION                                   -- No action needed- when ingredients are deleted 
    ON UPDATE NO ACTION,                                  -- they may still be used in other recipes
  CONSTRAINT `unique_recipe_ingredient`
    UNIQUE (`recipe_ID`, `ingredient_ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Insert `Cuisines`
-- -----------------------------------------------------
INSERT INTO Cuisines (name)
VALUES
('Italian'),
('Mexican'),
('Mediterranean'),
('American'),
('Chinese');

-- -----------------------------------------------------
-- Insert `Recipes`
-- -----------------------------------------------------
INSERT INTO Recipes (name, description, cuisine_ID)
VALUES
('Orange Chicken', 'Chicken in orange sauce served with rice and broccoli.', (SELECT cuisine_ID FROM Cuisines WHERE name = 'Chinese')),
('BBQ Pizza', 'Pizza with bbq sauce and chicken.', (SELECT cuisine_ID FROM Cuisines WHERE name = 'American')),
('Pesto Pasta', 'Pasta with pesto and chicken.', (SELECT cuisine_ID FROM Cuisines WHERE name = 'Italian')),
('Gyro', 'Lamb, tomato, spinach, and feta combined inside a pita wrap.', (SELECT cuisine_ID FROM Cuisines WHERE name = 'Mediterranean')),
('Breakfast Burrito', 'Egg, cheese, salsa, canadian bacon, avocado wrappen inside a tortilla.', (SELECT cuisine_ID FROM Cuisines WHERE name = 'Mexican'));


-- -----------------------------------------------------
-- Insert `Ingredients`
-- -----------------------------------------------------
INSERT INTO Ingredients (name, cost_per_gram)
VALUES
('Chicken', 0.00904761904),
('Olive Oil', 0.0196),
('Egg', 0.5),
('Avocado', 0.00275),
('Pita Bread', 0.02645549304);


-- -----------------------------------------------------
-- Insert `Reviews`
-- -----------------------------------------------------
INSERT INTO Reviews (recipe_ID, reviewer, timestamp, rating)
VALUES
((SELECT recipe_ID FROM Recipes WHERE name = 'Breakfast Burrito'), 'Bob', '2025-01-20', 4),
((SELECT recipe_ID FROM Recipes WHERE name = 'Pesto Pasta'), 'Mike', '2024-12-31', 3),
((SELECT recipe_ID FROM Recipes WHERE name = 'Pesto Pasta'), 'Sara', '2025-02-02', 2),
((SELECT recipe_ID FROM Recipes WHERE name = 'BBQ Pizza'), 'Andrew', '2025-02-02', 5),
((SELECT recipe_ID FROM Recipes WHERE name = 'Gyro'), 'Sally', '2025-01-02', 1);



-- -----------------------------------------------------
-- Insert `CookedRecipes`
-- -----------------------------------------------------
INSERT INTO CookedRecipes (recipe_ID, timestamp, alteration, notes)
VALUES
((SELECT recipe_ID FROM Recipes WHERE name = 'Orange Chicken'), '2012-12-29', 'Substitute tofu for chicken.', 	NULL),
((SELECT recipe_ID FROM Recipes WHERE name = 'Gyro'), '2020-09-12', NULL, 'Cook for an extra 5 minutes.'),
((SELECT recipe_ID FROM Recipes WHERE name = 'Breakfast Burrito'), '2003-03-02', NULL, NULL),
((SELECT recipe_ID FROM Recipes WHERE name = 'BBQ Pizza'), '2019-06-17', 'Used a gluten free crust.', NULL),
((SELECT recipe_ID FROM Recipes WHERE name = 'Pesto Pasta'), '2025-04-10', NULL, 'Add parmesan for serving.');



-- -----------------------------------------------------
-- Insert `IngredientsOfRecipes`
-- -----------------------------------------------------
INSERT INTO IngredientsOfRecipes (recipe_ID, ingredient_ID, ingredient_qty, ingredient_qty_to_gram, ingredient_qty_display_uom)
VALUES
((SELECT recipe_ID FROM Recipes WHERE name = 'Orange Chicken'),	(SELECT ingredient_ID FROM Ingredients WHERE name = 'Chicken'), 2, 907.184, 'pounds'),
((SELECT recipe_ID FROM Recipes WHERE name = 'BBQ Pizza'), (SELECT ingredient_ID FROM Ingredients WHERE name = 'Chicken'), 1, 140, 'cups'),
((SELECT recipe_ID FROM Recipes WHERE name = 'BBQ Pizza'), (SELECT ingredient_ID FROM Ingredients WHERE name = 'Olive Oil'), 0.25, 54, 'cups'),
((SELECT recipe_ID FROM Recipes WHERE name = 'Breakfast Burrito'), (SELECT ingredient_ID FROM Ingredients WHERE name = 'Egg'), 2, 56, 'eggs'),
((SELECT recipe_ID FROM Recipes WHERE name = 'Gyro'),	(SELECT ingredient_ID FROM Ingredients WHERE name = 'Pita bread'), 4, 60, 'slices');
