const {
    MakeKabob,
    MakeTitleCase,
    MakeURL,
    MakeObj,
    ExtractIDFromURL,
} = require('./utils');

module.exports = data => data.map(trt => {
    const id = MakeKabob(trt.index);
    const out = {
        type: 'TRAIT',
        id,
        name: MakeTitleCase(trt.name),
        url: MakeURL('traits', id),
        source: 'PHB',
        description: (trt.desc || []).join('\\n'),
        races: [],
        subRaces: [],
    }

    if(trt.races)
        out.races = trt.races.map(ent => MakeObj('races', ExtractIDFromURL(ent.url), MakeTitleCase(ent.name)));

    if(trt.subraces)
        out.subRaces = trt.subraces.map(ent => MakeObj('sub-races', ExtractIDFromURL(ent.url), MakeTitleCase(ent.name)));

    return out;
});