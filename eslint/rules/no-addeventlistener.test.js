/**
 * @fileoverview Tests for no-continue rule.
 * @author Borislav Zhivkov
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("./no-addeventlistener"),
  { RuleTester } = require("eslint");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

ruleTester.run("no-addeventlistener", rule, {
  valid: [
    "var sum = 0, i; for(i = 0; i < 10; i++){ if(i > 5) { sum += i; } }",

  ],

  invalid: [
    {
      code: `
      window.addEventListener('a', () => {});
      window.addEventListener('click', this.handle)
      window.removeEventListener("click", this.handle)
            `,
      errors: [{
        messageId: "forgetunlisten",
        type: "CallExpression"
      }]
    },
  ]
});
