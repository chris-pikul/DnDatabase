const FS = require('fs');
const Path = require('path');

const { 
    MakeKabob, 
    MakeEnum, 
    MakeURL, 
    MakeCamelCase, 
    MakeTitleCase, 
    ExtractIDFromURL,
    MakeObj,
 } = require('./utils');

//Sample for detecting instruments
const instruments = [
    'Bagpipes',
    'Drum',
    'Flute',
    'Lute',
    'Lyre',
    'Horn',
    'Viol'
];

const TranslateAbility = opt => {
    switch(opt.name) {
        case 'STR':
            return MakeObj('ability-scores', 'strength', 'Strength');
        case 'DEX':
            return MakeObj('ability-scores', 'dexterity', 'Dexterity');
        case 'CON':
            return MakeObj('ability-scores', 'constitution', 'Constitution');
        case 'INT':
            return MakeObj('ability-scores', 'intelligence', 'Intelligence');
        case 'WIS':
            return MakeObj('ability-scores', 'wisdom', 'Wisdom');
        case 'CHA':
            return MakeObj('ability-scores', 'charisma', 'Charisma');
    }
    return MakeObj('proficiencies', ExtractIDFromURL(opt.url), MakeTitleCase(opt.name))
}

module.exports = data => {
    console.log('Reading levels file for cross-reference');
    const rawLevels = FS.readFileSync(Path.resolve( '..', 'raw', '5e-SRD-Levels.json'));
    const levels = JSON.parse(rawLevels);

    const levelDict = {};
    const subclassLevelDict = {};
    levels.forEach(lvl => {
        const out = {
            level: parseInt(lvl.level),
            abilityScoreIncrease: false,
            proficiencyBonus: parseInt(lvl.prof_bonus),
            spellcasting: null,
            features: [],
            featureChoices: [],
            classSpecific: null,
        };

        
        if(lvl.features && Array.isArray(lvl.features) && lvl.features.length > 0) {
            lvl.features.forEach(feat => {
                const name = feat.name;

                //Ability score increase check
                if(name.startsWith('Ability Score Improvement')) {
                    out.abilityScoreIncrease = true;
                } else {
                    out.features.push( MakeObj('features', ExtractIDFromURL(feat.url), MakeTitleCase(name)) );
                }
            });
        }

        if(lvl.feature_choices && Array.isArray(lvl.feature_choices) && lvl.feature_choices.length > 0) {
            lvl.feature_choices.forEach(feat => {
                let name = feat.name;
                if(name.startsWith('Choose: '))
                    name = name.substr(8);
                out.featureChoices.push( MakeObj('features', ExtractIDFromURL(feat.url), MakeTitleCase(name)) );
            });
        }

        //Spellcasting
        if(lvl.spellcasting && lvl.spellcasting.cantrips_known) {
            out.spellcasting = {
                cantrips: parseInt(lvl.spellcasting.cantrips_known || 0),
                slots: [
                    parseInt(lvl.spellcasting.spell_slots_level_1 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_2 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_3 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_4 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_5 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_6 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_7 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_8 || 0),
                    parseInt(lvl.spellcasting.spell_slots_level_9 || 0),
                ],
            }
        }

        //class specific
        if(lvl.class_specific) {
            out.classSpecific = {};
            Object.keys(lvl.class_specific)
                .map(key => [ key, MakeCamelCase(key) ])
                .forEach(([org, key]) => out.classSpecific[key] = lvl.class_specific[org]);
        }
        
        if(lvl.subclass && lvl.subclass.name) {
            const clsId = MakeKabob(lvl.subclass.name);
            if(!subclassLevelDict.hasOwnProperty(clsId)) {
                subclassLevelDict[clsId] = [];
            }

            subclassLevelDict[clsId].push(out);
        } else {
            const clsId = MakeKabob(lvl.class.name);
            if(!levelDict.hasOwnProperty(clsId)) {
                levelDict[clsId] = [];
                levelDict[clsId].length = 20;
            }

            levelDict[clsId][out.level - 1] = out;
        }
    });

    console.log('Reading spellcasting file for corss-reference');
    const rawSpell = FS.readFileSync(Path.resolve('..', 'raw', '5e-SRD-Spellcasting.json'));
    const spell = JSON.parse(rawSpell);

    const spellDict = {};
    spell.forEach(spl => {
        const id = MakeKabob(spl.index);
        const out = {
            ability: TranslateAbility(spl.spellcasting_ability),
            unlockLevel: parseInt(spl.level || 0),
            features: spl.info.map(inf => ({
                title: inf.name,
                description: inf.desc.join('\\n'),
            })),
        };

        spellDict[id] = out;
    });

    console.log('Reading starting equipment file for cross-reference');
    const rawEquip = FS.readFileSync(Path.resolve('..', 'raw', '5e-SRD-StartingEquipment.json'));
    const equip = JSON.parse(rawEquip);

    const equipDict = {};
    equip.forEach(eqp => {
        const id = MakeKabob(eqp.class.name);
        const out = {
            starting: [],
            options: [],
        };

        if(eqp.starting_equipment && Array.isArray(eqp.starting_equipment)) {
            out.starting = eqp.starting_equipment.map(opt => ({
                ...MakeObj('items', ExtractIDFromURL(opt.equipment.url), MakeTitleCase(opt.equipment.name)),
                amount: parseInt(opt.quantity || 0),
            }));
        }

        if(eqp.starting_equipment_options) {
            out.options = eqp.starting_equipment_options.map(opt => {
                const outOpt = {
                    amount: parseInt(opt.choose || 1),
                    choices: [],
                };

                if(opt.from && Array.isArray(opt.from)) {
                    opt.from.forEach(frmOpt => {
                        if(frmOpt.equipment) {
                            if(frmOpt.equipment.name.indexOf('Pack') !== -1) {
                                outOpt.choices.push({
                                    type: 'EQUIPMENT_PACK',
                                    ...MakeObj('equipment-packs', ExtractIDFromURL(frmOpt.equipment.url), MakeTitleCase(frmOpt.equipment.name)),
                                    amount: parseInt(frmOpt.quantity || 1),
                                });
                            } else if(instruments.includes(frmOpt.equipment.name)) {
                                outOpt.choices.push({
                                    type: 'ITEM',
                                    ...MakeObj('items/instrument', ExtractIDFromURL(frmOpt.equipment.url), MakeTitleCase(frmOpt.equipment.name)),
                                    amount: parseInt(frmOpt.quantity || 1),
                                });
                            } else {
                                outOpt.choices.push({
                                    type: 'ITEM',
                                    ...MakeObj('items', ExtractIDFromURL(frmOpt.equipment.url), MakeTitleCase(frmOpt.equipment.name)),
                                    amount: parseInt(frmOpt.quantity || 1),
                                });
                            }
                        } else if(frmOpt.equipment_option) {
                            if(frmOpt.equipment_option.from.equipment_category) {
                                outOpt.choices.push({
                                    type: 'CATEGORY',
                                    ...MakeObj('equipment-categories', ExtractIDFromURL(frmOpt.equipment_option.from.equipment_category.url), frmOpt.equipment_option.from.equipment_category.name),
                                    //item: MakeEnum(frmOpt.equipment_option.from.equipment_category.name),
                                    amount: parseInt(frmOpt.equipment_option.choose || 1),
                                });
                            } else {
                                outOpt.choices.push({
                                    type: 'CATEGORY',
                                    ...MakeObj('equipment-categories', ExtractIDFromURL(frmOpt.equipment_option.from.url), frmOpt.equipment_option.from.name),
                                    item: MakeEnum(frmOpt.equipment_option.from.name),
                                    amount: parseInt(frmOpt.equipment_option.choose || 1),
                                });
                            }
                        }
                    });
                }

                return outOpt;
            });
        }

        equipDict[id] = out;
    });
    
    console.log('Building classes data...');
    return data.map(cls => {
        const out = {
            type: 'CLASS',
            id: MakeKabob(cls.index),
            url: MakeURL('classes', cls.index),
            name: cls.name,
            description: '',
            source: 'PHB',
            hitDie: parseInt(cls.hit_die),
            
            levels: [],

            proficiencies: {
                savingThrows: [],
                equipment: [],
                options: [],
            },

            spellcasting: null,
            equipment: [],
        };

        //Levels
        const clsLvl = levelDict[ MakeKabob(cls.name) ];
        if(clsLvl) {
            out.levels = clsLvl;
            out.levels.sort((a,b) => (a.level < b.level ? -1 : (a.level > b.level ? 1 : 0)));
        }

        //Saving throws
        if(cls.saving_throws) {
            out.proficiencies.savingThrows = cls.saving_throws.map(TranslateAbility);
        }

        //Equipment Profs.
        if(cls.proficiencies) {
            out.proficiencies.equipment = cls.proficiencies.map(opt => {
                if(opt.url === '/api/proficiencies/all-armor') {
                    return [
                        MakeObj('proficiencies', 'light-armor', 'Light Armor'),
                        MakeObj('proficiencies', 'medium-armor', 'Medium Armor'),
                        MakeObj('proficiencies', 'heavy-armor', 'Heavy Armor'),
                        MakeObj('proficiencies', 'shields', 'Shields'),
                    ];
                }

                return MakeObj('proficiencies', ExtractIDFromURL(opt.url), MakeTitleCase(opt.name));
            }).flat();
        }

        //prof Choices
        if(cls.proficiency_choices && Array.isArray(cls.proficiency_choices)) {
            out.proficiencies.options = cls.proficiency_choices.map(choice => {
                const prof = {
                    type: 'EQUIPMENT',
                    amount: parseInt(choice.choose || 0),
                    choices: [],
                };

                if(choice.from && Array.isArray(choice.from) && choice.from.length > 0) {
                    const sample = choice.from[0].name;
                    if(sample.startsWith('Skill:')) {
                        //Skill
                        prof.type = 'SKILL';
                        prof.choices = choice.from.map(opt => 
                            MakeObj('skills', MakeKabob(opt.name.substr(7)), opt.name.substr(7))
                        );
                        return prof;
                    } else if(sample.indexOf('tools') !== -1 || sample.indexOf('supplies') !== -1) {
                        prof.type = 'TOOLS';
                    } else if(instruments.includes(sample)) {
                        prof.type = 'INSTRUMENT';

                        prof.choices = choice.from.map(opt =>
                            MakeObj('items/instrument', MakeKabob(opt.name), MakeTitleCase(opt.name))   
                        );
                        return prof;
                    }

                    prof.choices = choice.from.map(opt => 
                        MakeObj('proficiencies', ExtractIDFromURL(opt.url), MakeTitleCase(opt.name))
                    );
                }

                return prof;
            });

            out.proficiencies.options.sort((a,b) => (a.type < b.type ? -1 : (a.type > b.type ? 1 : 0)) );
        }

        //Spellcasting
        if(cls.spellcasting && cls.spellcasting.class)
            out.spellcasting = spellDict[ out.id ];

        //Equipment
        if(cls.starting_equipment && cls.starting_equipment.class)
            out.equipment = equipDict[ out.id ];

        //Subclasses
        /*
        if(subDict[out.id])
            out.subClasses = subDict[out.id];
            */

        return out;
    });
}