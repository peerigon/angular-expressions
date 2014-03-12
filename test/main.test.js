"use strict";

var chai = require("chai"),
    expect = chai.expect,
    compile = require("../lib/main.js");

chai.Assertion.includeStack = true;

describe("compile", function () {

    describe(".Lexer", function () {

        it("should be a function", function () {
            expect(compile.Lexer).to.be.a("function");
        });

        it("should provide a .lex()-method", function () {
            var lexer = new compile.Lexer();

            expect(lexer.lex).to.be.a("function");
        });

    });

    describe(".Parser", function () {

        it("should be a function", function () {
            expect(compile.Parser).to.be.a("function");
        });

        it("should provide a .parse()-method", function () {
            var parser = new compile.Parser();

            expect(parser.parse).to.be.a("function");
        });

    });

});

describe("compile(src)", function () {

});