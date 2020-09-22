const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
    MakeObj,
    ExtractIDFromURL,
} = require('./utils');

module.exports = data => data.map(prof => {
    const id = MakeKabob(prof.index);

    const out = {
        type: 'PROFICIENCY',
        id,
        name: MakeTitleCase(prof.name),
        url: MakeURL('proficiencies', id),
        source: 'PHB',
        description: '',
        category: 'MISC',
        races: [],
        classes: [],
        references: [],
    };

    if(prof.name.startsWith('Skill: '))
        out.name = out.name.substr(8);

    switch(prof.type) {
        case 'Armor':
            out.category = 'ARMOR';
            break;
        case 'Weapons':
            out.category = 'WEAPONS';
            break;
        case 'Artisan\'s Tools':
            out.category = 'TOOLS';
            break;
        case 'Gaming Sets':
            out.category = 'GAMING';
            break;
        case 'Musical Instruments':
            out.category = 'MUSICAL_INSTRUMENTS';
            break;
        case 'Vehicles':
            out.category = 'VEHICLES';
            break;
        case 'Saving Throws':
            out.category = 'SAVING_THROWS';
            break;
        case 'Skills':
            out.category = 'SKILLS';
            break;
    }

    if(prof.races && Array.isArray(prof.races)) {
        out.races = prof.races.map(race => MakeObj('races', ExtractIDFromURL(race.url), MakeTitleCase(race.name)));
    }

    if(prof.classes && Array.isArray(prof.classes)) {
        out.classes = prof.classes.map(cls => MakeObj('classes', ExtractIDFromURL(cls.url), MakeTitleCase(cls.name)));
    }

    if(prof.references && Array.isArray(prof.references)) {
        out.references = prof.references.map(ref => {
            if(ref.type) {
                let urlBase = '';
                switch(ref.type) {
                    case 'equipment-categories':
                        urlBase = 'item-categories';
                        break;
                    case 'equipment':
                        if(prof.type === 'Armor') {
                            urlBase = 'items/armor';
                        } else if(prof.type === 'Weapons') {
                            urlBase = 'items/weapon';
                        } else if(prof.type === 'Artisan\'s Tools') {
                            urlBase = 'items/tools';
                        } else if(prof.type === 'Gaming Sets') {
                            urlBase = 'items/gaming';
                        } else if(prof.type === 'Musical Instruments') {
                            urlBase = 'items/instrument';
                        } else if(prof.type === 'Other') {
                            urlBase = 'items';
                        }
                        break;
                    case 'ability-scores':
                        urlBase = 'ability-scores';
                        break;
                    case 'skills':
                        urlBase = 'skills';
                        break;
                }

                if(urlBase) return MakeObj(urlBase, ExtractIDFromURL(ref.url), MakeTitleCase(ref.name));
            }
            return null;
        }).filter(ref => !!(ref && ref.url));
    }

    return out;
})