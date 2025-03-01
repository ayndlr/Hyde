/**
 * Represents an AST node.
 * @typedef {Object} ASTNode
 * @property {string} type - The type of AST node.
 * @property {Object} [left] - The left child node (if any).
 * @property {Object} [right] - The right child node (if any).
 * @property {string} [value] - The value of the node (if any).
 * @property {Array} [params] - Parameters for function declarations.
 * @property {Array} [body] - Body for block statements.
 * @property {number} [line] - Line number where the node starts.
 * @property {number} [start] - Starting position of the node.
 * @property {number} [end] - Ending position of the node.
 */

/**
 * Parses tokens into an AST.
 * @param {Array} tokens - The list of tokens to parse.
 * @returns {ASTNode} The generated AST.
 */
function parse(tokens) {
  let current = 0;

  const skipTokens = ['WHITESPACE', 'NEWLINE', 'COMMENT'];
  const variableKeywords = ['const','let','var']
  const skipPunctuation = [';', ',', '(', ')'];

  function walk() {
    if (current >= tokens.length) {
      return null;
    }
    
    

    let token = tokens[current];

    const createNode = (type, value) => {
      return {
        type,
        value,
        line: token.line,
        start: token.start,
        end: token.end,
      };
    };

    // Skip whitespace, newline, and comment tokens
    while (skipTokens.includes(token.type)) {
      current++;
      if (current >= tokens.length) {
        return null;
      }
      token = tokens[current];
    }

    // Handle numbers
    if (token.type === 'NUMBER') {
      current++;
      return createNode('Literal', token.value);
    }

    // Handle strings
    if (token.type === 'STRING') {
      current++;
      return createNode('Literal', token.value);
    }

    // Handle identifiers
    if (token.type === 'IDENTIFIER') {
      current++;
      return createNode('Identifier', token.value);
    }

    // Handle binary expressions
    if (token.type === 'OPERATOR') {
      const operator = token.value;
      current++;
      const left = walk();
      const right = walk();
      if (!left || !right) {
        return null;
      }
      return {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        line: token.line,
        start: token.start,
        end: token.end,
      };
    }

    // Handle return statements
    if (token.type === 'KEYWORD' && token.value === 'return') {
      current++; // Skip 'return'
      const argument = walk(); // Get the return value expression
      if (current < tokens.length && tokens[current].type === 'PUNCTUATION' && tokens[current].value === ';') {
        current++; // Skip ';'
      }
      return {
        type: 'ReturnStatement',
        argument,
        line: token.line,
        start: token.start,
        end: token.end,
      };
    }

    // Handle variable declarations
    if (token.type === 'KEYWORD' && token.value === 'const') {
      current++; // Skip 'const'
      const id = walk(); // Get identifier
      let init = null;
      if (current < tokens.length && tokens[current].type === 'OPERATOR' && tokens[current].value === '=') {
        current++; // Skip '='
        init = walk(); // Get initializer
      }
      if (current < tokens.length && tokens[current].type === 'PUNCTUATION' && tokens[current].value === ';') {
        current++; // Skip ';'
      }
      return {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: id,
            init: init,
          }
        ],
        kind: 'const',
        line: token.line,
        start: token.start,
        end: token.end,
      };
    }

    // Handle function declarations
    if (token.type === 'KEYWORD' && token.value === 'function') {
      current++; // Skip 'function'
      const id = walk(); // Get function name
      current++; // Skip '('
      const params = [];
      while (tokens[current].type !== 'PUNCTUATION' || tokens[current].value !== ')') {
        params.push(walk());
        if (tokens[current].type === 'PUNCTUATION' && tokens[current].value === ',') {
          current++;
        }
      }
      current++; // Skip ')'
      current++; // Skip '{'
      const body = [];
      while (tokens[current].type !== 'PUNCTUATION' || tokens[current].value !== '}') {
        body.push(walk());
        if (current >= tokens.length) {
          return null;
        }
        token = tokens[current];
      }
      current++; // Skip '}'
      return {
        type: 'FunctionDeclaration',
        id: id,
        params: params,
        body: {
          type: 'BlockStatement',
          body: body,
        },
        line: token.line,
        start: token.start,
        end: token.end,
      };
    }

    // Handle block statements
    if (token.type === 'PUNCTUATION' && token.value === '{') {
      current++; // Skip '{'
      const body = [];
      while (tokens[current].type !== 'PUNCTUATION' || tokens[current].value !== '}') {
        body.push(walk());
        if (current >= tokens.length) {
          return null;
        }
        token = tokens[current];
      }
      current++; // Skip '}'
      return {
        type: 'BlockStatement',
        body,
        line: token.line,
        start: token.start,
        end: token.end,
      };
    }

    // Skip semicolons and other punctuation not relevant for AST nodes
    if (token.type === 'PUNCTUATION' && skipPunctuation.includes(token.value)) {
      current++; // Skip irrelevant punctuation
      return null;
    }

    return null; // If no other cases match, return null
  }

  const ast = {
    type: 'Program',
    body: [],
    line: tokens[0].line,
    start: tokens[0].start,
    end: tokens[tokens.length - 1].end,
  };

  while (current < tokens.length) {
    const node = walk();
    if (node) {
      ast.body.push(node);
    }
  }

  return ast;
}

// Export using ES6 module syntax
export default parse;

// Support CommonJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = parse;
}