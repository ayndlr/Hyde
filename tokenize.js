// The tokenizer function takes a source string and returns an array of tokens.
export default function tokenize(source) {
  const keywords = ['let','const','var','if','else','while','for','function','async', 'await']
  const tokens = []
  let current = 0;
  let line = 1;
  let column = 0;
  
  // State variables to track if we are inside a string or a regex literal.
  let insideString = false;
  let stringDelimiter = null; // Will be either ' or "
  let insideRegex = false;
  
  // Helper to add a token with proper location info.
  function addToken(type, value, start, end, loc) {
    tokens.push({
      type,
      value,
      range: [start, end],
      loc
    });
  }
  
  while (current < source.length) {
    let char = source[current]
    let tokenStart = current
    let startLine = line;
    let startColumn = column;
    
    // Handle newline characters.
    if (char === "\n") {
      // Only treat as a 'real' newline if we're not inside a regex.
      if (!insideString && !insideRegex) {
        addToken("Newline", char, tokenStart, ++tokenStart, createLoc(startLine, startColumn, line, ++column))
        current++;
        line++;
        column = 0;
        continue;
      }
    }
    // Handle whitespace (spaces, tabs, etc.) except newline (already processed).
    if (/\s/.test(char)) {
      addToken(
        "Whitespace",
        char,
        tokenStart,
        tokenStart + 1,
        createLoc(startLine, startColumn, line, column + 1)
      );
      current++;
      column++;
      continue;
    }
    
    // Handle regex literal.
    if (char === "/" && !insideString) {
      // This is a very simplified check.
      if (!insideRegex) {
        insideRegex = true;
      } else {
        insideRegex = false;
      }
      addToken(
        "Regex",
        char,
        tokenStart,
        tokenStart + 1,
        createLoc(startLine, startColumn, line, column + 1)
      );
      current++;
      column++;
      continue;
    }

    // Handle numbers: For simplicity, we handle only integers.
    if (/[0-9]/.test(char)) {
      let numValue = char;
      current++;
      column++;
      while (current < source.length && /[0-9]/.test(source[current])) {
        numValue += source[current];
        current++;
        column++;
      }
      addToken(
        "Numeric",
        numValue,
        tokenStart,
        current,
        createLoc(startLine, startColumn, line, column)
      );
      continue;
    }

    // Handle identifiers: letters, underscores, etc.
    if (/[a-zA-Z_]/.test(char)) {
      let idValue = char;
      current++;
      column++;
      while (current < source.length && /[a-zA-Z0-9_]/.test(source[current])) {
        idValue += source[current];
        current++;
        column++;
      }
      // Treat certain identifiers as keywords.
      let type = (keywords.includes(idValue))
        ? "Keyword" : "Identifier";
      addToken(
        type,
        idValue,
        tokenStart,
        current,
        createLoc(startLine, startColumn, line, column)
      );
      continue;
    }
    
    // For any other character, treat it as punctuation.
    addToken(
      "Punctuation",
      char,
      tokenStart,
      tokenStart + 1,
      createLoc(startLine, startColumn, line, column + 1)
    );
    current++;
    column++;
  }
  
  return tokens;
}



// Utility function to create location object
function createLoc(startLine, startColumn, endLine, endColumn) {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}