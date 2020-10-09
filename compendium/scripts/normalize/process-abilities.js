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
        description: abl.desc.join('\\n'),
        source: 'PHB',
        abreviation: abl.name.toUpperCase().trim(),
        skills: [],
    };

    //List sub-skills
    if(abl.skills && Array.isArray(abl.skills))
        out.skills = abl.skills.map(skl => MakeObj('skills', ExtractIDFromURL(skl.url), skl.name) );

    return out;
});
