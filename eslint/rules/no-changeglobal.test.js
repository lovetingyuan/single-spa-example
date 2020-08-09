/**
 * @fileoverview Tests for no-continue rule.
 * @author Borislav Zhivkov
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("./no-changeglobal"),
    { RuleTester } = require("eslint");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

ruleTester.run("no-changeglobal", rule, {
    valid: [
        "var sum = 0, i; for(i = 0; i < 10; i++){ if(i > 5) { sum += i; } }",
        "const a = window.a; const b = window.b.c.d; Object.assign({}, window);"
    ],

    invalid: [
        {
            code: "window.a = a; window.b.c = bc; window['a'] = a;",
            errors: [{
                messageId: "nochangeglobal",
                type: "AssignmentExpression"
            },{
                messageId: "nochangeglobal",
                type: "AssignmentExpression"
            },{
                messageId: "nochangeglobal",
                type: "AssignmentExpression"
            }]
        },
        {
            code: "delete window.a; delete window.b.c; delete window[a]",
            errors: [{
                messageId: "nochangeglobal",
                type: "UnaryExpression"
            },{
                messageId: "nochangeglobal",
                type: "UnaryExpression"
            },{
                messageId: "nochangeglobal",
                type: "UnaryExpression"
            }]
        },
        {
            code: "Object.assign(window, {}); Object.defineProperty(window, {})",
            errors: [{
                messageId: "nochangeglobal",
                type: "CallExpression"
            }, {
                messageId: "nochangeglobal",
                type: "CallExpression"
            }]
        },
    ]
});
