const Path = require('path');
const FS = require('fs');

const {
    MakeTitleCase
} = require('../normalize/utils');

async function* walk(dir) {
    for await(const d of await FS.promises.opendir(dir)) {
        const entry = Path.join(dir, d.name);
        if(d.isDirectory()) yield* walk(entry);
        else if(d.isFile()) yield entry;
    }
}

async function processFile(file) {
    return new Promise((resolve, reject) => {
        console.log(`Reading file "${file}"`);
        FS.readFile(file, 'utf8', (err, data) => {
            if(err) return reject(err);

            data = JSON.parse(data);
            if(!data.type) return reject(new Error(`No type found on object ${file}`));

            const out = {
                type: data.type,
                url: data.url,
                name: data.name,
                description: data.description,
                tags: [],
                meta: [],
            };

            switch(data.type) {
                case 'ABILITY_SCORE':
                    out.tags.push( data.abreviation );
                    data.skills.forEach(skl => out.tags.push(skl.name) );
                    break;
                case 'CLASS':
                    if(data.spellcasting && data.spellcasting !== null) {
                        out.tags.push('spellcaster');
                    }

                    data.levels.forEach(lvl => {
                        lvl.features.forEach(ft => out.tags.push(ft.name) );
                        lvl.featureChoices.forEach(ft => out.tags.push(ft.name) );
                    });

                    break;
                case 'CONDITION':
                    out.meta = data.effects;

                    break;
                case 'ITEM':
                    out.tags.push( data.category.name );

                    if(data.weaponDetails) {
                        out.tags.push( MakeTitleCase(data.weaponDetails.type) );
                        
                        if(data.weaponDetails.range) {
                            out.tags.push( MakeTitleCase(data.weaponDetails.range.type) );
                        }

                        data.weaponDetails.properties.forEach(prop => out.tags.push(prop.name) );

                        if(data.weaponDetails.damage && data.weaponDetails.damage.type) {
                            out.tags.push(data.weaponDetails.damage.type.name);
                        }
                    } else if(data.armorDetails) {
                        out.tags.push( MakeTitleCase(data.armorDetails.type) );
                    }

                    break;
                case 'LANGUAGE':
                    out.tags.push( data.script );

                    data.speakers.forEach(spk => out.tags.push(spk) );
                    break;
                case 'MONSTER':
                    out.tags.push( MakeTitleCase(data.size) );
                    out.tags.push( MakeTitleCase(data.kind) );
                    if(data.subKind) out.tags.push( MakeTitleCase(data.subKind) );
                    out.tags.push( MakeTitleCase(data.alignment.replace('_', ' ')));

                    if(data.challengeRating < 1) {
                        if(data.challengeRating == 0)
                            out.tags.push( 'CR0');
                        else if(data.challengeRating == 0.125)
                            out.tags.push( 'CR1/8');
                        else if(data.challengeRating == 0.25)
                            out.tags.push( 'CR1/4');
                        else if(data.challengeRating == 0.5)
                            out.tags.push( 'CR1/2' );
                    } else {
                        out.tags.push( `CR${data.challengeRating}`);
                    }

                    if(data.speed.swim > 0)
                        out.tags.push('Swimming');
                    if(data.speed.fly > 0)
                        out.tags.push('Flying');

                    if(data.senses.darkvision > 0)
                        out.tags.push('Darkvision');
                    if(data.senses.blindsight > 0)
                        out.tags.push('Blindsight');
                    if(data.senses.truesight > 0)
                        out.tags.push('Truesight');
                    if(data.senses.tremorsense > 0)
                        out.tags.push('Tremorsense');

                    data.proficiencies.forEach(prf => out.meta.push(prf.name));
                    data.languages.forEach(lng => out.meta.push(lng));
                    data.actions.forEach(act => out.meta.push(act.name) );
                    data.specialAbilities.forEach(abl => out.meta.push( abl.name) );
                    
                    break;
                case 'PROFICIENCY':
                    out.tags.push( MakeTitleCase(data.category) );

                    data.races.forEach(rc => out.tags.push(rc.name) );
                    data.classes.forEach(cls => out.tags.push(cls.name) );
                    break;

                case 'RACE':
                    out.tags.push( MakeTitleCase(data.size.type) );

                    data.proficiencies.starting.forEach(prf => out.meta.push(prf.name) );
                    data.languages.starting.forEach(lng => out.meta.push(lng.name));
                    data.traits.starting.forEach(trt => out.meta.push(trt.name));
                    data.subRaces.forEach(rc => out.meta.push(rc.name));
                
                case 'SKILL':
                    if(data.ability)
                        out.tags.push( data.ability.name );

                    break;

                case 'SPELL':
                    out.meta.push( MakeTitleCase(data.rarity) );
                    out.meta.push( MakeTitleCase(data.range.type) );
                    out.meta.push( data.castingTime );
                    out.meta.push( data.duration );

                    if(data.ritual)
                        out.tags.push( 'Ritual' );
                    if(data.concentration)
                        out.tags.push( 'Concentration' );
                    if(data.healing)
                        out.tags.push( 'Healing' );
                    if(data.areaOfEffect)
                        out.tags.push( 'AOE' );

                    if(data.damage && data.damage.type)
                        out.tags.push( data.damage.type.name );
                    
                    out.tags.push( data.school.name );

                    data.classes.forEach(cls => out.tags.push(cls.name) );

                    break;
                case 'TRAIT':
                    data.races.forEach(rc => out.tags.push(rc.name));
                    data.subRaces.forEach(rc => out.tags.push(rc.name));

                    break;
            }

            resolve( out );
        });
    });
}

async function buildSummaries() {
    let files = [];

    const dir = Path.resolve('..', '5e-SRD');
    console.log(`Reading directory "${dir}"`);
    for await(const file of walk(dir + Path.sep)) {
        if(!file.endsWith('.json'))
            continue;

        console.log(`Adding file "${file}"`);
        files.push( processFile(file) );
    }

    const summaries = (await Promise.all(files))
        .flat(2)
        .filter(res => {
            if(res instanceof Error || res.message || res.error) {
                console.error(`Error encountered: `, res);
                return false;
            }
            return !!res;
        });
    summaries.sort( (a,b) => (a.name > b.name ? 1 : (a.name < b.name ? -1 : 0)) );

    const output = Path.resolve('..', 'indexes', 'summaries.json');
    await FS.promises.writeFile(output, JSON.stringify(summaries, null, 2), 'utf8');

    console.log('Completed summary building');
}

module.exports = buildSummaries;
