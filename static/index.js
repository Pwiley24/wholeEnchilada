// Citation for the following functions:
//      addRecord(), updateRecord(), browse()
// Date: 03/16/2025
// Based on:
// Source URL: https://canvas.oregonstate.edu/courses/1987790/pages/exploration-developing-in-node-dot-js?module_item_id=25023025

function addRecord() {
    document.getElementById("browse").style.display = "none";
    document.getElementById("insert").style.display = "block";
    document.getElementById("updateRecord").style.display = "none";
  }
  
  function updateRecord() {
    document.getElementById("browse").style.display = "none";
    document.getElementById("insert").style.display = "none";
    document.getElementById("updateRecord").style.display = "block";
  }

  function browse() {
    document.getElementById("browse").style.display = "block";
    document.getElementById("insert").style.display = "none";
    document.getElementById("updateRecord").style.display = "none";
  }

  function scrollToRecipe() {
    const element = document.getElementById("single-recipe");
    element.scrollIntoView({ behavior: 'smooth' });
  }


/*
 * Function to insert a new recipe into the database. Takes
 * in the elements of a new recipe element.
 */
function insertNewRecipe() {
    var recipe_name = document.getElementById('recipe-name').value;
    var description = document.getElementById('modal-description').value;
    var selectElement = document.getElementById('modal-cuisine');
    var cuisine_ID = selectElement.value;
    if (cuisine_ID === '') cuisine_ID = null;

    console.log("cuisine id: ", cuisine_ID);
    var ingredients = getIngredientData();

    const recipeData = {
        recipe_name: recipe_name,
        description: description,
        cuisine_ID: cuisine_ID,
        ingredients: ingredients
    };
    fetch('/addRecipeWithIngredients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
            console.log('Ingredient added successfully!');
        } else {
            console.error('Error adding ingredient:', data.message);
        }
    })
    .catch(error => {
        console.error('Error HERE:', error);
    });   
    hideModal();
}

// Function to add a new row for ingredients
function addIngredientDOM(){
    const container = document.getElementById('ingredients-container');
    const ingredientGroup = document.querySelector('.ingredient-group'); 


    const newIngredientGroup = ingredientGroup.cloneNode(true);

    //reset input values for ingredient row
    newIngredientGroup.querySelector('input[type="number"]').value = ''; 
    newIngredientGroup.querySelector('select[name="ingredientUOM[]"]').value = 'g'; 
    newIngredientGroup.querySelector('select[name="recipe-ingredient"]').value = ''; 

    container.appendChild(newIngredientGroup);
}


// Function to gather all ingredient data
function getIngredientData() {
    const ingredients = [];
    const ingredientElements = document.querySelectorAll('.ingredient-group'); 
    console.log("elems ", ingredientElements);
    ingredientElements.forEach(element => {
        const ingredient_ID = element.querySelector('.ingredient-select').value; 
        const ingredient_qty = element.querySelector('input[type="number"]').value; 
        const ingredient_uom = element.querySelector('select[name="ingredientUOM[]"]').value; 

        ingredients.push({
            ingredient_ID: ingredient_ID,
            ingredient_qty: ingredient_qty,
            ingredient_uom: ingredient_uom
        });
    });

    console.log('Ingredients:', ingredients);
    return ingredients;
}


/*
 * A function to apply the current filters to a specific recipe.  Returns true
 * if the recipe passes the filters and should be displayed and false otherwise.
 */
function recipePassesFilters(recipe, filters) {
    var passesText = true;
    console.log("recipe descrip: ", recipe.text);
    if (filters.text) {
        var filterText = filters.text.toLowerCase();
        if (recipe.name.indexOf(filterText) === -1 && recipe.text.indexOf(filterText) === -1 ) {
            passesText = false;
        }
    }


    var passesCuisine = true;
    console.log("filter cuisine: ", filters.cuisine);
    console.log("recipe cuisine ", recipe.cuisine);
    if (filters.cuisine) {
        if (recipe.cuisine.indexOf(filters.cuisine) === -1) {
            passesCuisine = false;
            console.log("fails cuisine")
        }
    }

    // Check rating filters --> to be adjusted later
    var passesRating1 = true;
    if (filters.rating1.checked) {
        passesRating1 = true; 
    }

    var passesRating2 = true;
    if (filters.rating2.checked) {
        passesRating2 = true; 
    }

    var passesRating3 = true;
    if (filters.rating3.checked) {
        passesRating3 = true; 
    }

    var passesRating4 = true;
    if (filters.rating4.checked) {
        passesRating4 = true; 
    }

    var passesRating5 = true;
    if (filters.rating5.checked) {
        passesRating5 = true; 
    }
    console.log("----------------------------");
    console.log("cuisine pass: ", passesCuisine);
    console.log("text passes: ", passesText);
    console.log("----------------------------");

    var filterVals = [passesText, passesCuisine, passesRating1, passesRating2, passesRating3, passesRating4, passesRating5]
    return filterVals;
}

function confirmDeletion(){
    let userResponse = confirm("Are you sure you want to delete this item?");
    if (userResponse) {
        return true;
    }
    return false;
}

/*
 * Applies the filters currently entered by the user to the set of all recipes.
 * Any recipe that satisfies the user's filter values will be displayed,
 * including recipes that are not currently being displayed because they didn't
 * satisfy an old set of filters. Recipes that don't satisfy the filters are
 * removed from the DOM.
 */
function doFilterUpdate() {
    console.log("Doing filter update");

    // Grab values of filters from user inputs
    var filters = {
        text: document.getElementById("filter-text").value.trim(),
        cuisine: document.getElementById("filter-cuisine").value.toLowerCase(),
        rating1: document.getElementById("filter-1"),
        rating2: document.getElementById("filter-2"),
        rating3: document.getElementById("filter-3"),
        rating4: document.getElementById("filter-4"),
        rating5: document.getElementById("filter-5")
    };

    // Select all rows in the recipe table body (excluding the header)
    var recipeContainer = document.getElementById("recipe-container");
    var recipeRows = recipeContainer.getElementsByTagName("tr");

    // Reset all rows to visible before applying new filters
    Array.from(recipeRows).forEach(row => row.classList.remove("hidden"));

    // Iterate over each row and apply the filters
    Array.from(recipeRows).forEach(row => {
        // Skip the header row (which contains <th> elements)
        if (row.querySelector('th')) return;

        // Get the content of each column (adjust the index based on your table's structure)
        var recipeName = row.cells[1].textContent.toLowerCase(); // Recipe Name in the second column
        var recipeDescription = row.cells[2].textContent.toLowerCase(); // Description in the third column
        var cuisineName = row.cells[3].textContent.toLowerCase(); // Cuisine Name in the fourth column

        // Use recipePassesFilters function to check if this recipe passes the filters
        var recipe = {
            name: recipeName,
            text: recipeDescription,
            cuisine: cuisineName
        };

        // Apply the filter check
        var passesFilters = recipePassesFilters(recipe, filters);

        // If the recipe passes all filters, keep it visible, otherwise hide it
        console.log("text: ", passesFilters[0]);
        console.log("cuisine: ", passesFilters[1]);
        if (!(passesFilters[0]) || !(passesFilters[1])) {
            console.log("all filters failed");
            row.classList.add("hidden");
        } else {
            row.classList.remove("hidden");
            console.log("all filters passed");
        }
    });
}






function showModal(){
    console.log("unhiding")
    var modalBackdrop = document.getElementById("modal-backdrop");
    modalBackdrop.classList.remove("hidden");

    var modal = document.getElementById("add-recipe-modal");
    modal.classList.remove("hidden");
}

function hideModal(){
    console.log("hiding")
    var modalBackdrop = document.getElementById("modal-backdrop");
    modalBackdrop.classList.add("hidden");

    var modal = document.getElementById("add-recipe-modal");
    modal.classList.add("hidden");
}

//Check if the filter button exists
var filterUpdateButton = document.getElementById("filter-update-button");

if (filterUpdateButton) {
    filterUpdateButton.addEventListener("click", function() {
        doFilterUpdate(); 
    });
}

//Check if the add button exists
var addButton = document.getElementById("add-recipe-button");
if (addButton) {
    addButton.addEventListener("click", function(){
        showModal()
    });
}

//check if the insert ingredient on recipe page exists
var insertIngredient = document.getElementById('add-ingredient');
if (insertIngredient){
    insertIngredient.addEventListener('click', function() {
        addIngredientDOM();
    });
}
    
//check if the modal cancel button exists
var modalCancel = document.getElementById("modal-cancel");
var modalClose = document.getElementById("modal-close")
if (modalCancel) {
    modalCancel.addEventListener("click", function(){
        hideModal()
    })
}
if (modalClose) {
    modalClose.addEventListener("click", function(){
        hideModal()
    })
}

//Check if the modal add button exists
var modalAddButton = document.getElementById("modal-accept");
if (modalAddButton) {
    modalAddButton.addEventListener("click", function(){
        insertNewRecipe()
    })
}


// #region RECIPES
// Delete a recipe
function deleteRecipe(recipeID) {
    if(confirmDeletion()){
        $.ajax({
            url: '/deleteRecipe/'+recipeID,
            type: 'DELETE',
            success: function(result) {
                location.reload();
            }
        })
    }
}

// Get the recipe's values to display on the update form and display it
function updateRecipeValues(recipeID) {
    $.ajax({
        url: '/getRecipeByID/'+recipeID,
        type: 'GET',
        success: function(result) {
            console.log(result);
            oFormObject = document.forms['updateRecipe'];
            oFormElement = oFormObject.elements["update_recipe_id"];
            oFormElement.value = recipeID;
            oFormElement = oFormObject.elements["update_recipe_name"];
            oFormElement.value = result[0]["recipe_name"];
            oFormElement = oFormObject.elements["update_recipe_description"];
            oFormElement.value = result[0]["recipe_description"];
            console.log(result[0]["cuisine_ID"]);
            oFormElement = oFormObject.elements["update_recipe_cuisine"];
            oFormElement.value = result[0]["cuisine_ID"];
        }
    });
    
    updateRecord();
}

// Update the recipe values in the database to whatever they have been changed to
function updateRecipe() {
    const data = {
        recipe_ID: document.getElementById("update_recipe_id").value,
        recipe_name: document.getElementById("update_recipe_name").value,
        recipe_description: document.getElementById("update_recipe_description").value,
        cuisine_ID: document.getElementById("update_recipe_cuisine").value
    };
    
    $.ajax({
        url: '/updateRecipe',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}


// For displaying the average rating of one recipe
function getSelectedRecipeAvgRating(recipeID) {
    $.ajax({
        url: '/getRecipeRatingsById/'+recipeID,
        type: 'GET',
        success: function(result) {
            var averageRating;
            if (result.length > 0) {
                var sumOfRatings = result.reduce((acc, current) => acc + parseFloat(current.rating), 0);
                averageRating = (sumOfRatings / result.length).toFixed(2); // round to two decimal places
            } else {
                averageRating = "None"; 
            }

            const avgRatingList = document.getElementById("selected-recipe-avg-rating");

            avgRatingList.innerHTML = '';

            const avgRatingItem = document.createElement('li');
            avgRatingItem.textContent = `Average Rating: ${averageRating}`;

            avgRatingList.appendChild(avgRatingItem);

            document.getElementById("single-recipe").style.display = "block";
        },
        error: function() {
            const avgRatingList = document.getElementById("selected-recipe-avg-rating");
            avgRatingList.innerHTML = ''; 
            const errorItem = document.createElement('li');
            errorItem.textContent = "No reviews available.";
            avgRatingList.appendChild(errorItem);
        }
    });
}




// For displaying the ingredients of one recipe
function getSelectedRecipeIngredients(recipeID, recipeName) {
    let ingredientList;
    $.ajax({
        url: '/getIngredientList',
        type: 'GET',
        success: function(result) {
            ingredientList = JSON.parse(JSON.stringify(result));
            
            $.ajax({
                url: '/getRecipeIngredientsByID/'+recipeID,
                type: 'GET',
                success: function(result) {
                    const selectedRecipeName = document.getElementById('selected-recipe-title');
                    selectedRecipeName.innerHTML = recipeName;
                    const selectedRecipeIngredientList = document.getElementById('selected-recipe-ingredient-list');
                    selectedRecipeIngredientList.innerHTML = '';
        
                    result.forEach(ingredient => {
                        const li = document.createElement("li");
                        const ingredientID = ingredient.ingredient_ID;
                        const liID = 'recipe-ingredient-li-'+recipeID+'-'+ingredientID;
                        li.id = liID;
                        li.textContent = ingredient.ingredient_qty+' '+ingredient.ingredient_qty_display_uom+' of '+ingredient.ingredient_name;
                        li.innerHTML += '<button class="recipe-ingredient-button" type="button">Edit</button><button class="recipe-ingredient-button" type="button" onclick="deleteIngredientOfRecipe('+ingredient.recipe_ID+', '+ingredient.ingredient_ID+', &quot;'+recipeName+'&quot;)">Delete</button>';
                        const liForm = document.createElement("form");
                        liForm.className = "recipe-ingredient-form";
                        liForm.id = 'updateIngredientOfRecipe-'+recipeID+'-'+ingredientID;
                        liForm.action = "javascript:updateIngredientOfRecipe()";
                        // li.innerHTML += '<form class="recipe-ingredient-form" id="updateIngredientOfRecipe-'+recipeID+'-'+ingredientID+' action="javascript:updateIngredientOfRecipe()">';
                        liForm.innerHTML += '<label for="RecipeID" style="display: none">Recipe ID:</label><input class="recipe-ingredient-input" type="text" id="updateRecipeIngredient-recipeID-'+recipeID+'-'+ingredientID+'" name="recipeID" value="'+recipeID+'" disabled style="display: none">';
                        liForm.innerHTML += '<label for="IngredientID" style="display: none">Ingredient ID:</label><input class="recipe-ingredient-input" type="text" id="updateRecipeIngredient-ingredientID-'+recipeID+'-'+ingredientID+'" name="ingredientID" value="'+ingredientID+'" disabled style="display: none">';
                        liForm.innerHTML += '<label for="IngredientQty">Qty:</label><input class="recipe-ingredient-input" type="number" id="updateRecipeIngredient-ingredientQty-'+recipeID+'-'+ingredientID+'" name="ingredientQty" value="'+ingredient.ingredient_qty+'">';
                        liForm.innerHTML += '<label for="IngredientQtyDisplayUOM">Unit:</label><select class="recipe-ingredient-input-long" id="updateRecipeIngredient-ingredientQtyDisplayUOM-'+recipeID+'-'+ingredientID+'" name="ingredientQtyDisplayUOM"><option value="g">g</option><option value="ml">ml</option><option value="cup">cup</option><option value="tbsp">tbsp</option><option value="tsp">tsp</option><option value="slices">slices</option></select>';
                        liForm.innerHTML += '<label for="Ingredient">Ingredient:</label><select class="recipe-ingredient-input-extra-long" id="updateRecipeIngredient-ingredient-'+recipeID+'-'+ingredientID+'" name="ingredient"></select>';
                        liForm.innerHTML += '<input class="buttons recipe-ingredient-button" type="submit" id="UpdateSaveCuisine" value="Update">';
                        li.appendChild(liForm);
                        selectedRecipeIngredientList.appendChild(li);
                        const uomSelect = document.getElementById('updateRecipeIngredient-ingredientQtyDisplayUOM-'+recipeID+'-'+ingredientID);
                        uomSelect.value = ingredient.ingredient_qty_display_uom;
                        const ingredientSelect = document.getElementById('updateRecipeIngredient-ingredient-'+recipeID+'-'+ingredientID);
                        ingredientList.forEach(ing => {
                            const opt = document.createElement("option");
                            opt.value = ing.ingredient_ID;
                            opt.text = ing.name;
                            ingredientSelect.appendChild(opt);
                        })
                        ingredientSelect.value = ingredient.ingredient_ID
        
                    })
                }
            })

        }
    });

    document.getElementById("single-recipe").style.display = "block";
}

function deleteIngredientOfRecipe(recipeID, ingredientID, recipeName) {
    if(confirmDeletion()) {
        $.ajax({
            url: '/deleteIngredientOfRecipe/'+recipeID+'/'+ingredientID,
            type: 'DELETE',
            success: function(result) {
                getSelectedRecipeIngredients(recipeID, recipeName); 
                getSelectedRecipeAvgRating(recipeID);
            },
            error: function(error) {
                alert(error.responseText);
            }
        })
    }
}


// #endregion

// #region INGREDIENTS
// Delete an Ingredient
function deleteIngredient(ingredientID) {
    if(confirmDeletion()){
        $.ajax({
            url: '/deleteIngredient/'+ingredientID,
            type: 'DELETE',
            success: function(result) {
                location.reload();
            },
            error: function(error) {
                alert(error.responseText);
            }
        })
    }
}

// Get the ingredient's values to display on the update form and display it
function updateIngredientValues(ingredientID, ingredientName, ingredientCost) {
    oFormObject = document.forms['updateIngredient'];
    oFormElement = oFormObject.elements["update_ingredient_id"];
    oFormElement.value = ingredientID;
    oFormElement = oFormObject.elements["update_ingredient_name"];
    oFormElement.value = ingredientName;
    oFormElement = oFormObject.elements["update_ingredient_cost"];
    oFormElement.value = ingredientCost;
    
    updateRecord();
}

// Update the recipe values in the database to whatever they have been changed to
function updateIngredient() {
    const data = {
        ingredient_ID: document.getElementById("update_ingredient_id").value,
        ingredient_name: document.getElementById("update_ingredient_name").value,
        ingredient_cost: document.getElementById("update_ingredient_cost").value
    };
    
    $.ajax({
        url: '/updateIngredient',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}

// Update the ingredient values in the database to whatever they have been changed to
function addIngredient() {
    const data = {
        ingredient_name: document.getElementById("add_ingredient_name").value,
        ingredient_cost: document.getElementById("add_ingredient_cost").value
    };
    
    $.ajax({
        url: '/addIngredient',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}
// #endregion

// #region COOKED RECIPES
// Delete a cooked recipe
function deleteCookedRecipe(cookedid) {
    if(confirmDeletion()){
        $.ajax({
            url: '/deleteCookedRecipe/'+cookedid,
            type: 'DELETE',
            success: function(result) {
                location.reload();
            }
        })
    }
}

// Get the cooked recipe's values to display on the update form and display it
function updateCookedRecipeValues(cookedID) {
    $.ajax({
        url: '/getCookedRecipeByID/'+cookedID,
        type: 'GET',
        success: function(result) {
            oFormObject = document.forms['updateCookedRecipe'];
            oFormElement = oFormObject.elements["update_cookedrecipe_id"];
            oFormElement.value = cookedID;
            oFormElement = oFormObject.elements["update_cookedrecipe_recipe"];
            oFormElement.value = result[0]["recipe_ID"];
            oFormElement = oFormObject.elements["update_cookedrecipe_date"];
            oFormElement.value = result[0]["timestamp"];
            oFormElement = oFormObject.elements["update_cookedrecipe_alteration"];
            oFormElement.value = result[0]["alteration"];
            oFormElement = oFormObject.elements["update_cookedrecipe_note"];
            oFormElement.value = result[0]["notes"];
        }
    });

    updateRecord();
}

// Update a cooked recipe
function updateCookedRecipe() {
    const data = {
        cookedrecipe_cooked_ID: document.getElementById("update_cookedrecipe_id").value,
        cookedrecipe_recipe_ID: document.getElementById("update_cookedrecipe_recipe").value,
        cookedrecipe_date: document.getElementById("update_cookedrecipe_date").value,
        cookedrecipe_alteration: document.getElementById("update_cookedrecipe_alteration").value,
        cookedrecipe_note: document.getElementById("update_cookedrecipe_note").value
    };
    
    $.ajax({
        url: '/updateCookedRecipe',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}

// Add a new cooked recipe
function addCookedRecipe() {
    const data = {
        cookedrecipe_recipe_ID: document.getElementById("add_cookedrecipe_recipe").value,
        cookedrecipe_date: document.getElementById("add_cookedrecipe_date").value,
        cookedrecipe_alteration: document.getElementById("add_cookedrecipe_alteration").value,
        cookedrecipe_note: document.getElementById("add_cookedrecipe_note").value
    };
    
    $.ajax({
        url: '/addCookedRecipe',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}
// #endregion

// #region CUISINES
// Delete a cuisine
function deleteCuisine(cuisineid) {
    if(confirmDeletion()){
        $.ajax({
            url: '/deleteCuisine/'+cuisineid,
            type: 'DELETE',
            success: function(result) {
                location.reload();
            }
        })
    }
}

// Add a cuisine
function addCuisine() {
    const data = {
        cuisine_name: document.getElementById("add_cuisine_name").value
    };
    
    $.ajax({
        url: '/addCuisine',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}

// Get the cuisine's values to display on the update form and display it
function updateCuisineValues(cuisineID, cuisineName) {
    oFormObject = document.forms['updateCuisine'];
    oFormElement = oFormObject.elements["update_cuisine_id"];
    oFormElement.value = cuisineID;
    oFormElement = oFormObject.elements["update_cuisine_name"];
    oFormElement.value = cuisineName;
    
    updateRecord();
}

// Update a cuisine
function updateCuisine() {
    const data = {
        cuisine_ID: document.getElementById("update_cuisine_id").value,
        cuisine_name: document.getElementById("update_cuisine_name").value
    };
    
    $.ajax({
        url: '/updateCuisine',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}
// #endregion

// #region REVIEWS
// Delete a review
function deleteReview(reviewid) {
    if(confirmDeletion()){
        $.ajax({
            url: '/deleteReview/'+reviewid,
            type: 'DELETE',
            success: function(result) {
                location.reload();
            }
        })
    }
}

// Add a review
function addReview() {
    const data = {
        review_recipe_id: document.getElementById("add_review_recipe").value,
        review_reviewer: document.getElementById("add_review_reviewer").value,
        review_rating: document.getElementById("add_review_rating").value,
    };
    
    $.ajax({
        url: '/addReview',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}

// Get the review's values to display on the update form and display it
function updateReviewValues(reviewID) {
    $.ajax({
        url: '/getReviewByID/'+reviewID,
        type: 'GET',
        success: function(result) {
            oFormObject = document.forms['updateReview'];
            oFormElement = oFormObject.elements["update_review_id"];
            oFormElement.value = reviewID;
            oFormElement = oFormObject.elements["update_review_recipe"];
            oFormElement.value = result[0]["recipe_ID"];
            oFormElement = oFormObject.elements["update_review_date"];
            oFormElement.value = result[0]["timestamp"];
            oFormElement = oFormObject.elements["update_review_reviewer"];
            oFormElement.value = result[0]["reviewer"];
            oFormElement = oFormObject.elements["update_review_rating"];
            oFormElement.value = result[0]["rating"];
        }
    });

    updateRecord();
}

// Update a review
function updateReview() {
    const data = {
        review_ID: document.getElementById("update_review_id").value,
        recipe_ID: document.getElementById("update_review_recipe").value,
        review_reviewer: document.getElementById("update_review_reviewer").value,
        review_date: document.getElementById("update_review_date").value,
        review_rating: document.getElementById("update_review_rating").value
    };
    
    $.ajax({
        url: '/updateReview',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(result) {
            location.reload();
        }
    })
}
// #endregion