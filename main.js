import parse from './parse.js';
import tokenize from './tokenize.js';


const code = `
  const x = 42+3;
  1+2
  function add(a, b) {
    return a + b;
  }
`;

const tokens = tokenize(code);
console.log(JSON.stringify(tokens, null, 2));
console.log(tokens)


const ast = parse(tokens);
console.log(JSON.stringify(ast, null, 2))

console.log(ast)
