"use strict";

var chai = require("chai");
var expect = chai.expect;
var expressions = require("../lib/main.js");
var compile = expressions.compile;

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
			var parser = new expressions.Parser(undefined, undefined, {});

			expect(parser.parse).to.be.a("function");
		});
	});

	describe(".compile(src)", function () {
		var scope;
		var evaluate;

		beforeEach(function () {
			scope = {
				ship: {
					pirate: {
						name: "Jenny",
					},
				},
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

		it("should expose the ast", function () {
			expect(compile("tmp").ast).to.be.a("object");
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

			it("should return context value when nothing in the scope", function () {
				evaluate = compile("test");
				expect(evaluate(scope, { test: "hello" })).to.equal("hello");
			});

			it("should return context value when something in the scope", function () {
				evaluate = compile("test");
				expect(evaluate({ test: "bye" }, { test: "hello" })).to.equal("hello");
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

			it("should return the scope even when the 'this' keyword is used", function () {
				evaluate = compile("this");
				expect(evaluate(scope)).to.equal(scope);
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
				scope.ships = [{ pirate: "Jenny" }, { pirate: "Störtebeker" }];
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
				scope.ships = [{ pirate: "Jenny" }];
				evaluate = compile("ships[0].pirate = 'Störtebeker'");
				evaluate(scope);
				expect(scope.ships[0].pirate).to.equal("Störtebeker");
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
					scope.findPirate = function () {
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
					{
						pirate: function (str) {
							return str;
						},
					},
					{
						pirate: function (str) {
							return str;
						},
					},
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
				}).to.throw(
					"Lexer Error: Unterminated quote at columns 0-20 ['unterminated string] in expression ['unterminated string]."
				);
			});

			it("should give a readable error message", function () {
				expect(function () {
					compile("3 = 4");
				}).to.throw(
					'[$parse:lval] Trying to assign a value to a non l-value\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$parse/lval'
				);
			});
		});

		describe("when using filters", function () {
			it("should apply the given filter", function () {
				expressions.filters.currency = function (input, currency, digits) {
					input = input.toFixed(digits);

					if (currency === "EUR") {
						return input + "€";
					}
					return input + "$";
				};

				evaluate = compile("1.2345 | currency:selectedCurrency:2");
				expect(
					evaluate({
						selectedCurrency: "EUR",
					})
				).to.equal("1.23€");
			});
		});

		describe("when evaluating the same expression multiple times", function () {
			it("should cache the generated function", function () {
				expect(compile("a")).to.equal(compile("a"));
			});
		});

		describe("for assigning values", function () {
			beforeEach(function () {
				scope = {};
			});

			it("should expose an 'assign'-function", function () {
				var fn = compile("a");

				expect(fn.assign).to.be.a("function");
				fn.assign(scope, 123);
				expect(scope.a).to.equal(123);
			});

			describe("the 'assign'-function", function () {
				it("should work for expressions ending with brackets", function () {
					var fn = compile("a.b['c']");

					fn.assign(scope, 123);
					expect(scope.a.b.c).to.equal(123);
				});

				it("should work for expressions with brackets in the middle", function () {
					var fn = compile('a["b"].c');

					fn.assign(scope, 123);
					expect(scope.a.b.c).to.equal(123);
				});

				it("should return the result of the assignment", function () {
					var fn = compile('a["b"].c');

					expect(fn.assign(scope, 123)).to.equal(123);
				});
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
					compile.cache = Object.create(null);
				});
			});
		});
	});

	describe(".filters", function () {
		it("should be an object", function () {
			expect(expressions.filters).to.be.an("object");
		});
	});

	describe("Special characters", function () {
		var evaluate;
		it("should allow to define isIdentifierStart and isIdentifierContinue", function () {
			function validChars(ch) {
				return (
					(ch >= "a" && ch <= "z") ||
					(ch >= "A" && ch <= "Z") ||
					ch === "_" ||
					ch === "$" ||
					"ÀÈÌÒÙàèìòùÁÉÍÓÚáéíóúÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüÿß".indexOf(ch) !== -1
				);
			}
			evaluate = compile("être_embarassé", {
				isIdentifierStart: validChars,
				isIdentifierContinue: validChars,
			});

			expect(evaluate({ être_embarassé: "Ping" })).to.eql("Ping");
		});
	});

	describe("prototype", function () {
		var evaluate;

		it("should not leak", function () {
			evaluate = compile("''.split");
			expect(evaluate({})).to.eql(undefined);
		});

		it("should not leak with computed prop", function () {
			evaluate = compile("a['split']");
			expect(evaluate({ a: "" })).to.eql(undefined);
		});

		it("should allow to read string length", function () {
			evaluate = compile("'abc'.length");
			expect(evaluate({})).to.eql(3);
		});

		it("should allow to read users length", function () {
			evaluate = compile("users.length");
			expect(evaluate({ users: [1, 4, 4] })).to.eql(3);
		});

		// it("should disallow from changing prototype", function() {
		// 	evaluate = compile("name.split = 10");
		// 	var scope = { name: "hello" };
		// 	evaluate(scope);
		// 	expect(scope.name.split).to.be.a("function");
		// });
		//
		//
		it("should work with __proto__", function () {
			evaluate = compile("__proto__");
			expect(evaluate({})).to.eql(undefined);
		});

		it("should work with toString", function () {
			evaluate = compile("toString");
			expect(evaluate({ toString: 10 })).to.eql(10);
		});
	});
});
