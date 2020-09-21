const { MakeKabob, MakeURL } = require('./utils');

module.exports = data => data.map(dmg => ({
    type: 'DAMAGE_TYPE',
    id: MakeKabob(dmg.index),
    name: dmg.name,
    url: MakeURL('damage-types', dmg.index),
    source: 'PHB',
    description: dmg.desc.join('\\n'),
}));