// const parser = require('postcss-selector-parser');
module.exports = (opts = { }) => {
  if (!opts.namespaceClass) {
    throw new Error('namespaceClass is required.')
  }
  const nsclass = opts.namespaceClass[0] === '.' ? opts.namespaceClass : '.' + opts.namespaceClass
  // Work with options here
  return {
    postcssPlugin: 'postcss-plugin-classns',
    Root (root, postcss) { // eslint-disable-line
      root.walkRules((child) => {
        if (child.parent && child.parent.type === 'atrule' && child.parent.name === 'keyframes') return child
        if (child.selector === ':root') return child
        if (child.selectors) {
          child.selectors = child.selectors.map(selector => {
            return nsclass + ' ' + selector
            // return parser(transformSelector).processSync(selector);
          })
        }
        return child
      })
      // Transform CSS AST here
    }

    /*
    Declaration (decl, postcss) {
      // The faster way to find Declaration node
    }
    */

    /*
    Declaration: {
      color: (decl, postcss) {
        // The fastest way find Declaration node if you know property name
      }
    }
    */
  }
}
module.exports.postcss = true
