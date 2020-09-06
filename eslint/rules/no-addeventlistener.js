/**
 * @fileoverview Rule to avoid event listener effection.
 * @author tingyuan
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
// const astUtils = require("eslint/utils/ast-utils");

module.exports = {
  meta: {
    type: "suggestion",

    docs: {
      description: "disallow addEventListener",
      category: "Best Practices",
      recommended: false,
      // url: "https://eslint.org/docs/rules/no-continue"
    },

    schema: [],

    messages: {
      forgetunlisten: "Do not forget to use removeEventListener."
    }
  },

  create(context) {
    let addmap = Object.create(null)
    const sourceCode = context.getSourceCode();
    return {
      CallExpression(node) {
        const { callee, arguments: args } = node
        if (callee.type === 'MemberExpression') { // document.addEventListener
          if (callee.object.type !== 'Identifier' || callee.property.type !== 'Identifier') return
          const [target, method] = [callee.object.name, callee.property.name]
          if (method === 'addEventListener') {
            if (args.length < 2) return
            if (args[1].type === 'FunctionExpression' || args[1].type === 'ArrowFunctionExpression') {
              context.report({ node, messageId: 'forgetunlisten' })
            } else {
              const eventName = args[0].type === 'Literal' ? JSON.stringify(args[0].value) : sourceCode.getText(args[0])
              const callback = sourceCode.getText(args[1])
              const key = [target, eventName, callback].join('#@')
              addmap[key] = node
            }
          } else if (method === 'removeEventListener') {
            if (args.length < 2) return
            const eventName = args[0].type === 'Literal' ? JSON.stringify(args[0].value) : sourceCode.getText(args[0])
            const callback = sourceCode.getText(args[1])
            const key = [target, eventName, callback].join('#@')
            if (addmap[key]) delete addmap[key]
          }
        }
      },
      'Program:exit'() {
        Object.keys(addmap).forEach(k => {
          context.report({ node: addmap[k], messageId: 'forgetunlisten' })
        })
        addmap = Object.create(null)
      }
    };
  }
};
