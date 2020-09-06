/**
 * @fileoverview detect effect of global
 * @author tingyuan
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
const rules = requireIndex(__dirname + '/rules')

Object.keys(rules).forEach(k => k.endsWith('.test') && delete rules[k])

// import all rules in lib/rules
module.exports = {
  rules,
  configs: {
    strictGlobal: {
      env: ["browser"],
      rules: {
        "no-undef": "error",
        "no-extend-native": "error",
        "no-global-assign": "error",
        "no-implicit-globals": "error",
        "no-restricted-globals":[
          "error",
          {
            "name": "self",
            "message": "self is a global variable, use other instead."
          },
          {
            "name": "top",
            "message": "top is a global variable, use other instead."
          },
          {
            "name": "parent",
            "message": "parent is a global variable, use other instead."
          }
        ]
      }
    }
  }
}

