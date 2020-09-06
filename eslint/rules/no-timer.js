/**
 * @fileoverview Rule to disable setTimeout and setInterval
 * @author tingyuan
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "suggestion",

    docs: {
      description: "disallow `setTimeout` and `setInterval`",
      category: "Best Practices",
      recommended: false,
      // url: "https://eslint.org/docs/rules/no-continue"
    },

    schema: [
      {
        type: "object",
        properties: {
          allowZeroTimeout: {
            type: "boolean", default: false
          },
        },
        additionalProperties: false
      }
    ],

    messages: {
      notimeout: "Do not forget to use `clearTimeout`.",
      nointerval: "Do not forget to use `clearInterval`.",
      noraf: "Do not forget to use `cancelAnimationFrame`.",
      noric: "Do not forget to use `cancelIdleCallback`."
    }
  },

  create(context) {
    const methodtomessage = {
      setTimeout: 'notimeout', setInterval: 'nointerval', requestAnimationFrame: 'noraf', requestIdleCallback: 'noric'
    }
    const options = context.options[0] || {}
    return {
      CallExpression(node) {
        const { callee, arguments: args } = node
        if (callee.type === 'MemberExpression') { // window.setTimeout
          if (callee.object.type !== 'Identifier' || callee.property.type !== 'Identifier') return
          const [target, method] = [callee.object.name, callee.property.name]
          if (method in methodtomessage) {
            if (options.allowZeroTimeout && method === 'setTimeout') {
              if (!args[1] || (args[1].type === 'Literal' && args[1].value === 0)) return
            }
            context.report({ node, messageId: methodtomessage[method] })
          }
        } else if (callee.type === 'Identifier') { // setTimeout
          const method = callee.name
          if (method in methodtomessage) {
            if (options.allowZeroTimeout && method === 'setTimeout') {
              if (!args[1] || (args[1].type === 'Literal' && args[1].value === 0)) return
            }
            context.report({ node, messageId: methodtomessage[method] })
          }
        }
      },
    };
  }
};
