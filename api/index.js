const Path = require('path');
const FS = require('fs');

//Levenshtein
const Levenshtein = require('js-levenshtein');

//Tokenizer
const {
    TokenizeAndFilter,
    FilterLowercase,
    FilterDedup,
    FilterStopWords,
    FilterWords,
    FilterStemmer,
} = require('../compendium/scripts/indexing/tokenizer');

//Load the dictionary
const dictPath = Path.resolve(__dirname, '..', 'compendium', 'indexes', 'dictionary.json');
console.log('Reading dictionary index from: ', dictPath);
const dictionary = JSON.parse( FS.readFileSync(dictPath) );

const indexPath = Path.resolve(__dirname, '..', 'compendium', 'indexes', 'dict-urls.json');
console.log('Reading indice from: ', indexPath);
const index = JSON.parse( FS.readFileSync(indexPath) );

//Express
const Express = require('express');

const api = Express();
const port = 8080;

api.get('/', (req, res) => {
    res.send('Hello World!');
});

api.get('/autocomplete', (req, res) => {
    const query = req.query.q || '';

    const tokens = TokenizeAndFilter(query,
        FilterLowercase,
        FilterStopWords,
        FilterWords,
        FilterDedup,
    );

    const results = tokens.map(token => {
        const out = {
            token,
            matches: [],
        };

        const matches = dictionary.map(word => ([ word, Levenshtein(token, word) ]) );
        matches.sort( (a,b) => (a[1] > b[1] ? 1 : (a[1] < b[1] ? -1 : 0)) );
        out.matches = matches.slice(0, 5);

        return out;
    });

    res.send( results );
});

api.get('/search', (req, res) => {
    const query = req.query.q || '';

    const tokens = TokenizeAndFilter(query,
        FilterLowercase,
        FilterStopWords,
        FilterWords,
        FilterStemmer,
        FilterDedup,
    );

    const matches = FilterDedup( tokens.map(token => {
            if(index.hasOwnProperty(token))
                return index[token];
            return false;
        }).filter(entry => !!entry)
        .flat(2)
    );

    res.send(matches);
});

api.get('*', (req, res) => {
    res.send('FALLBACK RESPONSE');
});

api.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});