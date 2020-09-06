/**
 * @fileoverview Rule to disable produce effection on global context.
 * @author tingyuan
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const dangerApi = [
  'defineProperty', 'defineProperties', 'assign'
]
function isWindowMember (node) {
  if (node.type !== 'MemberExpression') return false
  let object = node.object
  while (object.type === 'MemberExpression') {
    object = object.object
  }
  if (object.type === 'Identifier' && (object.name === 'window' || object.name === 'globalThis')) return true
  return false
}

function isArrayPatternWindowMember (node) {
  if (node.type !== 'ArrayPattern') return false
  return node.elements.filter(isWindowMember).length > 0
}

function isObjectMethodCallWindow (callee, args) {
  if (callee.type !== 'MemberExpression') return false
  const [object, method] = [callee.object.name, callee.property.name]
  const firstArg = args[0] && args[0].type === 'Identifier' && args[0].name
  if (!firstArg) return false
  if (object === 'Object' && dangerApi.includes(method)) {
    if (firstArg === 'window' || firstArg === 'globalThis') return true
  }
  return false
}

module.exports = {
  meta: {
    type: "problem",

    docs: {
      description: "disallow global modification",
      category: "Possible Errors",
      recommended: true,
      // url: "https://eslint.org/docs/rules/no-continue"
    },

    schema: [],

    messages: {
      nochangeglobal: "Do not change global(window).",
    }
  },

  create(context) {

    return {
      CallExpression(node) {
        if (isObjectMethodCallWindow(node.callee, node.arguments)) { // Object.defineProperty(window,{}), Object.assign(window,{})
          context.report({ node, messageId: 'nochangeglobal' })
        }
      },
      AssignmentExpression(node) { // window.foo = foo, [window.foo] = [foo]
        if (isWindowMember(node.left) || isArrayPatternWindowMember(node.left)) {
          context.report({ node, messageId: 'nochangeglobal' })
        }
      },
      UnaryExpression(node) { // delete window.foo
        if (node.operator === 'delete' && isWindowMember(node.argument)) {
          context.report({ node, messageId: 'nochangeglobal' })
        }
      },
    };
  }
};
