const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
} = require('./utils');

module.exports = data => data.map(scl => {
    const id = MakeKabob(scl.index);
    return {
        id,
        name: MakeTitleCase(scl.name),
        url: MakeURL('magic-schools', id),
        source: 'PHB',
        description: scl.desc || '',
    }
});