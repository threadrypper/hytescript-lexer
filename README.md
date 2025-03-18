# hytescript-lexer
A custom lexer I made in 30 minutes.

## Usage
```js
// Second arg is "addMainFunction", you must set this to true for your
// MAIN PROGRAMS, and set to false when parsing function insides.
const lexer = new Lexer([], true)
.setInput(
    '#(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #(execute bye world))'
);

const result = lexer.compile();
console.log(result);
```

## Output
```js
[
  {
    name: 'HYTESCRIPTMAINFUNCTION',
    splits: [
      {
        value: '#(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #(execute bye world))',
        overloads: [
          {
            name: 'log',
            splits: [
              {
                value: '#(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping)',
                overloads: [
                  {
                    name: 'toLowerCase',
                    splits: [
                      {
                        value: 'CUANDO SE TE OLVIDA LA TAREA OWOOOO',
                        overloads: []
                      }
                    ],
                    inside: 'CUANDO SE TE OLVIDA LA TAREA OWOOOO',
                    path: [ 'HYTESCRIPTMAINFUNCTION', 'log' ]
                  },
                  {
                    name: 'ping',
                    splits: null,
                    inside: null,
                    path: [ 'HYTESCRIPTMAINFUNCTION', 'log' ]
                  }
                ]
              },
              {
                value: '#(parseInt 123) #(execute bye world)',
                overloads: [
                  {
                    name: 'parseInt',
                    splits: [ { value: '123', overloads: [] } ],
                    inside: '123',
                    path: [ 'HYTESCRIPTMAINFUNCTION', 'log' ]
                  },
                  {
                    name: 'execute',
                    splits: [ { value: 'bye world', overloads: [] } ],
                    inside: 'bye world',
                    path: [ 'HYTESCRIPTMAINFUNCTION', 'log' ]
                  }
                ]
              }
            ],
            inside: '#(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #(execute bye world)',
            path: [ 'HYTESCRIPTMAINFUNCTION' ]
          }
        ]
      }
    ],
    inside: '#(log #(toLowerCase CUANDO SE TE OLVIDA LA TAREA OWOOOO)#(ping) | #(parseInt 123) #(execute bye world))',
    path: []
  }
]
```
