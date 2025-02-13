/*
 * Applies the filters currently entered by the user to the set of all recipes.
 * Any recipe that satisfies the user's filter values will be displayed,
 * including recipes that are not currently being displayed because they didn't
 * satisfy an old set of filters. Recipes that don't satisfy the filters are
 * removed from the DOM.
 */
function doFilterUpdate() {
    //Grab values of filters from user inputs.
    var filters = {
        text: document.getElementById('filter-text').value.trim(),
        cuisine: document.getElementById()
    }
    
    var testimonyContainer = document.getElementById('testimonies-flex')
    var testimonyChildren = testimonyContainer.children

    // Reset testimony elements back to normal by making them visible again
    for (var j = 0; j < testimonyChildren.length;j++) {
        if (testimonyChildren[j].classList.contains('hidden')) {
            testimonyChildren[j].classList.remove('hidden')
        }
    }

    /*
     * "Remove" all "testimony" elements by hiding them.
     */ 
    var i = 0
    allTestimonies.forEach(function (testimony) {
        if (!(testimonyPassesFilters(testimony, filters))) {
            testimonyChildren[i].classList.add('hidden')
        }
        i++
    })
    
}






//Check if the filter button exists
var filterUpdateButton = document.getElementById('filter-update-button');

if (filterUpdateButton) {
    filterUpdateButton.addEventListener('click', function() {
        doFilterUpdate(); 
    });
}