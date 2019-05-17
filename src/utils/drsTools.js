const DRS = ['institute', 'model', 'experiment', 'frequency', 'realm', 'frequency', 'ensemble', 'variable', 'version'];

const checkIfAllFiltersFound = (filters, newPath) => {
  const keys = Object.keys(filters);
  for (let k = 0;k < keys.length; k++) {
    const filterKey = keys[k];
    if (newPath[filterKey] !== filters[filterKey]) {
      return false;
    }
  };
  return true;
};

const checkIfAllQueriesFound = (queries, newPath) => {
  for (let q = 0;q < queries.length; q++) {
    if (!newPath[queries[q]]) return false;
  }
  return true;
};

let loopDrs = (data, filters = {}, queries = {}, results = [], drsDepth = 0, path = [], filtersValid = false) => {
  if (filtersValid == true) return;
  if (data.contents) {
    for (var i = 0; i < data.contents.length; i++) {
      const item = data.contents[i];
      const newPath = { ... path };
      const drsName = DRS[drsDepth];
      newPath[drsName] = item.name;

      /* Lets check if we found all filters */
      if (checkIfAllFiltersFound(filters, newPath) === true) {
        if (checkIfAllQueriesFound(queries, newPath) === true) {
          // console.log('p', newPath);
          filtersValid = true;
          for (let q = 0; q < queries.length; q++) {
            if (results[queries[q]].indexOf(newPath[queries[q]]) === -1) {
              results[queries[q]].push(newPath[queries[q]]);
            }
          }
        }
      }
      loopDrs(item, filters, queries, results, drsDepth + 1, newPath, filtersValid);
    };
  }
};

export const findDrsItems = (data, filters = {}, queries = {}) => {
  const results = [];
  for (let q = 0; q < queries.length; q++) {
    if (!results[queries[q]]) results[queries[q]] = [];
  }
  loopDrs(data,filters, queries, results);
  return results;
};
