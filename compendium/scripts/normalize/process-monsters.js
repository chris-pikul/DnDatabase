const {
    MakeKabob,
    MakeURL,
    MakeTitleCase,
    ExtractIDFromURL,
    MakeObj,
    MakeEnum,
} = require('./utils');

const getProficiencyBonus = cr => {
    if(cr >= 29) return 9;
    else if(cr >= 25) return 8;
    else if(cr >= 21) return 7;
    else if(cr >= 17) return 6;
    else if(cr >= 13) return 5;
    else if(cr >= 9) return 4;
    else if(cr >= 5) return 3;
    return 2;
};

const getAbilityModifier = abl => Math.floor( (abl-10) / 2 );

const translateAbility = name => {
    switch(name) {
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
    return null;
}

module.exports = data => data.map(mon => {
    const out = {
        type: 'MONSTER',
        id: MakeKabob(mon.index),
        name: MakeTitleCase(mon.name),
        url: MakeURL('monsters', MakeKabob(mon.index)),
        source: 'MM',
        description: '',

        challengeRating: parseFloat(mon.challenge_rating),

        size: MakeEnum(mon.size),
        kind: MakeEnum(mon.type),
        subKind: mon.subtype ? MakeEnum(mon.subtype) : null,
        alignment: MakeEnum(mon.alignment),

        maxHP: parseInt(mon.hit_points || 1),
        hitDice: mon.hit_dice || '1d4',
        armorClass: parseInt(mon.armor_class || 10),
        proficiencyBonus: 2,
        
        speed: {
            walk: parseInt( mon.speed.walk || 0 ),
            swim: parseInt( mon.speed.swim || 0),
            fly: parseInt( mon.speed.fly || 0),
        },

        senses: {
            passivePerception: 10,
            passiveInsight: 10,
            darkvision: parseInt(mon.senses.darkvision || 0),
            blindsight: parseInt(mon.senses.blindsight || 0),
            truesight: parseInt(mon.senses.truesight || 0),
            tremorsense: parseInt(mon.senses.tremorsense || 0),
        },

        abilityScores: {
            strength: {
                score: parseInt(mon.strength || 10),
                modifier: 0,
                savingThrow: 0,
            },
            dexterity: {
                score: parseInt(mon.dexterity || 10),
                modifier: 0,
                savingThrow: 0,
            },
            constitution: {
                score: parseInt(mon.constitution || 10),
                modifier: 0,
                savingThrow: 0,
            },
            intelligence: {
                score: parseInt(mon.intelligence || 10),
                modifier: 0,
                savingThrow: 0,
            },
            wisdom: {
                score: parseInt(mon.wisdom || 10),
                modifier: 0,
                savingThrow: 0,
            },
            charisma: {
                score: parseInt(mon.charisma || 10),
                modifier: 0,
                savingThrow: 0,
            },
        },

        proficiencies: [],

        resistances: [],
        immunities: {
            damageTypes: [],
            conditions: [],
        },
        vulnerabilities: [],

        languages: [],

        actions: [],
        legendaryActions: [],
        
        specialAbilities: [],
    };

    //Proficiency bonus
    out.proficiencyBonus = getProficiencyBonus(out.challengeRating);

    //Ability Modifiers
    out.abilityScores.strength.modifier = getAbilityModifier(out.abilityScores.strength.score);
    out.abilityScores.dexterity.modifier = getAbilityModifier(out.abilityScores.dexterity.score);
    out.abilityScores.constitution.modifier = getAbilityModifier(out.abilityScores.constitution.score);
    out.abilityScores.intelligence.modifier = getAbilityModifier(out.abilityScores.intelligence.score);
    out.abilityScores.wisdom.modifier = getAbilityModifier(out.abilityScores.wisdom.score);
    out.abilityScores.charisma.modifier = getAbilityModifier(out.abilityScores.charisma.score);

    out.abilityScores.strength.savingThrow = out.abilityScores.strength.modifier;
    out.abilityScores.dexterity.savingThrow = out.abilityScores.dexterity.modifier;
    out.abilityScores.constitution.savingThrow = out.abilityScores.constitution.modifier;
    out.abilityScores.intelligence.savingThrow = out.abilityScores.intelligence.modifier;
    out.abilityScores.wisdom.savingThrow = out.abilityScores.wisdom.modifier;
    out.abilityScores.charisma.savingThrow = out.abilityScores.charisma.modifier;

    //Proficiencies
    out.proficiencies = mon.proficiencies.map(prof => {
        if(prof.proficiency.name.startsWith('Saving Throw: ')) {
            const amnt = parseInt(prof.value || out.proficiencyBonus);
            const name = prof.proficiency.name.substr(14);

            switch(name) {
                case 'STR':
                    out.abilityScores.strength.savingThrow += amnt;
                    break;
                case 'DEX':
                    out.abilityScores.dexterity.savingThrow += amnt;
                    break;
                case 'CON':
                    out.abilityScores.constitution.savingThrow += amnt;
                    break;
                case 'INT':
                    out.abilityScores.intelligence.savingThrow += amnt;
                    break;
                case 'WIS':
                    out.abilityScores.wisdom.savingThrow += amnt;
                    break;
                case 'CHA':
                    out.abilityScores.charisma.savingThrow += amnt;
                    break;
            }

            return {
                ...translateAbility(name),
                amount: amnt,
            }
        } else if(prof.proficiency.name.startsWith('Skill: ')) {
            const amnt = parseInt(prof.value || out.proficiencyBonus);
            const name = prof.proficiency.name.substr(7);

            return {
                ...MakeObj('skills', MakeKabob(name), name),
                amount: amnt,
            };
        }
    });

    //Senses
    if(mon.senses.passive_perception)
        out.senses.passivePerception = parseInt(mon.senses.passive_perception);
    else {
        // 10 + PROF
        const prof = out.proficiencies.find(prof => prof.name === 'Perception');
        out.senses.passivePerception = 10 + (prof ? prof.amount || out.proficiencyBonus : 0);
    }
    if(mon.senses.passive_insight)
        out.senses.passiveInsight = parseInt(mon.senses.passive_insight);
    else {
        // 10 + PROF
        const prof = out.proficiencies.find(prof => prof.name === 'Insight');
        out.senses.passiveInsight = 10 + (prof ? prof.amount || out.proficiencyBonus : 0);
    }

    //Resistances
    out.resistances = mon.damage_resistances.map(dmg => {
        if(dmg.startsWith('bludgeoning')) {
            return [
                MakeObj('damage-types', 'bludgeoning', 'Bludgeoning'),
                MakeObj('damage-types', 'piercing', 'Piercing'),
                MakeObj('damage-types', 'slashing', 'Slashing'),
            ];
        }
        
        return MakeObj('damage-types', MakeKabob(dmg), MakeTitleCase(dmg));
    }).flat();

    //Immunities
    out.immunities.damageTypes = mon.damage_immunities.map(dmg => {
        if(dmg.startsWith('bludgeoning')) {
            return [
                MakeObj('damage-types', 'bludgeoning', 'Bludgeoning'),
                MakeObj('damage-types', 'piercing', 'Piercing'),
                MakeObj('damage-types', 'slashing', 'Slashing'),
            ];
        }
        
        return MakeObj('damage-types', MakeKabob(dmg), MakeTitleCase(dmg));
    }).flat();

    out.immunities.conditions = mon.condition_immunities.map(con => {
        return MakeObj('conditions', ExtractIDFromURL(con.url), con.name);
    });

    //Vulnerabilities
    out.vulnerabilities = mon.damage_vulnerabilities.map(dmg => {
        if(dmg.startsWith('bludgeoning')) {
            return [
                MakeObj('damage-types', 'bludgeoning', 'Bludgeoning'),
                MakeObj('damage-types', 'piercing', 'Piercing'),
                MakeObj('damage-types', 'slashing', 'Slashing'),
            ];
        }
        
        return MakeObj('damage-types', MakeKabob(dmg), MakeTitleCase(dmg));
    });

    //Languages
    out.languages = mon.languages.split(', ')
        .map(lng => lng.trim())
        .map(MakeTitleCase);

    //Actions
    if(mon.actions && Array.isArray(mon.actions)) {
        out.actions = mon.actions.map(act => {
            const outAct = {
                name: MakeTitleCase(act.name || ''),
                description: (act.desc || '').trim(),
                attackBonus: parseInt(act.attack_bonus || 0),
                damage: null,
                saveDC: null,
                usage: null,
                options: null,
            };

            //Action with damage (or optional damages)
            if(act.damage && Array.isArray(act.damage)) {
                outAct.damage = act.damage.map(dmg => {
                    const outDmg = {
                        type: null,
                        amount: null,
                        options: null,
                    };

                    if(dmg.damage_type)
                        outDmg.type = MakeObj('damage-types', ExtractIDFromURL(dmg.damage_type.url), dmg.damage_type.name);
                    
                    if(dmg.damage_dice)
                        outDmg.amount = dmg.damage_dice.trim();

                    if(dmg.choose && dmg.from) {
                        outDmg.options = {
                            amount: parseInt(dmg.choose || 1),
                            choices: dmg.from.map(frm => ({
                                type: MakeObj('damage-types', ExtractIDFromURL(frm.damage_type.url), frm.damage_type.name),
                                amount: frm.damage_dice.trim(),
                            })),
                        }
                    }

                    return outDmg;
                });
            }

            //Save DC
            if(act.dc) {
                outAct.saveDC = {
                    ability: translateAbility(act.dc.dc_type.name),
                    value: parseInt(act.dc.dc_value || 10),
                    onSuccess: MakeEnum(act.dc.success_type),
                };
            }

            //Uses
            if(act.usage) {
                outAct.usage = {
                    type: MakeEnum(act.usage.type),
                    amount: parseInt(act.usage.times || 0),
                    dice: act.usage.dice || null,
                    minRoll: parseInt(act.usage.min_value || 0),
                };
            }

            //Options
            if(act.attack_options) {
                outAct.options = {
                    amount: parseInt(act.attack_options.choose || 1),
                    choices: act.attack_options.from.map(frm => {
                        const chc = {
                            name: MakeTitleCase(frm.name),
                            damage: null,
                            saveDC: null,
                        };

                        if(frm.damage && Array.isArray(frm.damage)) {
                            chc.damage = frm.damage.map(dmg => ({
                                type: MakeObj('damage-types', ExtractIDFromURL(dmg.damage_type.url), dmg.damage_type.name),
                                amount: dmg.damage_dice,
                            }));
                        }

                        if(frm.dc) {
                            chc.saveDC = {
                                ability: translateAbility(frm.dc.dc_type.name),
                                value: parseInt(frm.dc.dc_value || 10),
                                onSuccess: MakeEnum(frm.dc.success_type),
                            };
                        }

                        return chc;
                    }),
                };
            }

            return outAct;
        }).filter(act => !!act);
    }

    //Legendary Actions
    if(mon.legendary_actions && Array.isArray(mon.legendary_actions)) {
        out.legendaryActions = {
            amount: 3,
            options: mon.legendary_actions.map(act => {
                const outAct = {
                    name: MakeTitleCase(act.name),
                    description: (act.desc || '').trim(),
                    cost: 1,
                    damage: null,
                    saveDC: null,
                };

                //Cost
                const costTest = act.name.toLowerCase().indexOf('costs');
                if(costTest && costTest != -1) {
                    outAct.name = outAct.name.substr(0, costTest - 1).trim();

                    const rem = act.name.substr(costTest);
                    const match = rem.match(/(\d+)/g);
                    if(match && match.length === 1)
                        outAct.cost = parseInt(match[0]);
                }

                //Action with damage (or optional damages)
                if(act.damage && Array.isArray(act.damage)) {
                    outAct.damage = act.damage.map(dmg => {
                        const outDmg = {
                            type: null,
                            amount: null,
                            options: null,
                        };

                        if(dmg.damage_type)
                            outDmg.type = MakeObj('damage-types', ExtractIDFromURL(dmg.damage_type.url), dmg.damage_type.name);
                        
                        if(dmg.damage_dice)
                            outDmg.amount = dmg.damage_dice.trim();

                        if(dmg.choose && dmg.from) {
                            outDmg.options = {
                                amount: parseInt(dmg.choose || 1),
                                choices: dmg.from.map(frm => ({
                                    type: MakeObj('damage-types', ExtractIDFromURL(frm.damage_type.url), frm.damage_type.name),
                                    amount: frm.damage_dice.trim(),
                                })),
                            }
                        }

                        return outDmg;
                    });
                }

                //Save DC
                if(act.dc) {
                    outAct.saveDC = {
                        ability: translateAbility(act.dc.dc_type.name),
                        value: parseInt(act.dc.dc_value || 10),
                        onSuccess: MakeEnum(act.dc.success_type),
                    };
                }

                return outAct;
            }),
        };
    }

    //Special Abilities
    if(mon.special_abilities && Array.isArray(mon.special_abilities)) {
        out.specialAbilities = mon.special_abilities.map(abl => {
            const outAbl = {
                name: MakeTitleCase(abl.name),
                description: (abl.desc || '').trim(),
                usage: null,
                spellcasting: null,
            };

            if(abl.usage && abl.usage.type) {
                outAbl.usage = {
                    type: MakeEnum(abl.usage.type),
                    amount: parseInt(abl.times || 1),
                };
            }

            if(abl.spellcasting) {
                outAbl.spellcasting = {
                    level: parseInt(abl.spellcasting.level || 1),
                    ability: translateAbility(abl.spellcasting.ability.name),
                    saveDC: parseInt(abl.spellcasting.dc || 10),
                    attackBonus: parseInt(abl.spellcasting.modifier || 0),
                    slots: [0,0,0,0,0,0,0,0,0],
                    spells: [],
                };

                if(abl.spellcasting.slots) {
                    Object.keys(abl.spellcasting.slots).forEach(slt => {
                        outAbl.spellcasting.slots[ parseInt(slt)-1 ] = parseInt(abl.spellcasting.slots[slt] || 0);
                    });
                }

                outAbl.spellcasting.spells = abl.spellcasting.spells.map(spl => ({
                    ...MakeObj('spells', ExtractIDFromURL(spl.url), spl.name),
                    level: parseInt(spl.level || 0),
                }));
            }

            return outAbl;
        });
    }

    return out;
});