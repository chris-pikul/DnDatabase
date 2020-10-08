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

const fuse = new Fuse(summaries, {
    isCaseSensitive: false,
    keys: [
        { name: 'name', weight: 3 },
        { name: 'tags', weight: 1 },
        { name: 'meta', weight: 0.5 },
        { name: 'description', weight: 0.1 },
    ]
});

//Start API Implementation
const api = Express();
const port = 8080;

api.get('/', (req, res) => {
    res.send('Hello World!');
});

api.get('/search', (req, res) => {
    const query = req.query.q || '';
    const pageLength = Math.max(1, parseInt( req.query.length || 10));
    const pageNum = Math.max(1, parseInt( req.query.page || 1));

    const start = pageLength * (pageNum - 1);
    const end = start + pageLength;

    console.log(`Searching query: "${query}"`);
    const results = fuse.search(query)
        .slice( start, end )
        .map(obj => obj.item);

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