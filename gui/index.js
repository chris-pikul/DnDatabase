'use strict';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let noResultsHTML = '';
let queueSearch = 0;
let isSearching = false;
let lastSearch = '';

let pageNumber = 1;
let pageSize = 10;

function searchFormSubmit(event) {
    event.preventDefault();
    performSearch();
    return false;
}

function searchInputUpdate(event) {
    //We only search if more than 1 character is inputed
    if(event.target.value.length > 1) {
        if(isSearching) {
            queueSearch++;
            return;
        }

        performSearch();
    } else {
        //Reset the form here
        resetSearchResults();
        queueSearch = 0;
    }
}

function resetSearchResults() {
    searchResults.innerHTML = '';
}

(() => {
    //Stop the search form from submitting back
    searchForm.addEventListener('submit', searchFormSubmit);

    //Setup the input and bind to it changing
    searchInput.value = '';
    searchInput.addEventListener('input', searchInputUpdate);

    //Steal the results part and clear it
    noResultsHTML = searchResults.innerHTML;
    searchResults.innerHTML = '';
})();

function performSearch() {
    const searchValue = searchInput.value.trim();
    if(searchValue.length <= 1) return; //Skip for minimal

    //Reduce queue
    queueSearch--;
    
    //Check if same input
    if(lastSearch === searchValue) {
        queueSearch = 0;
        isSearching = false;
    }
    lastSearch = searchValue;
    
    //Perform the actual search now
    console.log('Performing search', searchValue);
    const url = `/search?length=${pageSize}&page=${pageNumber}&q=${encodeURIComponent(searchValue)}`;
    isSearching = true;
    fetch(url)
        .then(resp => resp.json())
        .then(data => {
            console.log('Received response!', data);
            if(data.length === 0 ) {
                searchResults.innerHTML = noResultsHTML;
            } else {
                processResults(data);
            }
            
            isSearching = false;
            if(queueSearch > 0)
                performSearch();
        })
        .catch(err => {
            console.error(`Error while searching for "${searchValue}", full URL was "${url}", error:\n\n${err.message}`);
            isSearching = false;
        });
}

//Templating and search result functions
//======================================

const resultTemplate = document.getElementById('searchResultTempl');
function processResults(data) {
    searchResults.innerHTML = '';

    data.forEach(result => {
        resultTemplate.content.querySelector('._title').innerText = result.name;
        resultTemplate.content.querySelector('._type').innerText = result.type;
        resultTemplate.content.querySelector('._desc').innerText = result.description;

        const tagBar = resultTemplate.content.querySelector('._tags');
        tagBar.innerHTML = '';
        result.tags.forEach(tag => {
            const bdg = document.createElement('a');
            bdg.classList.add('badge', 'badge-secondary', 'd-inline-flex', 'mr-1', '_tagBadge');
            bdg.innerText = tag;
            bdg.href = '#';

            tagBar.appendChild(bdg);
        });

        const card = resultTemplate.content.querySelector('.card');
        card.className = `card type-${result.type.toLowerCase()}`
        card.href = result.url;

        //Stamp out the template
        const el = document.importNode(resultTemplate.content, true);
        searchResults.appendChild(el);
    });

    //Rebind badges
    document.querySelectorAll('._tagBadge').forEach(badge => {
        badge.addEventListener('click', evt => {
            evt.preventDefault();

            searchInput.value = `${searchInput.value.trim()} tag:${badge.innerText}`;
            performSearch();
        });
    });

    document.querySelectorAll('._typeBadge').forEach(badge => {
        badge.addEventListener('click', evt => {
            evt.preventDefault();

            searchInput.value = `${searchInput.value.trim()} type:${badge.innerText}`;
            performSearch();
        });
    });
}

