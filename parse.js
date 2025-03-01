// The parser function converts the token stream into a simple AST.
// In this example, we build a "Program" node whose body is a list of
// "ExpressionStatement" nodes.

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
export default function parse(tokens) {
  let current = 0
  // Peek at the current token without consuming it.
  function peek() {
    return tokens[current];
  }
  
  // Return the next token and advance.
  function next() {
    return tokens[current++];
  }
  
  // Parse a single expression statement.
  function parseExpressionStatement() {
    let startToken = peek();
    let node = {
      type: "ExpressionStatement",
      tokens: [],
      range: [startToken.range[0], null],
      loc: {
        start: startToken.loc.start,
        end: null
      }
    };
    
    // Read tokens until a semicolon or newline is encountered.
    while (current < tokens.length && peek().type !== "Punctuation" && peek().type !== "NewLine") {
      let token = next();
      node.tokens.push(token);
    }
    
    // Update node's range and location from the last token.
    let lastToken = node.tokens[node.tokens.length - 1];
    if (lastToken) {
      node.range[1] = lastToken.range[1];
      node.loc.end = lastToken.loc.end;
    } else {
      node.range[1] = startToken.range[1];
      node.loc.end = startToken.loc.end;
    }
    return node;
  }
  
  // Build the root "Program" node.
  let ast = {
    type: "Program",
    body: [],
    tokens: tokens,
    range: [
      tokens.length ? tokens[0].range[0] : 0,
      tokens.length ? tokens[tokens.length - 1].range[1] : 0
    ],
    loc: {
      start: tokens.length ? tokens[0].loc.start : { line: 1, column: 0 },
      end: tokens.length ? tokens[tokens.length - 1].loc.end : { line: 1, column: 0 }
    }
  };
  
  // Parse tokens into statements.
  while (current < tokens.length) {
    let token = peek();
    
    // Skip whitespace and newlines at the start of a statement.
    if (token.type === "Whitespace" || token.type === "NewLine") {
      next();
      continue;
    }
    
    // Parse an expression statement.
    let stmt = parseExpressionStatement();
    ast.body.push(stmt);
    
    // Consume a semicolon or newline if present.
    if (current < tokens.length && (peek().value === ";" || peek().type === "NewLine")) {
      next();
    }
  }
  
  return ast;
}