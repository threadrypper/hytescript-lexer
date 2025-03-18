/**
 * Represents a code lexer.
 */
class Lexer {
    #path = []
    #addMainFunction = false
    #code = ''
    #pos = 0
    /**
     * @type {InstructionToken[]}
     */
    #functions = []
    /**
     * Creates a new instance of the `Lexer` class.
     * @param {string[]} [path=[]] - The current compiled path.
     * @param {boolean} [addMainFunction=false] - Whether add the main function to the code.
     */
    constructor(path = [], addMainFunction = false) {
        this.#path.push(...path)
        this.#addMainFunction = addMainFunction
    }

    /**
     * Set the code to be compiled.
     * @param {string} code - The code to be compiled.
     * @param {boolean} [ignore=false] - Whether ignore addMainFunction config.
     * @returns {Lexer}
     */
    setInput(code, ignore = false) {
        if (ignore) {
            this.#code = code
        } else {
            this.#code = this.#addMainFunction ? `#(HYTESCRIPTMAINFUNCTION ${code})` : code
        }

        return this
    }

    /**
     * Compiles the code into tokens.
     * @returns {InstructionToken[]}
     */
    compile() {
        while (this.#pos < this.#code.length) {
            if (!this.#isFunctionStart()) {
                this.#advance()
                continue
            }

            this.#parseFunction()
        }

        return this.#functions
    }

    /**
     * Advances the given amount of positions in the code.
     * @param {number} [amount=1] - The positions to advance.
     * @returns {void}
     */
    #advance(amount = 1) {
        this.#pos += amount
    }

    /**
     * The current function path.
     * @param {string} name - The name of the current function path.
     */
    #parseInside(name) {
        this.#advance() // Omit whitespace.
        /**
         * @type {string[]}
         */
        let splits = []
        let depth = 1
        let currentSplit = ''

        while (depth > 0 && this.#pos < this.#code.length) {
            if (depth === 0 && this.#code[this.#pos] === ')') {
                this.#advance()
                break
            }

            if (this.#code[this.#pos] === '|' && depth === 1) {
                splits.push(currentSplit.trim())
                currentSplit = ''
            } else {
                currentSplit += this.#code[this.#pos]
            }

            this.#advance()

            if (this.#code[this.#pos] === '(') depth++;
            else if (this.#code[this.#pos] === ')') depth--;
        }

        if (currentSplit !== '') {
            splits.push(currentSplit.trim())
            currentSplit = ''
        }

        return splits.map(split => {
            if (split.includes('#(')) {
                const lexer = new Lexer([...this.#path, name], false)
                .setInput(split);

                const overloads = lexer.compile()
                return { value: split, overloads }
            } else {
                return { value: split, overloads: [] }
            }
        })
    }

    #parseFunction() {
        let name = ''
        /**
         * @type {?string[]}
         */
        let splits = null
        this.#advance(2) // Omit "#" and "("

        // Collect the name.
        while (/[a-zA-Z]/.test(this.#code[this.#pos])) {
            name += this.#code[this.#pos]
            this.#advance()
        }

        // Parse the inside.
        if (this.#code[this.#pos] === ' ') {
            splits = this.#parseInside(name)
        }

        // Push the function.
        this.#functions.push({
            name,
            splits,
            inside: splits === null ? null : splits.map(x => x.value).join(' | '),
            path: this.#path
        })
    }

    /**
     * Check whether the current position indicates
     * a function start.
     */
    #isFunctionStart() {
        return this.#code[this.#pos] === '#' && this.#code[this.#pos + 1] === '('
    }

    get code() {
        return this.#code
    }
}

const lexer = new Lexer([], true)
.setInput('#(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO) | #(parseInt 123) #(execute bye world))')

const result = lexer.compile()
console.log(result)


/**
 * @typedef InstructionToken
 * @property {string} name - The name of the instruction.
 * @property {?string} inside - The content inside the instruction.
 * @property {?string[]} splits - The splits of the instruction.
 * @property {ClosureStates} closures - The closure states of the instruction.
 * @property {string[]} path - The current path of the instruction.
 * 
 * @typedef ClosureStates
 * @property {boolean} opens - Whether the instruction opens.
 * @property {boolean} closed - Whether the instruction is closed.
 */
