/*
 * Function to insert a new recipe into the database. Takes
 * in the elements of a new recipe element.
 */
function insertNewRecipe(){
    hideModal()
    var recipe_ID = 1; //this will be replaced by DB
    var name = document.getElementById("modal-name").value;
    var cuisine_ID = document.getElementById("modal-cuisine").value;
    var desc = document.getElementById("modal-description").value; 

    var ingredients = [];
    document.querySelectorAll("#ingredients-container .ingredient-group").forEach(ingredient => {
        var name = ingredient.querySelector("input[name='ingredientName[]']").value;
        var qty = ingredient.querySelector("input[name='ingredientQty[]']").value;
        var uom = ingredient.querySelector("select[name='ingredientUOM[]']").value;
        ingredients.push({ name, qty, uom });
    });

    var data = { recipe_ID, name, cuisine_ID, instructions, ingredients };

    var recipeContainer = document.getElementById("recipe-flex");
    var html = Handlebars.templates["singleRecipe"](data);
    recipeContainer.insertAdjacentHTML("beforeend", html);

    console.log("Recipe added:", data);
}

/*
 * A function to apply the current filters to a specific recipe.  Returns true
 * if the recipe passes the filters and should be displayed and false otherwise.
 */
function recipePassesFilters(recipe, filters) {
    
    var passesText = true;
    if (filters.text) {
        var recipeName = recipe.name.toLowerCase(); //The name will be from the database name
        var filterText = filters.text.toLowerCase();
        if (recipeName.indexOf(filterText) === -1) {
            console.log("filter text doesn't appear")
            passesText = false;
        }else{
            console.log("filter text appears")
        }
    }

    var passesCuisine = true;
    if (filters.cuisine) {
        var recipeCuisine = recipe.cuisine.toLowerCase(); //The cuisine will be from the database cuisine associated
        var filterText = filters.cuisine.toLowerCase();
        if (recipeCuisine.indexOf(filterText) === -1) {
            console.log("filter text doesn't appear")
            passesCuisine = false;
        }else{
            console.log("filter text appears")
        }
    }

    var passesRating1 = true;
    if (filters.rating1.checked) {
        var reviewNum = 0 //this will be changed to represent the number of reviews for the associated recipe
        for (var i = 0; i < reviewNum; i++){
            var recipeRating = recipe.review(); //the rating will be from the database review associated
            if (recipeRating <= 0 && recipeRating >= 1){
                passesRating1 = false
            }
        }
    }

    var passesRating2 = true;
    if (filters.rating2.checked) {
        var reviewNum = 0 //this will be changed to represent the number of reviews for the associated recipe
        for (var i = 0; i < reviewNum; i++){
            var recipeRating = recipe.review(); //the rating will be from the database review associated
            if (recipeRating <= 1 && recipeRating >= 2){
                passesRating2 = false
            }
        }
    }

    var passesRating3 = true;
    if (filters.rating3.checked) {
        var reviewNum = 0 //this will be changed to represent the number of reviews for the associated recipe
        for (var i = 0; i < reviewNum; i++){
            var recipeRating = recipe.review(); //the rating will be from the database review associated
            if (recipeRating <= 2 && recipeRating >= 3){
                passesRating3 = false
            }
        }
    }

    var passesRating4 = true;
    if (filters.rating4.checked) {
        var reviewNum = 0 //this will be changed to represent the number of reviews for the associated recipe
        for (var i = 0; i < reviewNum; i++){
            var recipeRating = recipe.review(); //the rating will be from the database review associated
            if (recipeRating <= 3 && recipeRating >= 4){
                passesRating4 = false
            }
        }
    }

    var passesRating5 = true;
    if (filters.rating5.checked) {
        var reviewNum = 0 //this will be changed to represent the number of reviews for the associated recipe
        for (var i = 0; i < reviewNum; i++){
            var recipeRating = recipe.review(); //the rating will be from the database review associated
            if (recipeRating <= 4 && recipeRating >= 5){
                passesRating5 = false
            }
        }
    }

    return passesText, passesCuisine, passesRating1, passesRating2, passesRating3, passesRating4, passesRating5;
}

/*
 * Applies the filters currently entered by the user to the set of all recipes.
 * Any recipe that satisfies the user's filter values will be displayed,
 * including recipes that are not currently being displayed because they didn't
 * satisfy an old set of filters. Recipes that don't satisfy the filters are
 * removed from the DOM.
 */
function doFilterUpdate() {
    console.log("Doing filter update")
    //Grab values of filters from user inputs.
    var filters = {
        text: document.getElementById("filter-text").value.trim(),
        cuisine: document.getElementById("filter-cuisine").value,
        rating1: document.getElementById("filter-1"),
        rating2: document.getElementById("filter-2"),
        rating3: document.getElementById("filter-3"),
        rating4: document.getElementById("filter-4"),
        rating5: document.getElementById("filter-5")
    }
    
    var recipeContainer = document.getElementById("recipes-flex")
    var recipeChildren = recipeContainer.children

    // Reset recipe elements back to normal by making them visible again
    for (var j = 0; j < recipeChildren.length;j++) {
        if (recipeChildren[j].classList.contains("hidden")) {
            recipeChildren[j].classList.remove("hidden")
        }
    }

    /*
     * "Remove" all "recipe" elements by hiding them.
     */ 
    var i = 0
    allRecipes.forEach(function (recipe) {
        if (!(recipePassesFilters(recipe, filters))) {
            recipeChildren[i].classList.add("hidden")
        }
        i++
    })
    
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


var allRecipes = []
var recipeElems = document.getElementsByClassName('recipe-post')

for (var i = 0; i < recipeElems.length; i++) {
    console.log("Inspecting recipe element: ", recipeElems[i]);
    allRecipes.push(parserecipeElem(recipeElems[i]));
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
if (modalCancel) {
    modalCancel.addEventListener("click", function(){
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

