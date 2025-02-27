/*
 * Function to insert a new recipe into the database. Takes
 * in the elements of a new recipe element.
 */
function insertNewRecipe() {
    var recipe_name = document.getElementById('recipe-name').value;
    var description = document.getElementById('modal-description').value;
    var cuisine_ID = document.getElementById('cuisine-id').value;

    console.log("description: ", description);
    var ingredients = [];
    var ingredientElements = document.querySelectorAll('.ingredient');
    ingredientElements.forEach(element => {
        var ingredient_ID = element.querySelector('.ingredient-select').value;
        var ingredient_qty = element.querySelector('.ingredient-qty').value;
        var ingredient_uom = element.querySelector('.ingredient-uom').value;

        ingredients.push({
            ingredient_ID: ingredient_ID,
            ingredient_qty: ingredient_qty,
            ingredient_uom: ingredient_uom
        });
    });

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
            console.log('Ingredient added successfully!');
        } else {
            console.error('Error adding ingredient:', data.message);
        }
    })
    .catch(error => {
        console.error('Error HERE:', error);
    });   
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



