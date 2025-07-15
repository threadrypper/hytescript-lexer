# HyteScript Lexer v2
The improved version of the "30-mins made" lexer.

## Usage
```js
let { Lexer } = require('./path/to/Lexer');

let inputString = '#!(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #*(execute bye world))';
let lexer = new Lexer(inputString, true, ' ');

let tasks = lexer.compile();
console.log(tasks);
```

## Explanation
Lexer constructor receives three arguments.
> `input`: The input string to be compiled.
> `addMainFunction`: Adds a main function to "encapsulate" main program; this should not be enabled to compile function contents.
> `separator`: Different function separators. "#(fn args), #(fn:args), #(fn=args), #(fn>args)"

## Output
```js
[
  Task {
    name: 'MAIN_FUNCTION',
    states: {
      closures: { opened: true, closed: true },
      negated: false,
      handled: false
    },
    fields: [
      '#!(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #*(execute bye world))'
    ],
    inside: '#!(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #*(execute bye world))',
    lines: [ 1 ],
    bounds: [ 0, 121 ],
    from: null,
    id: '[OVERLOAD_(vbhajevl929ydfpsl23hp)]',
    parentId: null,
    path: [],
    overloads: [
      Task {
        name: 'log',
        states: {
          closures: { opened: true, closed: true },
          negated: true,
          handled: false
        },
        fields: [
          '#(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping)',
          '#(parseInt 123) #*(execute bye world)'
        ],
        inside: '#(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #*(execute bye world)',
        lines: [ 1 ],
        bounds: [ 0, 104 ],
        from: 0,
        id: '[OVERLOAD_(nwds31q0tlljnby7elv65)]',
        parentId: '[OVERLOAD_(vbhajevl929ydfpsl23hp)]',
        path: [ 'MAIN_FUNCTION' ],
        overloads: [
          Task {
            name: 'toLowerCase',
            states: {
              closures: { opened: true, closed: true },
              negated: false,
              handled: false
            },
            fields: [ 'CUANDO SE TE OLVIDA LA TAREA OWOOOO' ],
            inside: 'CUANDO SE TE OLVIDA LA TAREA OWOOOO',
            lines: [ 1 ],
            bounds: [ 0, 49 ],
            from: 0,
            id: '[OVERLOAD_(24ux6kbymwq67ef2z6gpnw)]',
            parentId: '[OVERLOAD_(nwds31q0tlljnby7elv65)]',
            path: [ 'MAIN_FUNCTION', 'log' ],
            overloads: []
          },
          Task {
            name: 'ping',
            states: {
              closures: { opened: true, closed: true },
              negated: false,
              handled: false
            },
            fields: null,
            inside: null,
            lines: [ 1 ],
            bounds: [ 50, 56 ],
            from: 1,
            id: '[OVERLOAD_(ywfxcjy8uknanuuf3eado)]',
            parentId: '[OVERLOAD_(nwds31q0tlljnby7elv65)]',
            path: [ 'MAIN_FUNCTION', 'log' ],
            overloads: []
          },
          Task {
            name: 'parseInt',
            states: {
              closures: { opened: true, closed: true },
              negated: false,
              handled: false
            },
            fields: [ '123' ],
            inside: '123',
            lines: [ 1 ],
            bounds: [ 0, 14 ],
            from: 2,
            id: '[OVERLOAD_(jcebe1c5qzj4717j2kow)]',
            parentId: '[OVERLOAD_(nwds31q0tlljnby7elv65)]',
            path: [ 'MAIN_FUNCTION', 'log' ],
            overloads: []
          },
          Task {
            name: 'execute',
            states: {
              closures: { opened: true, closed: true },
              negated: false,
              handled: true
            },
            fields: [ 'bye world' ],
            inside: 'bye world',
            lines: [ 1 ],
            bounds: [ 16, 36 ],
            from: 3,
            id: '[OVERLOAD_(oadl121omk85zevvl4eauy)]',
            parentId: '[OVERLOAD_(nwds31q0tlljnby7elv65)]',
            path: [ 'MAIN_FUNCTION', 'log' ],
            overloads: []
          }
        ]
      }
    ]
  }
]
```
