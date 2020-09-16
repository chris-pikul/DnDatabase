const { 
    MakeKabob, 
    MakeEnum, 
    MakeURL, 
    MakeObj,
    ExtractIDFromURL,

    ExtractMoney,
    ReduceToGold,
} = require('./utils');

module.exports = data => data.map(spl => {
    const out = {
        id: MakeKabob(spl.index),
        name: spl.name,
        url: MakeURL('spells', spl.index),
        source: 'PHB',
        level: spl.level ? parseInt(spl.level) : 0,
    };

    if(spl.desc && Array.isArray(spl.desc))
        out.description = spl.desc.join('\\n');
    
    if(spl.higher_level && Array.isArray(spl.higher_level))
        out.higherLevels = spl.higher_level.join('\\n');
    
    //Parse the range
    if(spl.range && typeof spl.range === 'string') {
        const rng = spl.range.toLowerCase().trim();
        if(rng == 'touch' || rng == 'self') {
            out.range = {
                type: MakeEnum(rng),
                distance: 0,
            };
        } else {
            const dist = parseInt(rng.substr(0, rng.indexOf(' ')));
            out.range = {
                type: 'RANGED',
                distance: dist,
            }
        }
    } else {
        out.range = {
            type: 'RANGED',
            distance: 30,
        }
    }

    //Convert components
    let componentCost = 0;
    if(spl.components && Array.isArray(spl.components)) {
        out.components = {
            verbal: !!(spl.components.includes('V')),
            semantic: !!(spl.components.includes('S')),
            material: !!(spl.components.includes('M')),
            cost: spl.material || null,
            goldValue: 0,
        };

        if(out.components.cost) {
            const money = ExtractMoney(out.components.cost);
            out.components.goldValue = Math.floor(ReduceToGold(money));
            componentCost = out.components.goldValue * 2;
        }
    } else {
        out.components = {
            verbal: true,
            semantic: true,
            material: false,
            cost: null,
        };
    }

    out.castingTime = spl.casting_time.trim() || '1 action';
    out.duration = spl.duration.trim() || 'Instantaneous';
    
    out.ritual = !!(spl.ritual);
    out.concentration = !!(spl.concentration);

    //Parse damage
    if(spl.damage) {
        const dmg = {
            type: null,
            slotLevels: null,
            characterLevels: null,
        };

        if(spl.damage.damage_type && spl.damage.damage_type.name) {
            dmg.type = MakeObj('damage-types', ExtractIDFromURL(spl.damage.damage_type.url), spl.damage.damage_type.name);
        }

        if(spl.damage.damage_at_slot_level && typeof spl.damage.damage_at_slot_level === 'object') {
            dmg.slotLevels = ['','','','','','','','','',''];
            Object.keys(spl.damage.damage_at_slot_level).forEach(slt => {
                const slot = parseInt(slt);
                dmg.slotLevels[slot] = spl.damage.damage_at_slot_level[slt];
            });
        }

        if(spl.damage.damage_at_character_level && typeof spl.damage.damage_at_character_level === 'object') {
            dmg.characterLevels = spl.damage.damage_at_character_level;
        }

        out.damage = dmg;
    } else {
        out.damage = null;
    }

    //Spell save DC
    if(spl.dc && spl.dc.dc_type) {
        const save = {
            type: spl.dc.dc_type ? (spl.dc.dc_type.name.toUpperCase().trim()) : null,
            onSuccess: null,
            onFailure: null,
            extra: null,
        };

        if(spl.dc.dc_success && typeof spl.dc.dc_success === 'string') {
            if(spl.dc.dc_success == 'none') {
                save.onSuccess = null;
            } else {
                save.onSuccess = spl.dc.dc_success.trim();
            }
        }

        if(spl.dc.desc) {
            if(spl.dc.desc.indexOf('failure') !== -1 || spl.dc.desc.indexOf('failed') !== -1) {
                save.onFailure = spl.dc.desc.trim();
            } else {
                save.extra = spl.dc.desc.trim();
            }
        }

        out.save = save;
    } else {
        out.save = null;
    }

    //Parse healing
    if(spl.heal_at_slot_level && !Array.isArray(spl.heal_at_slot_level)) {
        out.healing = spl.heal_at_slot_level;
    } else {
        out.healing = null;
    }

    //Area of effect
    if(spl.area_of_effect && spl.area_of_effect.type) {
        out.areaOfEffect = {
            shape: MakeEnum(spl.area_of_effect.type),
            size: parseInt(spl.area_of_effect.size),
        };
    } else {
        out.areaOfEffect = null;
    }

    //School
    if(spl.school && spl.school.name) {
        out.school = MakeObj('magic-schools', ExtractIDFromURL(spl.school.url), spl.school.name);
    } else {
        out.school = null;
    }

    //Classlists
    if(spl.classes && Array.isArray(spl.classes)) {
        out.classes = spl.classes.map(cls => MakeObj('classes', ExtractIDFromURL(cls.url), cls.name));
    } else {
        out.classes = [];
    }

    //Scroll data
    switch(out.level) {
        case 0:
            out.scroll = {
                rarity: 'COMMON',
                value: 50 + componentCost,
                saveDC: 13,
                attackBonus: 5,
            };
            break;
        case 1:
            out.scroll = {
                rarity: 'COMMON',
                value: 100 + componentCost,
                saveDC: 13,
                attackBonus: 5,
            };
            break;
        case 2:
            out.scroll = {
                rarity: 'UNCOMMON',
                value: 250 + componentCost,
                saveDC: 13,
                attackBonus: 5,
            };
            break;
        case 3:
            out.scroll = {
                rarity: 'UNCOMMON',
                value: 500 + componentCost,
                saveDC: 15,
                attackBonus: 7,
            };
            break;
        case 4:
            out.scroll = {
                rarity: 'RARE',
                value: 2500 + componentCost,
                saveDC: 15,
                attackBonus: 7,
            };
            break;
        case 5:
            out.scroll = {
                rarity: 'RARE',
                value: 5000 + componentCost,
                saveDC: 17,
                attackBonus: 9,
            };
            break;
        case 6:
            out.scroll = {
                rarity: 'VERY_RARE',
                value: 10000 + componentCost,
                saveDC: 17,
                attackBonus: 9,
            };
            break;
        case 7:
            out.scroll = {
                rarity: 'VERY_RARE',
                value: 25000 + componentCost,
                saveDC: 18,
                attackBonus: 10,
            };
            break;
        case 8:
            out.scroll = {
                rarity: 'VERY_RARE',
                value: 50000 + componentCost,
                saveDC: 18,
                attackBonus: 10,
            };
            break;
        case 9:
            out.scroll = {
                rarity: 'LEGENDARY',
                value: 100000 + componentCost,
                saveDC: 19,
                attackBonus: 11,
            };
            break;
    }

    return out;
});