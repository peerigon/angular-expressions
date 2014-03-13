"use strict";

var chai = require("chai"),
    expect = chai.expect,
    expressions = require("../lib/main.js"),
    compile = expressions.compile;

chai.Assertion.includeStack = true;

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

        describe("when evaluating simple key look-ups", function () {

            it("should return the value if its defined on scope", function () {
                evaluate = compile("ship");
                expect(evaluate(scope)).to.equal(scope.ship);
            });

            it("should return undefined instead of throwing a ReferenceError if it's not defined on scope", function () {
                evaluate = compile("notDefined");
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
                evaluate = compile("ships[0].pirate.name = 'Jenny'");
                expect(function () {
                    evaluate(scope);
                }).to.throw("Cannot read property 'pirate' of undefined");
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

            });

        });

    });

});