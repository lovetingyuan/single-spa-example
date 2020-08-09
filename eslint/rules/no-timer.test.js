/**
 * @fileoverview Tests for no-continue rule.
 * @author Borislav Zhivkov
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("./no-timer"),
  { RuleTester } = require("eslint");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

ruleTester.run("no-timer", rule, {
  valid: [
    "var sum = 0, i; for(i = 0; i < 10; i++){ if(i > 5) { sum += i; } }",
    {
      code: `
      setTimeout(this.callback, 0),
      setTimeout(function(){})
            `,
      options: [{ allowZeroTimeout: true }],
    }
  ],

  invalid: [
    {
      code: `
      setTimeout(this.callback)
            `,
      errors: [{
        messageId: "notimeout",
        type: "CallExpression"
      }]
    },
  ]
});
