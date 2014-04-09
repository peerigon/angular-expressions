"use strict";

var chai = require("chai"),
    expect = chai.expect,
    expressions = require("../lib/main.js"),
    compile = expressions.compile;

chai.config.includeStack = true;

// These tests make no claim to be complete. We only test the most important parts of angular expressions.
// I hope they have their own tests ;)
describe("expressions", function () {

    describe(".Lexer", function () {

        it("should be a function", function () {
            expect(expressions.Lexer).to.be.a("function");
        });

        it("should provide a .lex()-method", function () {
            var lexer = new expressions.Lexer();

            expect(lexer.lex).to.be.a("function");
        });

    });

    describe(".Parser", function () {

        it("should be a function", function () {
            expect(expressions.Parser).to.be.a("function");
        });

        it("should provide a .parse()-method", function () {
            var parser = new expressions.Parser();

            expect(parser.parse).to.be.a("function");
        });

    });

    describe(".compile(src)", function () {
        var scope,
            evaluate;

        beforeEach(function () {
            scope = {
                ship: {
                    pirate: {
                        name: "Jenny"
                    }
                }
            };
        });

        it("should return a function", function () {
            expect(compile("")).to.be.a("function");
        });

        it("should throw an error if the given value is not a string", function () {
            expect(function () {
                compile();
            }).to.throw("src must be a string, instead saw 'undefined'");
        });

        describe("when evaluating literals", function () {

            it("should return null", function () {
                evaluate = compile("null");
                expect(evaluate(scope)).to.equal(null);
            });

            it("should return true", function () {
                evaluate = compile("true");
                expect(evaluate(scope)).to.equal(true);
            });

            it("should return false", function () {
                evaluate = compile("false");
                expect(evaluate(scope)).to.equal(false);
            });

            it("should return 2.34e5", function () {
                evaluate = compile("2.34e5");
                expect(evaluate(scope)).to.equal(2.34e5);
            });

            it("should return 'string'", function () {
                evaluate = compile("'string'");
                expect(evaluate(scope)).to.equal("string");
            });

            it("should return [ship, 1, 2, []]", function () {
                evaluate = compile("[ship, 1, 2, []]");
                expect(evaluate(scope)).to.eql([scope.ship, 1, 2, []]);
            });

            it("should return { test: 'value', 'new-object': {} }", function () {
                evaluate = compile("{ test: 'value', 'new-object': {} }");
                expect(evaluate(scope)).to.eql({ test: "value", "new-object": {} });
            });

        });

        describe("when evaluating simple key look-ups", function () {

            it("should return the value if its defined on scope", function () {
                evaluate = compile("ship");
                expect(evaluate(scope)).to.equal(scope.ship);
            });

            it("should return undefined instead of throwing a ReferenceError if it's not defined on scope", function () {
                evaluate = compile("notDefined");
                expect(evaluate(scope)).to.equal(undefined);
            });

            it("should return undefined even when the 'this' keyword is used", function () {
                evaluate = compile("this");
                expect(evaluate(scope)).to.equal(undefined);
            });

        });

        describe("when evaluating simple assignments", function () {

            it("should set the new value on scope", function () {
                evaluate = compile("newValue = 'new'");
                evaluate(scope);
                expect(scope.newValue).to.equal("new");
            });

            it("should change the value if its defined on scope", function () {
                evaluate = compile("ship = 'ship'");
                evaluate(scope);
                expect(scope.ship).to.equal("ship");
            });

        });

        describe("when evaluating dot-notated loop-ups", function () {

            it("should return the value if its defined on scope", function () {
                evaluate = compile("ship.pirate.name");
                expect(evaluate(scope)).to.equal("Jenny");
            });

            it("should return undefined instead of throwing a ReferenceError if it's not defined on scope", function () {
                evaluate = compile("island.pirate.name");
                expect(evaluate(scope)).to.equal(undefined);
            });

        });

        describe("when evaluating dot-notated assignments", function () {

            it("should set the new value on scope", function () {
                evaluate = compile("island.pirate.name = 'Störtebeker'");
                evaluate(scope);
                expect(scope.island.pirate.name).to.equal("Störtebeker");
            });

            it("should change the value if its defined on scope", function () {
                evaluate = compile("ship.pirate.name = 'Störtebeker'");
                evaluate(scope);
                expect(scope.ship.pirate.name).to.equal("Störtebeker");
            });

        });

        describe("when evaluating array look-ups", function () {

            beforeEach(function () {
                scope.ships = [
                    { pirate: "Jenny" },
                    { pirate: "Störtebeker" }
                ];
            });

            it("should return the value if its defined on scope", function () {
                evaluate = compile("ships[1].pirate");
                expect(evaluate(scope)).to.equal("Störtebeker");
            });

            it("should return undefined instead of throwing a ReferenceError if it's not defined on scope", function () {
                evaluate = compile("ships[2].pirate");
                expect(evaluate(scope)).to.equal(undefined);
            });

        });

        describe("when evaluating array assignments", function () {

            it("should change the value if its defined on scope", function () {
                scope.ships = [
                    { pirate: "Jenny" }
                ];
                evaluate = compile("ships[0].pirate = 'Störtebeker'");
                evaluate(scope);
                expect(scope.ships[0].pirate).to.equal("Störtebeker");
            });

            it("should throw an error if the array doesn't exist", function () {
                var obj,
                    err;

                try {
                    // first we're creating the same type of error because the error messages differ
                    // between javascript implementations
                    obj.pirate;
                } catch (e) {
                    err = e;
                }

                evaluate = compile("ships[0].pirate.name = 'Jenny'");
                expect(function () {
                    evaluate(scope);
                }).to.throw(err.message);
            });

        });

        describe("when evaluating function calls", function () {

            describe("using no arguments", function () {

                it("should return the function's return value", function () {
                    scope.findPirate = function () {
                        return scope.ship.pirate;
                    };

                    evaluate = compile("findPirate()");
                    expect(evaluate(scope)).to.equal(scope.ship.pirate);
                });

                it("should call the function on the scope", function () {
                    scope.returnThis = function () {
                        return this;
                    };
                    evaluate = compile("returnThis()");
                    expect(evaluate(scope)).to.equal(scope);
                });

                it("should call the function on the object where it is defined", function () {
                    scope.ship.returnThis = function () {
                        return this;
                    };
                    evaluate = compile("ship.returnThis()");
                    expect(evaluate(scope)).to.equal(scope.ship);
                });

            });

            describe("using arguments", function () {

                it("should parse the arguments accordingly", function () {
                     scope.findPirate = function (pirate) {
                        return Array.prototype.slice.call(arguments);
                    };
                    evaluate = compile("findPirate(ship.pirate, 1, [2, 3])");
                    expect(evaluate(scope)).to.eql([scope.ship.pirate, 1, [2, 3]]);
                });

            });

        });

        describe("when evaluating operators", function () {

            it("should return the expected result when using +", function () {
                evaluate = compile("1 + 1");
                expect(evaluate()).to.equal(2);
            });

            it("should return the expected result when using -", function () {
                evaluate = compile("1 - 1");
                expect(evaluate()).to.equal(0);
            });

            it("should return the expected result when using *", function () {
                evaluate = compile("2 * 2");
                expect(evaluate()).to.equal(4);
            });

            it("should return the expected result when using /", function () {
                evaluate = compile("4 / 2");
                expect(evaluate()).to.equal(2);
            });

            it("should return the expected result when using %", function () {
                evaluate = compile("3 % 2");
                expect(evaluate()).to.equal(1);
            });

            it("should return the expected result when using &&", function () {
                evaluate = compile("true && true");
                expect(evaluate()).to.equal(true);
                evaluate = compile("true && false");
                expect(evaluate()).to.equal(false);
                evaluate = compile("false && false");
                expect(evaluate()).to.equal(false);
            });

            it("should return the expected result when using ||", function () {
                evaluate = compile("true || true");
                expect(evaluate()).to.equal(true);
                evaluate = compile("true || false");
                expect(evaluate()).to.equal(true);
                evaluate = compile("false || false");
                expect(evaluate()).to.equal(false);
            });

            it("should return the expected result when using !", function () {
                evaluate = compile("!true");
                expect(evaluate()).to.equal(false);
                evaluate = compile("!false");
                expect(evaluate()).to.equal(true);
            });

            /* Ooops, angular doesn't support ++. Maybe someday?
            it("should return the expected result when using ++", function () {
                scope.value = 2;
                evaluate = compile("value++");
                expect(evaluate()).to.equal(3);
                expect(scope.value).to.equal(3);
            });*/

            /* Ooops, angular doesn't support --. Maybe someday?
            it("should return the expected result when using --", function () {
                scope.value = 2;
                evaluate = compile("value--");
                expect(evaluate()).to.equal(1);
                expect(scope.value).to.equal(1);
            });*/

            it("should return the expected result when using ?", function () {
                evaluate = compile("true? 'it works' : false");
                expect(evaluate()).to.equal("it works");
                evaluate = compile("false? false : 'it works'");
                expect(evaluate()).to.equal("it works");
            });

        });

        describe("using complex expressions", function () {

            beforeEach(function () {
                scope.ships = [
                    { pirate: function (str) { return str; } },
                    { pirate: function (str) { return str; } }
                ];
                scope.index = 0;
                scope.pi = "pi";
                scope.Jenny = "Jenny";
            });

            it("should still be parseable and executable", function () {
                evaluate = compile("ships[index][pi + 'rate'](Jenny)");
                expect(evaluate(scope)).to.equal("Jenny");
            });

        });

        describe("when evaluating syntactical errors", function () {

            it("should give a readable error message", function () {
                expect(function () {
                    compile("'unterminated string");
                }).to.throw("Lexer Error: Unterminated quote at columns 0-20 ['unterminated string] in expression ['unterminated string].");
            });

            it("should give a readable error message", function () {
                expect(function () {
                    compile("3 = 4");
                }).to.throw("Token '=' implies assignment but [3 ] can not be assigned to at column 3 of the expression [3 = 4] starting at [= 4].");
            });

        });

        describe("when using filters", function () {

            it("should apply the given filter", function () {
                expressions.filters.currency = function (input, currency, digits) {
                    input = input.toFixed(digits);

                    if (currency === "EUR") {
                        return input + "€";
                    } else {
                        return input + "$";
                    }
                };

                evaluate = compile("1.2345 | currency:selectedCurrency:2");
                expect(evaluate({
                    selectedCurrency: "EUR"
                })).to.equal("1.23€");
            });

        });

        describe("when evaluating the same expression multiple times", function () {

            it("should cache the generated function", function () {
                expect(compile("a")).to.equal(compile("a"));
            });

        });

        describe(".cache", function () {

            it("should be an object by default", function () {
                expect(compile.cache).to.be.an("object");
            });

            it("should cache the generated function by the expression", function () {
                var fn = compile("a");

                expect(compile.cache.a).to.equal(fn);
            });

            describe("when setting it to false", function () {

                it("should disable the cache", function () {
                    compile.cache = false;
                    expect(compile("a")).to.not.equal(compile("a"));
                    compile.cache = {};
                });

            });

        });

    });

    describe(".filters", function () {

        it("should be an object", function () {
            expect(expressions.filters).to.be.an("object");
        });

    });

});