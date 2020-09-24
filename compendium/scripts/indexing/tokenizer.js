const Stemmer = require('stemmer');

const Tokenize = input => input.replace('\\n', ' ').split(/[^A-Za-z0-9]/g)
  .filter(tkn => (tkn && tkn.length > 1));

const FilterLowercase = tkns => tkns.map(tkn => tkn.toLowerCase());

const FilterDedup = tkns => tkns.map((tkn, ind, arr) => {
  const otherInd = arr.findIndex(elm => (elm == tkn));
  if(otherInd != ind) return null;
  return tkn;
}).filter(tkn => (tkn && tkn.length > 1));

const _stopWords = ['a', 'an', 'and', 'as', 'be', 'but', 'for', 'from', 'have', 'i', 'in', 'is', 'of', 'that', 'the', 'to'];
const FilterStopWords = tkns => tkns.filter(tkn => !_stopWords.includes(tkn));

const FilterWords = tkns => tkns.filter(tkn => tkn.match(/^[A-Za-z]+$/));

const FilterStemmer = tkns => tkns.map( Stemmer );

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
    FilterStemmer,
};