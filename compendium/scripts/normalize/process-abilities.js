const { 
    MakeKabob, 
    MakeURL,
    MakeObj,
    ExtractIDFromURL, 
} = require('./utils');

module.exports = data => data.map(abl => {
    const fullName = abl.full_name.trim();
    const out = {
        type: 'ABILITY_SCORE',
        id: MakeKabob(fullName),
        name: fullName,
        url: MakeURL('ability-scores', fullName),
        source: 'PHB',
        abreviation: abl.name.toUpperCase().trim(),
    };

    //Format description
    out.description = abl.desc.join('\\n');

    //List sub-skills
    if(abl.skills && Array.isArray(abl.skills))
        out.skills = abl.skills.map(skl => MakeObj('skills', ExtractIDFromURL(skl.url), skl.name) );
    else
        out.skills = [];

    return out;
});
