/**
 * For a set of linear, incremental labels, extend them by n elements
 * @param {Array} labels 
 * @param {number} n - number of new elements to add
 * @returns {Array}
 */
export function extendLabels(labels, n) {
    // For now only supports incremental ranges
    const max = Math.max(...labels);
   
    return labels.concat([...Array(n).keys()].map((_, i) => max+i+1))
}