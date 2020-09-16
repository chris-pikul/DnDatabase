const FS = require('fs');
const Path = require('path');

const { MakeKabob, MakeEnum, MakeURL, MakeCamelCase } = require('./utils');

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

module.exports = data => {
    console.log('Reading levels file for cross-reference');
    const rawLevels = FS.readFileSync(Path.resolve(__dirname, '..', 'raw', '5e-SRD-Levels.json'));
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
                    out.features.push( MakeEnum(name) );
                }
            });
        }

        if(lvl.feature_choices && Array.isArray(lvl.feature_choices) && lvl.feature_choices.length > 0) {
            lvl.feature_choices.forEach(feat => {
                let name = feat.name;
                if(name.startsWith('Choose: '))
                    name = name.substr(8);
                out.featureChoices.push( MakeEnum(name) );
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
    const rawSpell = FS.readFileSync(Path.resolve(__dirname, '..', 'raw', '5e-SRD-Spellcasting.json'));
    const spell = JSON.parse(rawSpell);

    const spellDict = {};
    spell.forEach(spl => {
        const id = MakeKabob(spl.index);
        const out = {
            ability: MakeEnum(spl.spellcasting_ability.name),
            unlockLevel: parseInt(spl.level || 0),
            features: spl.info.map(inf => ({
                title: inf.name,
                description: inf.desc.join('\\n'),
            })),
        };

        spellDict[id] = out;
    });

    console.log('Reading starting equipment file for cross-reference');
    const rawEquip = FS.readFileSync(Path.resolve(__dirname, '..', 'raw', '5e-SRD-StartingEquipment.json'));
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
                item: MakeEnum(opt.equipment.name),
                amount: parseInt(opt.quantity || 0),
            }));
        }

        if(eqp.starting_equipment_options) {
            out.options = eqp.starting_equipment_options.map(opt => {
                const outOpt = {
                    choose: parseInt(opt.choose || 1),
                    from: [],
                };

                if(opt.from && Array.isArray(opt.from)) {
                    opt.from.forEach(frmOpt => {
                        if(frmOpt.equipment) {
                            outOpt.from.push({
                                type: 'ITEM',
                                item: MakeEnum(frmOpt.equipment.name),
                                amount: parseInt(frmOpt.quantity || 1),
                            });
                        } else if(frmOpt.equipment_option) {
                            if(frmOpt.equipment_option.from.equipment_category) {
                                outOpt.from.push({
                                    type: 'CATEGORY',
                                    item: MakeEnum(frmOpt.equipment_option.from.equipment_category.name),
                                    amount: parseInt(frmOpt.equipment_option.choose || 1),
                                });
                            } else {
                                outOpt.from.push({
                                    type: 'CATEGORY',
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

    console.log('Reading sub-classes file for cross-reference');
    const rawSubs = FS.readFileSync(Path.resolve(__dirname, '..', 'raw', '5e-SRD-Subclasses.json'));
    const subs = JSON.parse(rawSubs);

    const subDict = {};
    subs.forEach(sub => {
        const out = {
            id: MakeKabob(sub.index),
            name: sub.name,
            kind: sub.subclass_flavor,
            description: sub.desc.join('\\n'),
        };

        const id = MakeKabob(sub.class.name);
        if(!subDict.hasOwnProperty(id))
            subDict[id] = [];
        subDict[id].push(out);
    });
    
    console.log('Building classes data...');
    data.forEach(cls => {
        const out = {
            id: MakeKabob(cls.index),
            url: MakeURL('classes', cls.index),
            name: cls.name,
            source: 'PHB',
            hitDie: parseInt(cls.hit_die),
            
            levels: [],

            proficiencies: {
                savingThrows: [],
                equipment: [],
                choices: [],
            },

            spellcasting: null,
            equipment: [],

            subClasses: [],
        };

        //Levels
        const clsLvl = levelDict[ MakeKabob(cls.name) ];
        if(clsLvl) {
            out.levels = clsLvl;
            out.levels.sort((a,b) => (a.level < b.level ? -1 : (a.level > b.level ? 1 : 0)));
        }

        //Saving throws
        if(cls.saving_throws)
            out.proficiencies.savingThrows = cls.saving_throws.map(opt => MakeEnum(opt.name));
        
        //Equipment Profs.
        if(cls.proficiencies) {
            out.proficiencies.equipment = cls.proficiencies.map(opt => {
                if(opt.url === '/api/proficiencies/all-armor') {
                    return ['LIGHT_ARMOR', 'MEDIUM_ARMOR', 'HEAVY_ARMOR'];
                }

                return MakeEnum(opt.name)
            }).flat();
        }

        //prof Choices
        if(cls.proficiency_choices && Array.isArray(cls.proficiency_choices)) {
            out.proficiencies.choices = cls.proficiency_choices.map(choice => {
                const prof = {
                    type: 'EQUIPMENT',
                    amount: parseInt(choice.choose || 0),
                    options: [],
                };

                if(choice.from && Array.isArray(choice.from) && choice.from.length > 0) {
                    const sample = choice.from[0].name;
                    if(sample.startsWith('Skill:')) {
                        //Skill
                        prof.type = 'SKILL';

                        prof.options = choice.from.map(opt => MakeEnum(opt.name.substr(7)));
                        return prof;
                    } else if(sample.indexOf('tools') !== -1 || sample.indexOf('supplies') !== -1) {
                        prof.type = 'TOOLS';
                    } else if(instruments.includes(sample)) {
                        prof.type = 'INSTRUMENT';
                    }

                    prof.options = choice.from.map(opt => MakeEnum(opt.name));
                }

                return prof;
            });

            out.proficiencies.choices.sort((a,b) => (a.type < b.type ? -1 : (a.type > b.type ? 1 : 0)) );
        }

        //Spellcasting
        if(cls.spellcasting && cls.spellcasting.class)
            out.spellcasting = spellDict[ out.id ];

        //Equipment
        if(cls.starting_equipment && cls.starting_equipment.class)
            out.equipment = equipDict[ out.id ];

        //Subclasses
        if(subDict[out.id])
            out.subClasses = subDict[out.id];

        //Write the data out
        const path = Path.resolve(__dirname, '..', `class-${out.id}.json`);
        const json = JSON.stringify(out, null, 2);
        FS.writeFileSync(path, json, 'utf8', 777);
        console.log(`Wrote class ${out.name} to file "${path}"`);
    });

    return null;
}