const MakeKabob = input => input.toLowerCase().replace(/[^A-Za-z0-9]/g, '-');

const MakeEnum = input => input.toUpperCase().replace(/[\s\-]/g, '_').replace(/[^A-Za-z0-9\_]/g, '').trim();

const MakeURL = (base, ...paths) => '/' + (
    [
        base.split('/'),
        paths.map( path => path.split('/')),
    ].flat(2)
        .map(part => MakeKabob(part))
        .join('/')
);

const MakeCamelCase = input => input.split(/[^A-Za-z0-9]/g)
    .filter(ent => ent.length > 0)
    .map((ent, ind) => 
        ind == 0 ? ent.toLowerCase() :
            ent.charAt(0).toUpperCase() + ent.substr(1).toLowerCase()
    )
    .join('');

const MakeTitleCase = input => input.split(' ')
    .map(ent => ent.charAt(0).toUpperCase() + ent.substr(1).toLowerCase() )
    .join(' ');

const MakeObj = (urlBase, id, name) => ({
    //id: MakeKabob(id),
    name: MakeTitleCase(name || id || ''),
    url: MakeURL(urlBase, id),
});

const MakeNum = input => (parseInt(input || 0));

const ExtractIDFromURL = url => {
    const parts = url.split('/');
    return parts[parts.length - 1];
};

const regexpMoney = /(\d+(?:,\d+)*(?:cp|sp|ep|gp|pp))/gmi;
const ExtractMoney = data => {
    const matches = data.matchAll(regexpMoney);
    const results = [];
  
    for(const match of matches) {
      const val = match[0];
      const numValue = parseInt(val.replace(/[^\d]*/gi, ''));
      let denom = 'GP';
      if(val.charAt(val.length - 1) == 'p')
        denom = val.substr(val.length - 2).toUpperCase();
      results.push([ numValue, denom ]);
    }
  
    return results;
}

/**
 * Converts an array such as [10, 'PP'] into it's gold equivelent (100) number.
 * @param {Array} moneyArr Array of number, followed by denomination
 * @returns {Number} floating point number of total gold represented
 */
const ConvertToGold = moneyArr => {
    let mult = 1;
    switch(moneyArr[1].trim().toUpperCase()) {
        case 'CP':
          mult = 0.01;
          break;
        case 'SP':
          mult = 0.1;
          break;
        case 'EP':
          mult = 0.5;
          break;
        case 'GP':
          mult = 1;
          break;
        case 'PP':
          mult = 10;
          break;
        default:
          mult = 0;
    }
    
    return moneyArr[0] * mult;
  };
  
const ReduceToGold = arrays => arrays.reduce((acc, cur) => (acc + ConvertToGold(cur)), 0);

/**
 * Condences and converts an array of monetary arrays in the form of:
 * [ [100, 'GP'], ... ]
 * Into an array of each denomination. The indexes returned are:
 * [ CP, SP, GP, (PP) ]
 * With platinum being optional based on the provided parameter switch
 * @param {Array} arrays Array of 2-dim arrays featuring the ammount and denomination.
 * @param {boolean} platinum if true, condences up to platinum as well.
 */
  const ReduceMoney = (arrays, platinum=false) => {
    let goldTotal = ReduceToGold(arrays);
    const result = [0, 0, 0];
    
    if(platinum) {
      if(goldTotal > 10) {
        result[3] = Math.floor(goldTotal / 10);
        goldTotal -= result[3] * 10;
      } else
        result[3] = 0;
    }
    
    //Extract GP
    result[2] = Math.floor(goldTotal);
    goldTotal -= result[2];
    
    //Extract SP
    result[1] = Math.floor(goldTotal * 10);
    goldTotal -= result[1] * 0.1;
    
    //Extract CP
    result[0] = Math.floor(goldTotal * 100);
    goldTotal -= result[0] * 0.01;
    
    if(goldTotal > 0.001)
      console.warn(`Discrepency in calculation: ${goldTotal}GP remaining.`);
    
    return result;
  }

module.exports = {
    MakeKabob,
    MakeEnum,
    MakeURL,
    MakeCamelCase,
    MakeTitleCase,
    MakeObj,
    MakeNum,
    ExtractIDFromURL,

    ExtractMoney,
    ConvertToGold,
    ReduceToGold,
    ReduceMoney,
};