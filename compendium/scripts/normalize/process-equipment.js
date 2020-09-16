const Path = require('path');
const FS = require('fs');

const { 
    MakeKabob, 
    MakeEnum, 
    MakeURL,
    MakeObj,
    MakeTitleCase,
    ExtractIDFromURL,
} = require('./utils');

module.exports = data => {
    const weapons = [];
    const armor = [];
    const tools = [];
    const vehicle = [];
    const misc = [];

    var packs = [];

    data.forEach(eqp => {
        const out = {
            id: MakeKabob(eqp.index),
            name: eqp.name.trim(),
            url: '', //Changed below
            source: 'PHB',
            description: '',
            category: 'MISC',
            subCategory: null,
            cost: '',
            weight: 0,
            weaponDetails: null,
            armorDetails: null,
            vehicleDetails: null,
        };

        //Sources don't have this, but I want a reminder to do one
        if(eqp.desc)
            out.description = eqp.desc.join('\\n');

        //Value or Cost
        if(eqp.cost && eqp.cost.quantity && eqp.cost.unit)
            out.cost = ''+parseInt(eqp.cost.quantity)+(eqp.cost.unit.toUpperCase());

        //Weight?
        if(eqp.weight)
            out.weight = parseInt(eqp.weight);

        //Multiple types of sub-categories. Just normalize them I suppose
        if(eqp.weapon_category) {
            out.category = {
                id: 'weapon',
                name: 'Weapon',
                url: '/equipment/weapon/',
            };
            out.url = MakeURL('equipment', 'weapon', out.id);

            const wep = {
                type: MakeEnum(eqp.weapon_category),
                properties: [],
                range: {
                    type: 'MELEE',
                    normal: 0,
                    long: 0,
                },
                damage: {
                    amount: '1d4',
                    twoHanded: null,
                    type: null,
                },
                throw: null,
                extra: null,
            };

            if(eqp.properties) {
                wep.properties = eqp.properties.map(prop => 
                    MakeObj('weapon-properties', ExtractIDFromURL(prop.url), prop.name));
            }

            if(eqp.weapon_range)
                wep.range.type = MakeEnum(eqp.weapon_range);

            if(eqp.range) {
                wep.range.normal = parseInt(eqp.range.normal);
                wep.range.long = parseInt(eqp.range.long || 0);
            }

            if(eqp.damage) {
                wep.damage.amount = eqp.damage.damage_dice;
                wep.damage.type = MakeObj('damage-types', ExtractIDFromURL(eqp.damage.damage_type.url), eqp.damage.damage_type.name);

                if(eqp['2h_damage'])
                    wep.damage.twoHanded = eqp['2h_damage'].damage_dice;
            }

            if(eqp.throw_range) {
                wep.throw = {
                    normal: parseInt(eqp.throw_range.normal || 0),
                    long: parseInt(eqp.throw_range.long || 0),
                }
            }

            if(eqp.special)
                wep.extra = eqp.special.join('\\n');

            out.weaponDetails = wep;

            weapons.push(out);
        } else if(eqp.armor_category) {
            out.category = {
                id: 'armor',
                name: 'Armor',
                url: '/equipment/armor/',
            };
            out.url = MakeURL('equipment', 'armor', out.id);

            const arm = {
                type: MakeEnum(eqp.armor_category),
                baseAC: 12,
                addDexterity: false,
                maxDexterityBonus: 0,
                strength: 0,
                stealthDisadvantage: false,
            };

            if(eqp.armor_class) {
                arm.baseAC = parseInt(eqp.armor_class.base || 12);
                arm.addDexterity = !!eqp.armor_class.dex_bonus;
                arm.maxDexterityBonus = parseInt(eqp.armor_class.max_bonus || 0);
            }

            if(eqp.str_minimum)
                arm.strength = parseInt(eqp.str_minimum || 0);

            if(eqp.stealth_disadvantage)
                arm.stealthDisadvantage = !!eqp.stealth_disadvantage;

            out.armorDetails = arm;

            armor.push(out);
        } else if(eqp.gear_category) {
            if(eqp.contents) {
                const pack = {
                    id: out.id,
                    name: MakeTitleCase(eqp.name),
                    url: MakeURL('equipment-packs', eqp.index),
                    cost: out.cost,
                    contents: eqp.contents.map(ent => ({
                        id: ExtractIDFromURL(ent.item_url),
                        name: '',
                        url: MakeURL('equipment', 'general', ExtractIDFromURL(ent.item_url)),
                        quantity: parseInt(ent.quantity || 1),
                    })),
                };

                packs.push(pack);
            } else {
                out.category = {
                    id: 'general',
                    name: 'general',
                    url: '/equipment/general/',
                };
                out.url = MakeURL('equipment', 'general', out.id);

                out.subCategory = MakeEnum(eqp.gear_category);

                misc.push(out);
            }
        } else if(eqp.tool_category) {
            out.category = {
                id: 'tools',
                name: 'Tools',
                url: '/equipment/tools/',
            };
            out.url = MakeURL('equipment', 'tools', out.id);

            out.subCategory = MakeEnum(eqp.tool_category);

            tools.push(out);
        } else if(eqp.vehicle_category) {
            out.type = 'VEHICLE';
            if(eqp.vehicle_category.indexOf('Mounts') !== -1) {
                out.subType = 'MOUNT';

                out.vehicleDetails = {
                    landSpeed: `${parseInt(eqp.speed.quantity)} ${eqp.speed.unit}`,
                    waterSpeed: 0,
                    airSpeed: 0,
                    capacity: eqp.capacity || 0,
                };
            } else if(eqp.vehicle_category.indexOf('Tack') !== -1) {
                out.subType = 'SUPPLIES';
            } else if(eqp.vehicle_category.indexOf('Waterborne') !== -1) {
                out.subType = 'NAVAL';

                out.vehicleDetails = {
                    landSpeed: 0,
                    waterSpeed: `${parseInt(eqp.speed.quantity)} ${eqp.speed.unit}`,
                    airSpeed: 0,
                    capacity: 0,
                };
            }
        }
    });

    var outPath;

    //Write out the weapons
    outPath = Path.resolve(__dirname, '..', 'weapons.json');
    console.log(`Writing weapon data to "${outPath}"`);
    FS.writeFileSync(outPath, JSON.stringify(weapons, null, 2), 'utf8');

    //Write out the armor
    outPath = Path.resolve(__dirname, '..', 'armor.json');
    console.log(`Writing armor data to "${outPath}"`);
    FS.writeFileSync(outPath, JSON.stringify(armor, null, 2), 'utf8');

    //Write out the general
    outPath = Path.resolve(__dirname, '..', 'general-equipment.json');
    console.log(`Writing general data to "${outPath}"`);
    FS.writeFileSync(outPath, JSON.stringify(misc, null, 2), 'utf8');

    //Write out the tools
    outPath = Path.resolve(__dirname, '..', 'tools.json');
    console.log(`Writing tools data to "${outPath}"`);
    FS.writeFileSync(outPath, JSON.stringify(tools, null, 2), 'utf8');


    //Figure out the packs
    packs = packs.map(pack => ({
        ...pack,
        contents: pack.contents.map(ent => {
            const item = misc.find(chk => ent.url == chk.url);
            if(item) {
                ent.name = item.name;
            } else {
                console.warn('Unable to find name for item', ent.url);
            }
            return ent;
        }),
    }));
    outPath = Path.resolve(__dirname, '..', 'packs.json');
    console.log(`Writing packs data to "${outPath}"`);
    FS.writeFileSync(outPath, JSON.stringify(packs, null, 2), 'utf8');


    return null;
};