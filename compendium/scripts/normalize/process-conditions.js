const { MakeKabob, MakeURL } = require('./utils');

module.exports = data => data.map(con => {
    const id = MakeKabob(con.index);
    const out = {
        type: 'CONDITION',
        id,
        name: con.name,
        url: MakeURL('conditions', id),
        source: 'PHB',
        description: '',
    };

    out.effects = con.desc.map(efx => {
        if(efx.charAt(0) === '-')
            return efx.substr(2);
        return efx;
    });

    return out;
});