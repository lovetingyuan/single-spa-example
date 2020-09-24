// const parser = require('postcss-selector-parser');
module.exports = (opts) => {
  const {
    namespaceClass,
    ignoreSelector
  } = opts || {}
  if (!namespaceClass) {
    throw new Error('namespaceClass is required.')
  }
  const nsclass = namespaceClass[0] === '.' ? namespaceClass : '.' + namespaceClass
  // Work with options here
  return {
    postcssPlugin: 'postcss-plugin-classns',
    Root (root, postcss) { // eslint-disable-line
      // const ret = root.toResult()
      root.walkRules((child) => {
        if (
          child.nodes[0] &&
          child.nodes[0].type === 'comment' &&
          child.nodes[0].text.trim() === 'classns-ignore'
        ) {
          return child
        }
        if (
          child.parent &&
          child.parent.type === 'atrule' &&
          (child.parent.name === 'keyframes' || child.parent.name.endsWith('-keyframes'))
        ) {
          return child
        }
        if (child.selector === ':root') {
          return child
        }
        if (child.selectors) {
          child.selectors = child.selectors.map(selector => {
            let ignore = false
            if (typeof ignoreSelector === 'function') {
              ignore = !!ignoreSelector(selector, child.selector)
            }
            if (ignore) return selector
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
