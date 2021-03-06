/*jslint maxlen:100 */
(function (referee, buster, _, testHelper) {
    if (typeof require === "function" && typeof module === "object") {
        referee = require("../lib/referee-combinators");
        _ = require("lodash");
        testHelper = require("./test-helper");

        //// This is a temporary workaround for the development-environment:
        //buster = require("buster-node");
        //var B = require("buster");
        //buster.format = { ascii: B.format.ascii.bind(B) };
        // remove the above and uncomment the following once workaround is obsolete:
        buster = require("buster");
    }

    var combinators = referee.combinators;
    var assert = buster.assert;
    var refute = buster.refute;
    var makeTests = testHelper.makeTests;

    function addCustomAssertions() {
        referee.add("equalsTwoWithCoercion", {
            assert: function (actual) {
                /*jslint eqeq: true*/ // only in current scope
                return actual == 2;  // we DO want coercion here
            },
            assertMessage: "${0} was expected to equal 2",
            refuteMessage: "${0} was not expected to equal 2"
        });
    }

    buster.testCase("check normal assertions", {
        "built-in": {
            "isTrue": function () {
                assert.isTrue(true, "normal refute.isTrue(true) should pass");
                refute.isTrue(false, "normal refute.isTrue(false) should pass");
                refute.isTrue(1, "normal refute.isTrue(1) should pass");
                refute.isTrue(0, "normal refute.isTrue(0) should pass");
            },
            "//isTrue defines .displayName": function () {
                assert.defined(assert.isTrue.displayName, ".displayName");
            },
            "//equals coercing or not? (fails with buster <= 0.6.12)": function () {
                var a = 42;
                var e = "42";
                var refuteEquals = combinators.refute.equals(e);

                // will fail with buster <= 0.6.12 (where `equals` does coercion):
                refute.equals(e, a, "normal equals should NOT do coercion");

                // based on `referee.equals` (no coercion) so this will pass:
                refuteEquals(a, "derived equals should also NOT do coercion");
            }
        }
    });

    var ca = combinators.assert;

    // need to add them here (outside test case),
    // if it's done in setUp the custom assertion is not found - why?
    addCustomAssertions();

    buster.testCase("combinator ('partial') assertions", {

        '//- TODO: all tests should also pass with `referee.throwOnFailure = false`': function () {
        },

        'derived from custom': {
            //setUp: addCustomAssertions, // not working - why ?

            'binary': makeTests('equalsTwoWithCoercion', [], function (pass, fail) {
                pass(2);
                pass("2");
                fail(8);
            })
        },

        'derived from built-in unary': {
            'isTrue': makeTests('isTrue', [], function (pass, fail) {
                pass(true);
                fail(false);
                fail("false");
                fail("true");
                fail(0);
                fail(1);
            })
        },

        'derived from built-in binary': {
            'equals': makeTests('equals', [42], function (pass, fail) {
                pass(42);
                fail("42"); // ATTENTION: old equals from buster <= 0.6.12 DID have coercion!
                fail(100);
            }),
            'greater': makeTests('greater', [23], function (pass, fail) {
                pass(4711);
                pass(24);
                fail(23);
                fail(0);
                fail(-1);
            })
        },

        'extension -': {
            'attr 1 level': makeTests('attr', ['key', ca.equals('value')],
                function (pass, fail) {
                    pass({key: 'value'});   // "pass for equal attribute" : 
                    fail({key: 'other'});   // "fail for unequal attribute" : 
                    fail({});   // "fail for missing attribute" :
                    pass({key: 'value', other: 'ignored'}); // "pass for equal and other value"
                }),
            'attr 2 levels': makeTests('attr', ['key0', ca.attr('key1', ca.equals('value'))],
                function (pass, fail) {
                    pass({key0: {key1: 'value'}});    // "pass for equal value"
                    fail({key0: {key1: 'other'}});    // "fail for unequal value
                    fail({key1: {key0: 'value'}});    // "fail for non-existent path
                    fail({key0: {}});  // "fail for partial path" : 
                }),

            /*
             * Structure assert is merely syntactic sugar for other assert combinators
             */
            'structure': {
                '1 level': makeTests('structure', [{key: 'value'}],
                    function (pass, fail) {
                        pass({key: 'value'});   // "pass for equal attribute" : 
                        fail({key: 'other'});   // "fail for unequal attribute" : 
                        fail({});   // "fail for missing attribute" :
                        pass({key: 'value', other: 'ignored'}); // "pass for equal and other value"
                    }),
                '2 levels': makeTests('structure', [{'key0': {'key1': 'value'}}],
                    function (pass, fail) {
                        pass({key0: {key1: 'value'}});    // "pass for equal value"
                        fail({key0: {key1: 'other'}});    // "fail for unequal value
                        fail({key1: {key0: 'value'}});    // "fail for non-existent path
                        fail({key0: {}});  // "fail for partial path" : 
                    }),
                'explicit assert for attribute': makeTests('structure', [{enabled: ca.isTrue()}],
                    function (pass, fail) {
                        pass({enabled: true}); // "pass for true"
                        fail({enabled: false}); // "fail for false"
                        fail({enabled: undefined}); // "fail for undefined"
                        fail({}); // "fail for missin"
                    })
            }
        }
    });

}(this.referee, this.buster, this._, this.testHelper));
