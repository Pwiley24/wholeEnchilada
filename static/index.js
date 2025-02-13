//JS for Testimony filtering:
//JS outline from assignment 5 --> source citation
var allTestimonies = []
var testimonyElems = document.getElementsByClassName('testimonial-post')

for (var i = 0; i < testimonyElems.length; i++) {
    console.log("Inspecting testimony element: ", testimonyElems[i]);  // Check the DOM element
    allTestimonies.push(parseTestimonyElem(testimonyElems[i]));
}

//Check if the filter button exists
var filterUpdateButton = document.getElementById('filter-update-button');

if (filterUpdateButton) {
    console.log("filter button: ", filterUpdateButton)

    filterUpdateButton.addEventListener('click', function() {
        console.log('Filter button clicked');
        doFilterUpdate(); 
    });
}