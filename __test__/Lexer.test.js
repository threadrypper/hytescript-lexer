let { Lexer } = require('../src/core/Lexer');
let { describe, it } = require('node:test');
let assert = require('node:assert/strict');

/**
 * Lexer class test.
 * @author Threadrypper
 */
describe('Lexer', () => {
    /**
     * The user-defined input.
     */
    let input = '#(sum #(get currentValue) | 1)';
    /**
     * The lexer instance.
     */
    let lexer = new Lexer(input, true, ' ');
    /**
     * Compiles the input into tasks.
     */
    let tokens = lexer.compile();

    /**
     * Test 1.
     */
    it('should compile 1 main task', () => {
        assert.ok(tokens.length === 1);
    });

    /**
     * Test 2.
     */
    it('should compile 1 overload for the main function', () => {
        assert.ok(tokens[0].overloads.length === 1);
    });

    /**
     * Test 3.
     */
    it('should compile 2 args for the compiled overload', () => {
        assert.ok(tokens[0].overloads[0].fields.length === 2);
    });

    /**
     * Test 4.
     */
    it('should compile an overload for the overload from the main function', () => {
        assert.ok(tokens[0].overloads[0].overloads.length > 0);
    });
});
