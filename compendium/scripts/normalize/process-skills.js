const Path = require('path');
const FS = require('fs');

const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
    MakeObj,
    ExtractIDFromURL,
} = require('./utils');

module.exports = data => {
    const rawAbl = FS.readFileSync(Path.resolve('..', 'raw', '5e-SRD-Ability-Scores.json'));
    const ablData = JSON.parse(rawAbl);
    const abilities = {};
    ablData.forEach(abl => { abilities[abl.index] = abl.full_name });

    return data.map(skl => {
        const id = MakeKabob(skl.index);
        const out = {
            id,
            name: MakeTitleCase(skl.name),
            url: MakeURL('skills', id),
            source: 'PHB',
            description: (skl.desc || []).join('\\n'),
            ability: null,
        };

        if(skl.ability_score && skl.ability_score.url) {
            const ablId = ExtractIDFromURL(skl.ability_score.url);
            out.ability = MakeObj('ability-scores', 
                ablId, 
                abilities[ablId],
            );
        }

        return out;
    });
};