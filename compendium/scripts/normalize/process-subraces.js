const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
    MakeObj,
    ExtractIDFromURL,
} = require('./utils');

module.exports = data => data.map(race => {
    const id = MakeKabob(race.index);
    const out = {
        type: 'SUB_RACE',
        id,
        name: MakeTitleCase(race.name),
        url: MakeURL('races/sub-races', id),
        source: 'PHB',
        description: (race.desc || '').trim(),

        race: MakeObj('races', ExtractIDFromURL(race.race.url), MakeTitleCase(race.race.name)),

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

        traits: {
            starting: [],
            options: null,
        },

        subRaces: [],
    };

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
    if(race.racial_traits && Array.isArray(race.racial_traits)) {
        out.traits.starting = race.racial_traits.map(t => MakeObj('traits', ExtractIDFromURL(t.url), MakeTitleCase(t.name)));
    }
    if(race.racial_trait_options && race.racial_trait_options.choose) {
        const opt = race.racial_trait_options;
        out.traits.options = {
            number: parseInt(opt.choose || 1),
            choices: opt.from.map(o => MakeObj('traits', ExtractIDFromURL(o.url), MakeTitleCase(o.name))),
        }
    }

    //SubRaces
    if(race.subraces && Array.isArray(race.subraces)) {
        out.subRaces = race.subraces.map(r => MakeObj('races/sub-races', ExtractIDFromURL(r.url), MakeTitleCase(r.name)));
    }

    return out;
});