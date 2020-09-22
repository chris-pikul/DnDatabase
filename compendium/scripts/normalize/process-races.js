const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
    MakeObj,
    MakeEnum,
    ExtractIDFromURL,
} = require('./utils');

const extractAge = inp => {
    let matches = inp.match(/(\d+)/g);
    if(matches && matches.length > 1) {
        matches = matches.map(m => parseInt(m));
        matches.sort((a,b) => (a > b ? 1 : (a < b ? -1 : 0)));
        return [ matches[0], matches[matches.length - 1]];
    }
    return null;
};

module.exports = data => data.map(race => {
    const id = MakeKabob(race.index);
    const out = {
        type: 'RACE',
        id,
        name: MakeTitleCase(race.name),
        url: MakeURL('races', id),
        source: 'PHB',
        description: '',

        alignment: (race.alignment || '').trim(),

        age: {
            adulthood: 0,
            lifespan: 0,
            description: (race.age || '').trim(),
        },

        size: {
            type: MakeEnum(race.size),
            description: (race.size_description || '').trim(),
        },

        abilityScores: { 
            starting: [], 
            options: null,
        },

        proficiencies: {
            starting: [],
            options: null,
        },

        languages: {
            starting: [],
            options: null,
            description: (race.language_desc || '').trim(),
        },

        traits: [],

        subRaces: [],
    };

    //Figure out age range
    let ageMatch = extractAge(race.age);
    if(ageMatch) {
        out.age.adulthood = ageMatch[0];
        out.age.lifespan = ageMatch[1];
    } else {
        console.warn(`Unable to determin age range for ${out.id}`);
    }

    //Ability scores
    if(race.ability_bonuses && Array.isArray(race.ability_bonuses)) {
        out.abilityScores.starting = race.ability_bonuses.map(abl => ({
            ...MakeObj('ability-scores', ExtractIDFromURL(abl.url), MakeTitleCase(abl.name)),
            amount: parseInt(abl.bonus || 0),
        }));
    }
    if(race.ability_bonus_options && race.ability_bonus_options.choose) {
        const opt = race.ability_bonus_options;
        out.abilityScores.options = {
            number: parseInt(opt.choose || 1),
            choices: opt.from.map(o => ({
                ...MakeObj('ability-scores', ExtractIDFromURL(o.url), MakeTitleCase(o.name)),
                amount: parseInt(o.bonus || 1),
            })),
        };
    }

    //Proficiencies
    if(race.starting_proficiencies) {
        out.proficiencies.starting = race.starting_proficiencies.map(prf => {
            let name = '';
            if(prf.name.startsWith('Skill: '))
                name = MakeTitleCase(prf.name.substr(8).trim());
            else
                name = MakeTitleCase(prf.name);
            return MakeObj('proficiencies', ExtractIDFromURL(prf.url), name);
        });
    }
    if(race.starting_proficiency_options && race.starting_proficiency_options.choose) {
        const opt = race.starting_proficiency_options;
        out.proficiencies.options = {
            number: parseInt(opt.choose || 1),
            choices: opt.from.map(o => MakeObj('proficiencies', ExtractIDFromURL(o.url), MakeTitleCase(o.name))),
        };
    }

    //Languages
    if(race.languages && Array.isArray(race.languages)) {
        out.languages.starting = race.languages.map(lng => MakeObj('languages', ExtractIDFromURL(lng.url), MakeTitleCase(lng.name)));
    }
    if(race.language_options && race.language_options.choose) {
        const opt = race.language_options;
        out.languages.options = {
            number: parseInt(opt.choose || 1),
            choices: opt.from.map(o => MakeObj('languages', ExtractIDFromURL(o.url), MakeTitleCase(o.name))),
        };
    }

    //Traits
    if(race.traits && Array.isArray(race.traits)) {
        out.traits = race.traits.map(t => MakeObj('traits', ExtractIDFromURL(t.url), MakeTitleCase(t.name)));
    }

    //SubRaces
    if(race.subraces && Array.isArray(race.subraces)) {
        out.subRaces = race.subraces.map(r => MakeObj('races/sub-races', ExtractIDFromURL(r.url), MakeTitleCase(r.name)));
    }

    return out;
});