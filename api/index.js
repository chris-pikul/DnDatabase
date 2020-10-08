const Path = require('path');
const FS = require('fs');

const rootPath = Path.resolve(__dirname, '..', 'compendium');
const compendiums = [
    Path.resolve( rootPath, '5e-SRD' ),
    Path.resolve( rootPath, 'homebrew' ),
];

//Load the summaries index
const summPath = Path.resolve(__dirname, '..', 'compendium', 'indexes', 'summaries.json');
const summaries = JSON.parse( FS.readFileSync(summPath) );

//Libraries
const Express = require('express');
const Fuse = require('fuse.js');

const fuseIndex = Fuse.createIndex(['name', 'tags', 'meta', 'description'], summaries);
const fuse = new Fuse(summaries, {
    isCaseSensitive: false,
    keys: [
        { name: 'name', weight: 3 },
        { name: 'tags', weight: 1 },
        { name: 'meta', weight: 0.5 },
        { name: 'description', weight: 0.1 },
    ]
}, fuseIndex);

//Start API Implementation
const api = Express();
const port = 8080;

api.get('/', (req, res) => {
    res.send('Hello World!');
});

const operators = ['type', 'tag'];
const opRegex = /(?:(\w+):([\w\d,]+)\b)/gi;

const filterByOperations = (operations) => (obj) => {
    //Filter out by operation
    //note: each op is considered AND in this case.
    //each result must match each op
    return operations.reduce((acc, [op, param]) => {
        switch(op) {
            case 'type':
                return acc && (obj.type.toLowerCase() == param);
            case 'tag':
                return acc && (
                    (obj.tags.findIndex(el => el.toLowerCase() == param) !== -1) 
                    ||
                    (obj.meta.findIndex(el => el.toLowerCase() == param) !== -1)
                );
        }
        return true;
    }, true);
};

api.get('/search', (req, res) => {
    const initQuery = req.query.q || '';
    console.log(`Starting search with initial query "${initQuery}"`);

    //Pull out operatives
    let query = initQuery;
    const operations = [];
    let match = opRegex.exec(initQuery);
    do {
        if(match && match.length === 3) {
            const [ full, op, param ] = match;
            if(operators.includes(op.toLowerCase())) {
                query = query.replace(full, '');
                operations.push([op.toLowerCase(), param.toLowerCase()]);
            }
        }
    } while((match = opRegex.exec(initQuery)) !== null);
    if(operations.length > 0)
        console.log('Found search operations: ', operations);
    query = query.trim();

    //Compute pagination
    const pageLength = Math.max(1, parseInt( req.query.length || 10));
    const pageNum = Math.max(1, parseInt( req.query.page || 1));

    const start = pageLength * (pageNum - 1);
    const end = (start + pageLength);
    console.log(`Pagination: Len=${pageLength} Num=${pageNum}, Start=${start} End=${end}`);

    //Start the searching
    console.log(`Remaining query: "${query}"`);
    let results = [];
    if(query.length > 1) {
        results = fuse.search(query)
            .map(obj => obj.item)
            .filter( filterByOperations(operations) )
            .slice( start, end );
    } else {
        //No query length means we want everything, with optional operations
        results = summaries
            .filter( filterByOperations(operations) )
            .slice( start, end );
    }
    console.log(`Returning ${results.length} results`);

    res.send(results);
});

api.get('*', (req, res) => {
    for(const fldr of compendiums) {
        try {
            const path = Path.join(fldr, req.path) + '.json';
            console.log('Checking existance of: ', path);
            if(FS.existsSync(path)) {
                const data = JSON.parse( FS.readFileSync(path) );
                return res.send(data);
            }
        } catch(err) {
            console.warn('Error checking existance of: ', req.path);
        }
    }

    res.sendStatus(404);
});

api.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});