const Tokenize = input => input.split(/[^A-Za-z0-9]/g)
  .filter(tkn => (tkn && tkn.length > 0));

const FilterLowercase = tkns => tkns.map(tkn => tkn.toLowerCase());

const FilterDedup = tkns => tkns.map((tkn, ind, arr) => {
  const otherInd = arr.findIndex(elm => (elm == tkn));
  if(otherInd != ind) return null;
  return tkn;
}).filter(tkn => (tkn && tkn.length > 0));


const _stopWords = ['a', 'an', 'and', 'be', 'but', 'for', 'from', 'have', 'i', 'in', 'of', 'that', 'the', 'to'];
const FilterStopWords = tkns => tkns.filter(tkn => !_stopWords.includes(tkn));

const FilterWords = tkns => tkns.filter(tkn => tkn.match(/^[A-Za-z]+$/));

function TokenizeAndFilter(input, ...filters) {
  let tokens = Tokenize(input);
  
  for(const filter of filters) {
    if(typeof filter === 'function')
      tokens = filter(tokens);
  }
  
  return tokens;
}

module.exports = {
    TokenizeAndFilter,
    Tokenize,
    FilterLowercase,
    FilterDedup,
    FilterStopWords,
    FilterWords,
};