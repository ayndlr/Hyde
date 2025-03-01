/**
 * List of token types.
 */
const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  WHITESPACE: 'WHITESPACE',
  COMMENT: 'COMMENT',
  NEWLINE: 'NEWLINE',
};

/**
 * Tokenizes the input source code.
 * @param {string} code - The source code to tokenize.
 * @returns {Array} List of tokens.
 */
function tokenize(code) {
  const tokens = [];
  let current = 0;
  let line = 1;
  let column = 0;
  
  const KEYWORDS = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'async', 'await'];
  const OPERATORS = ['+', '-', '*', '/', '=', '==', '!=', '<', '>', '>=', '<=', '&&', '||', '!', '+=', '-=', '?', '...'];
  const PUNCTUATIONS = ['(', ')', '{', '}', ';', ',', '.', '[', ']'];
  
  while (current < code.length) {
    let char = code[current];
    
    // Track line and column numbers
    if (char === '\n') {
      line++;
      column = 0;
      tokens.push({ type: TOKEN_TYPES.NEWLINE, value: char, line, start: current, end: current + 1 });
      current++;
      continue;
    } else {
      column++;
    }
    
    // Helper function to create tokens with position info
    const createToken = (type, value) => {
      return { type, value, line, start: current - value.length, end: current };
    };
    
    // Handle whitespace
    if (/\s/.test(char) && char !== '\n') {
      tokens.push(createToken(TOKEN_TYPES.WHITESPACE, char));
      current++;
      continue;
    }
    
    // Handle comments
    if (char === '/' && code[current + 1] === '/') {
      let value = '';
      while (char !== '\n') {
        value += char;
        char = code[++current];
      }
      tokens.push(createToken(TOKEN_TYPES.COMMENT, value));
      continue;
    }
    
    // Handle numbers
    if (/[0-9]/.test(char)) {
      let value = '';
      while (/[0-9]/.test(char)) {
        value += char;
        char = code[++current];
      }
      tokens.push(createToken(TOKEN_TYPES.NUMBER, value));
      continue;
    }
    
    // Handle strings
    if (char === '"' || char === "'") {
      let value = '';
      const quoteType = char;
      char = code[++current];
      while (char !== quoteType) {
        value += char;
        char = code[++current];
      }
      value += quoteType; // Include the closing quote
      tokens.push(createToken(TOKEN_TYPES.STRING, value));
      current++; // Skip the closing quote
      continue;
    }
    
    // Handle identifiers and keywords
    if (/[a-zA-Z]/.test(char)) {
      let value = '';
      while (/[a-zA-Z0-9]/.test(char)) {
        value += char;
        char = code[++current];
      }
      if (KEYWORDS.includes(value)) {
        tokens.push(createToken(TOKEN_TYPES.KEYWORD, value));
      } else {
        tokens.push(createToken(TOKEN_TYPES.IDENTIFIER, value));
      }
      continue;
    }
    
    // Handle operators
    if (OPERATORS.includes(char)) {
      let value = char;
      char = code[++current];
      if (OPERATORS.includes(value + char)) {
        value += char;
        current++;
      }
      tokens.push(createToken(TOKEN_TYPES.OPERATOR, value));
      continue;
    }
    
    // Handle punctuation
    if (PUNCTUATIONS.includes(char)) {
      tokens.push(createToken(TOKEN_TYPES.PUNCTUATION, char));
      current++;
      continue;
    }
    
    throw new TypeError('Unexpected character: ' + char);
  }
  
  return tokens;
}

// Export using ES6 module syntax
export default tokenize;

// Support CommonJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = tokenize;
}