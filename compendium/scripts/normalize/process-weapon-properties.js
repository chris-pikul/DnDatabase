const {
    MakeKabob,
    MakeTitleCase,
    MakeURL,
} = require('./utils');

module.exports = data => data.map(prop => ({
    id: MakeKabob(prop.index),
    name: MakeTitleCase(prop.name),
    url: MakeURL('weapon-properties', MakeKabob(prop.index)),
    source: 'PHB',
    description: (prop.desc || []).join('\\n'),
}));
