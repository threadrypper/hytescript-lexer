/** @import { FunctionID, ITaskClosures } from '../../index' */

/**
 * Generates a random function ID.
 * @returns {FunctionID}
 */
function getFunctionId() {
    return `[OVERLOAD_(${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)})]`;
}

/**
 * A function token (task) compiled by the lexer.
 * @class Task
 */
class Task {
    /**
     * The name of the function.
     * @type {string}
     */
    name;

    /**
     * The states of the function.
     * @type {Record<'closures', ITaskClosures> & Record<'negated' | 'handled', boolean>}
     */
    states = {
        closures: {
            opened: false,
            closed: false
        },
        negated: false,
        handled: false
    };

    /**
     * The content of the function splitted in parts.
     * @type {Array<string> | null}
     */
    fields = null;

    /**
     * The content of the function inside.
     * @type {string | null}
     */
    inside = null;

    /**
     * The lines this function is on.
     * @type {number[]}
     */
    lines = [];

    /**
     * The bounds of the function.
     * @type {[number, number]}
     */
    bounds = [];

    /**
     * Field index of the parent function this child belongs to.
     * @type {number | null}
     */
    from = null;

    /**
     * The ID of the function.
     * @type {FunctionID}
     */
    id = getFunctionId();

    /**
     * The parent function of this function.
     * @type {FunctionID | null}
     */
    parentId = null;

    /**
     * The current path of the function.
     * @type {string[]}
     */
    path = [];

    /**
     * Nested tasks/overloads (functions) inside the function.
     * @type {Task[]}
     */
    overloads = [];

    /**
     * Creates a new task.
     * @param {Partial<Task>} [data=null]
     */
    constructor(data = null) {
        if (data !== null && typeof data === 'object') {
            Object.assign(this, data);
        }
    }

    /**
     * The string representation of the function.
     * @type {string}
     */
    get toString() {
        let state = !this.states.negated && !this.states.handled ? '' : this.states.negated ? '!' : '*';

        if (!this.fields) return `#${state}(${this.name})`;
        return `#${state}(${this.name}${Lexer.separator}${this.fields.join(' | ')})`;
    };

    /**
     * Set the task function name.
     * @param {string} name - The name to be set.
     * @returns {Task}
     */
    setName(name) {
        if (typeof name !== 'string') {
            throw new Error('Cannot set a name that is not a string.');
        };
        this.name = name;
        return this;
    };

    /**
     * Set the fields for this function.
     * @param  {...string} fields - The fields to be set.
     * @returns {Task}
     */
    setFields(...fields) {
        (this.fields??=[]).push(...fields);
        return this;
    };

    /**
     * Set the content inside the task function.
     * @param {string} content - The content to be set.
     * @returns {Task}
     */
    setInside(content) {
        if (typeof content !== 'string') {
            throw new Error('Cannot set content that is not a string.');
        };
        this.inside = content;
        return this;
    };

    /**
     * Find the overloads that match the callback.
     * @param {(overload: Task) => boolean} cb - The callback to evaluate.
     * @returns {Task[]}
     */
    getOverloadsFor(cb) {
        return this.overloads.filter(cb);
    };

    /**
     * Set the start position of the task function.
     * @param {number} position - The position to set.
     * @returns {Task}
     */
    setStartPoint(position) {
        if (typeof position !== 'number') {
            throw new Error('Cannot set a start point that is not a number.');
        };
        this.bounds[0] = position;
        return this;
    };

    /**
     * Set the end position of the task function.
     * @param {number} position - The position to set.
     * @returns {Task}
     */
    setEndPoint(position) {
        if (typeof position !== 'number') {
            throw new Error('Cannot set an end point that is not a number.');
        };
        this.bounds[1] = position;
        return this;
    };

    /**
     * Adds a line to the task.
     * @param {number} line -  The current line.
     * @returns {Task}
     */
    addLine(line) {
        if (typeof line !== 'number') {
            throw new Error('Cannot add a line that is not a number.');
        };
        this.lines.push(line);
        return this;
    };

    /**
     * Set the task as opened.
     * @returns {Task}
     */
    setOpened() {
        this.states.closures.opened = true;
        return this;
    };

    /**
     * Set the task as closed.
     * @returns {Task}
     */
    setClosed() {
        this.states.closures.closed = true;
        return this;
    };

    /**
     * Set the task as negated.
     * @returns {Task}
     */
    markNegated() {
        this.states.negated = true;
        return this;
    };

    /**
     * Set the task as handled.
     * @returns {Task}
     */
    markHandled() {
        this.states.handled = true;
        return this;
    };

    /**
     * Check whether the task was marked as handled.
     * @returns {boolean}
     */
    get isHandled() {
        return this.states.handled === true;
    };

    /**
     * Check whether the task was marked as negated.
     * @returns {boolean}
     */
    get isNegated() {
        return this.states.negated === true;
    };
};

/**
 * Check if the parentheses in the input are balanced.
 * @param {string} input - The input to check.
 * @returns {boolean}
 */
function areParensBalanced(input) {
    let leftParens = 0;
    let rightParens = 0;

    for (const char of input) {
        if (char === '(') leftParens++;
        else if (char === ')') rightParens++;
    };

    return leftParens === rightParens;
};

/**
 * The HyteScript code lexer.
 * @class Lexer
 */
class Lexer {
    /**
     * Whether add the main task to the given string input.
     * @type {boolean}
     */
    #addMainTask = true;

    /**
     * The string input to be compiled.
     * @type {string}
     */
    #input = '';

    /**
     * The current line of the lexer.
     * @type {number}
     */
    #line = 1;

    /**
     * The current path of the lexer.
     * @type {string[]}
     */
    #path = [];

    /**
     * The current position of the lexer.
     * @type {number}
     */
    #pos = 0;

    /**
     * The compiled tasks.
     * @type {Task[]}
     */
    #tasks = [];

    /**
     * The current task separator. (name from args)
     */
    static separator = ' ';

    /**
     * The allowed task separators.
     * @type {string[]}
     */
    static allowedSeparators = ['>', ':', ' ', '='];

    /**
     * Set the task separator.
     * @param {string} separator
     */
    static setSeparator(separator) {
        if (!Lexer.allowedSeparators.includes(separator)) {
            throw new Error(`The separator "${separator}" is not allowed; you must use one of "${Lexer.allowedSeparators.join(', ')}".`);
        };
        Lexer.separator = separator;
    };

    /**
     * Creates a new lexer.
     * @param {string} input - The string input to compile.
     * @param {boolean} addMainTask - Whether add the main task.
     * @param {string[]} [path=[]] - The current path of the lexer.
     */
    constructor(input = '', addMainTask = true, separator = Lexer.separator, path = []) {
        Lexer.setSeparator(separator);
        this.setInput(input, addMainTask, path);
    };

    /**
     * Set the input string to be compiled.
     * @param {string} input - The input string.
     * @param {boolean} addMainTask - Whether add the main task.
     * @param {string[]} [path=[]] - The path of the lexer.
     */
    setInput(input, addMainTask = true, path = []) {
        if (typeof input !== 'string') {
            throw new Error('Cannot set input that is not a string.');
        };

        this.#addMainTask = addMainTask;
        this.#input = this.#addMainTask ? `#(MAIN_FUNCTION${Lexer.separator}${input})` : input;
        this.#pos = 0;
        this.#path.push(...path);

        return this;
    };

    /**
     * Compiles the string input.
     * @returns {Task[]}
     */
    compile() {
        while (this.#canCompile()) {
            // Increment the lines.
            if (this.#c() === '\n') this.#line++;

            // Check for a task start.
            if (this.#starts()) {
                this.#parseTask();
                continue; // Avoid the code left.
            };

            // Advance to the next character.
            this.#advance();
        };
        return this.#tasks;
    };

    /**
     * Loads a task to the compiled ones.
     * @param {Task} task - The compiled task.
     * @returns {void}
     */
    #loadTask(task) {
        this.#tasks.push(task);
    };

    /**
     * Advances the amount of steps in the input string.
     * @param {number} amount - The steps to advance.
     * @returns {void}
     */
    #advance(amount = 1) {
        this.#pos += amount;
    };

    /**
     * Returns the current **c**haracter.
     * @returns {string}
     */
    #c() {
        return `${this.#input[this.#pos]}`;
    };

    /**
     * Returns the **n**ext **c**haracter.
     * @returns {string}
     */
    #nc() {
        return `${this.#input[this.#pos + 1]}`;
    };

    /**
     * Returns the **n**ext-**n**ext **c**haracters.
     * @returns {string}
     */
    #nnc() {
        return `${this.#input[this.#pos + 1]}${this.#input[this.#pos + 2]}`;
    };

    /**
     * Check if the current character matches a task start.
     * @returns {boolean}
     */
    #starts() {
        return this.#c() === '#' && (this.#nnc() === '!(' || this.#nnc() === '*(' || this.#nc() === '(');
    };

    /**
     * Check if the code can be compiled.
     * @returns {boolean}
     */
    #canCompile() {
        return this.#pos < this.#input.length && this.#c() !== undefined;
    };

    /**
     * Parses the given task.
     * @returns {void}
     */
    #parseTask() {
        // Creating the task object.
        let task = new Task();
        task.setStartPoint(this.#pos)
        .addLine(this.#line);

        // Omit "#".
        this.#advance();

        // Checking for the operators.
        switch (this.#c()) {
            case '!':
                task.markNegated();
                this.#advance();
                break;
            case '*':
                task.markHandled();
                this.#advance();
                break;
        };

        // Omit open brace "(" and mark as open.
        this.#advance();
        task.setOpened();

        // Collecting the task name.
        let name = '';
        while (this.#c() && /[a-zA-Z_\-0-9]/g.test(this.#c())) {
            name += this.#c();
            this.#advance();
        };

        // Set the task name.
        task.setName(name);

        // Parse the content if any.
        if (this.#c() === Lexer.separator) {
            this.#parseInside(task);
        };

        // Check if the current char is a closed brace.
        if (this.#c() === ')') {
            task.setClosed();
            task.setEndPoint(this.#pos);
        };

        // Load the compiled task.
        this.#loadTask(task);

        // Advance to the next position.
        this.#advance();
    };

    /**
     * Parses the inside of a task.
     * @param {Task} task - The task to parse.
     * @returns {void}
     */
    #parseInside(task) {
        // Omit the separator.
        this.#advance();

        /**
         * @type {string[]}
         */
        let args = []; // The content of the task.
        let currentValue = ''; // The string to be parsed.
        let depth = 1; // "1" because we are already inside a task.

        while (this.#canCompile()) {
            // Depth control statements.
            if (this.#c() === '(') depth++;
            else if (this.#c() === ')') depth--;

            // Break the loop if the closing brace is found.
            if (depth === 0 && this.#c() === ')') {
                break;
            }

            // If we find a separator and are in the main function...
            if (this.#c() === '|' && depth === 1) {
                args.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += this.#c();
            };

            // Advance to the next position.
            this.#advance();
        };

        // Append a last char.
        if (depth === 1 && this.#c() === ')') {
            currentValue += this.#c();
        };

        // Looking for some remaining value.
        if (currentValue !== '') args.push(currentValue.trim());

        // Set the task contents.
        task.setInside(args.join(' | '));
        task.setFields(...args);

        // Adding the current task to the lexer path.
        this.#path.push(task.name);

        // Compiling the nested tasks.
        let argi = 0;
        for (const arg of args) {
            const lexer = new Lexer(arg, false, Lexer.separator, this.#path);
            const overloads = lexer.compile();

            // Giving each overload a parent ID and adding them to the parent task.
            for (const overload of overloads) {
                overload.parentId = task.id;
                overload.from = argi++;
                overload.path = this.#path;
                task.overloads.push(overload);
            };
        };
    }
};

module.exports = { Lexer };
