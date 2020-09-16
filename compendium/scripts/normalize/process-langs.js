const { 
    MakeKabob, 
    MakeURL,
    MakeTitleCase,
} = require('./utils');

module.exports = data => data.map(lang => {
    const id = MakeKabob(lang.index);
    const out = {
        id,
        name: MakeTitleCase(lang.name),
        url: MakeURL('languages', id),
        source: 'PHB',
        description: '',
        isExotic: !!(lang.type && lang.type === 'Exotic'),
        script: lang.script || 'Common',
        speakers: lang.typical_speakers || [],
    };

    if(lang.desc)
        out.description = lang.desc.trim();

    return out;
});