// TODO Parse optional comma last element.
class JsonParser {
  private i = 0;
  private inputLength: number;
  public array: unknown[];
  public positions: InputPositions;

  constructor(private input: string) {
    this.inputLength = input.length;
    const positions = this.eatArray();
    if (positions == null) {
      // TODO Move error check up
      throw this.newError('Expecting `[` here');
    }
    this.positions = positions;
    this.expectEndOfInput();
    this.array = eval(input);
  }

  // Must use any here to avoid refined type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get currentChar(): any {
    return this.input[this.i];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get nextChar(): any {
    return this.input[this.i + 1];
  }

  private get isAtEndOfInput(): boolean {
    return this.i === this.inputLength;
  }

  private moveToNextChar(): void {
    this.i++;
  }

  private sliceInput(from: number, to: number): string {
    return this.input.slice(from, to);
  }


  eatObject(): boolean {
    if (this.currentChar === '{') {
      this.moveToNextChar();
      this.skipWhitespace();

      let initial = true;
      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      while (!this.isAtEndOfInput && this.currentChar !== '}') {
        if (!initial) {
          this.eatComma();
          this.skipWhitespace();
        }
        // Ignore dangling comma.
        if (this.currentChar === '}') {
          break;
        }
        const keyEaten = this.eatString();
        if (!keyEaten) {
          this.expectObjectKey();
        }
        this.skipWhitespace();
        this.eatColon();
        this.skipWhitespace();
        const valueEaten = this.eatValue();
        if (!valueEaten) {
          throw this.newError('Expected value');
        }
        this.skipWhitespace();
        initial = false;
      }
      this.expectNotEndOfInput('}');
      // move to the next character of '}'
      this.moveToNextChar();

      return true;
    } else {
      return false;
    }
  }

  // TODO Replace with conditional types
  eatArray(): InputPositions | undefined {
    const startIndex = 0;
    if (this.currentChar === '[') {
      this.moveToNextChar();
      this.skipWhitespace();
      const start = [startIndex, this.i];
      const end = [];
      let lastPositionEnd = 0;
      const elements = [];
      let initial = true;
      while (!this.isAtEndOfInput && this.currentChar !== ']') {
        if (!initial) {
          this.skipWhitespace();
          this.eatComma();
          this.skipWhitespace();
          end.push([lastPositionEnd, this.i]);
        }
        // Dangling `,`
        if (this.currentChar === ']') {
          break;
        }
        const eaten = this.eatValue();
        if (!eaten) {
          throw this.newError('Expected value');
        }
        elements.push([lastPositionEnd, this.i]);
        lastPositionEnd = this.i;
        initial = false;
      }
      this.expectNotEndOfInput(']');
      // move to the next character of ']'
      this.moveToNextChar();
      return {start, end, elements} as InputPositions;
    } else {
      return undefined;
    }
  }

  eatValue(): boolean {
    return this.eatString() ||
    this.eatNumber() ||
    this.eatObject() ||
    (this.eatArray() === undefined? false : true) ||
    this.eatKeyword('true') ||
    this.eatKeyword('false') ||
    this.eatKeyword('null');
  }

  eatKeyword(name: string): boolean {
    if (this.sliceInput(this.i, this.i + name.length) === name) {
      this.i += name.length;
      return true;
    }
    return false;
  }

  skipWhitespace(): void {
    while (
      this.currentChar === ' ' ||
        this.currentChar === '\n' ||
        this.currentChar === '\t' ||
        this.currentChar === '\r'
    ) {
      this.moveToNextChar();
    }
  }

  eatString(): boolean {
    if (this.currentChar === '"' || this.currentChar === '\'') {
      const delimiter = this.currentChar;
      this.moveToNextChar();
      while (!this.isAtEndOfInput && this.currentChar !== delimiter) {
        if (this.currentChar === '\\') {
          if (
            this.nextChar === '"' ||
            this.nextChar === '\'' ||
              this.nextChar === '\\' ||
              this.nextChar === '/' ||
              this.nextChar === 'b' ||
              this.nextChar === 'f' ||
              this.nextChar === 'n' ||
              this.nextChar === 'r' ||
              this.nextChar === 't'
          ) {
            this.moveToNextChar();
          } else if (this.nextChar === 'u') {
            if (
              this.isHexadecimal(this.input[this.i + 2]) &&
                this.isHexadecimal(this.input[this.i + 3]) &&
                this.isHexadecimal(this.input[this.i + 4]) &&
                this.isHexadecimal(this.input[this.i + 5])
            ) {
              this.i += 5;
            } else {
              this.i += 2;
              this.expectEscapeUnicode('');
            }
          } else {
            this.expectEscapeCharacter('');
          }
        }
        this.moveToNextChar();
      }
      this.expectNotEndOfInput('"');
      this.moveToNextChar();
      return true;
    } else {
      return false;
    }
  }

  isHexadecimal(char: string): boolean {
    return (
      (char >= '0' && char <= '9') ||
        (char.toLowerCase() >= 'a' && char.toLowerCase() <= 'f')
    );
  }

  eatNumber(): boolean {
    const start = this.i;
    if (this.currentChar === '-') {
      this.moveToNextChar();
      this.expectDigit(this.sliceInput(start, this.i));
    }
    if (this.currentChar === '0') {
      this.moveToNextChar();
    } else if (this.currentChar >= '1' && this.currentChar <= '9') {
      this.moveToNextChar();
      while (this.currentChar >= '0' && this.currentChar <= '9') {
        this.moveToNextChar();
      }
    }

    if (this.currentChar === '.') {
      this.moveToNextChar();
      this.expectDigit(this.sliceInput(start, this.i));
      while (this.currentChar >= '0' && this.currentChar <= '9') {
        this.moveToNextChar();
      }
    }
    if (this.currentChar === 'e' || this.currentChar === 'E') {
      this.moveToNextChar();
      if (this.currentChar === '-' || this.currentChar === '+') {
        this.moveToNextChar();
      }
      this.expectDigit(this.input.slice(start, this.i));
      while (this.currentChar >= '0' && this.currentChar <= '9') {
        this.moveToNextChar();
      }
    }
    if (this.i > start) {
      return true;
    } else {
      return false;
    }
  }

  eatComma(): void {
    this.expectCharacter(',');
    this.moveToNextChar();
  }

  eatColon(): void {
    this.expectCharacter(':');
    this.moveToNextChar();
  }

  newError(title: string): Error {
    return new Error(`${this.printCodeSnippet(title)}`);
  }

  // error handling
  expectNotEndOfInput(expected: string): void {
    if (this.isAtEndOfInput) {
      throw this.newError(`Expecting a \`${expected}\` here`);
    }
  }

  expectEndOfInput(): void {
    if (!this.isAtEndOfInput) {
      throw this.newError('Expecting to end here');
    }
  }

  expectObjectKey(): void {
    throw this.newError(`Expecting object key here
  
  For example:
  { "foo": "bar" }
    ^^^^^`);
  }

  expectCharacter(expected: string): void {
    if (this.currentChar !== expected) {
      throw this.newError(`Expecting a \`${expected}\` here`);
    }
  }

  expectDigit(numSoFar: string): void {
    if (!(this.currentChar >= '0' && this.currentChar <= '9')) {
      throw this.newError(`Expecting a digit here
  
  For example:
  ${numSoFar}5
  ${' '.repeat(numSoFar.length)}^`);
    }
  }

  expectEscapeCharacter(strSoFar: string): void {
    throw this.newError(`Expecting escape character
  
  For example:
  "${strSoFar}\\n"
  ${' '.repeat(strSoFar.length + 1)}^^
  List of escape characters are: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u`);
  }

  expectEscapeUnicode(strSoFar: string): void {
    throw this.newError(`Expect escape unicode
  
  For example:
  "${strSoFar}\\u0123
  ${' '.repeat(strSoFar.length + 1)}^^^^^^`);
  }

  printCodeSnippet(message: string): string {
    const from = Math.max(0, this.i - 10);
    const trimmed = from > 0;
    const padding = (trimmed ? 4 : 0) + (this.i - from);
    const snippet = [
      (trimmed ? '... ' : '') + this.sliceInput(from, this.i + 1),
      ' '.repeat(padding) + '^',
      ' '.repeat(padding) + message,
    ].join('\n');
    return snippet;
  }
}

export type InputPosition = [number, number]
export type InputPositions = {start: InputPosition, end: InputPosition[], elements: InputPosition[] }

function parseJson(input: string): {array: unknown[], positions: InputPositions } {
  const parser = new JsonParser(input);
  return {
    array: parser.array,
    positions: parser.positions,
  };
}

export default parseJson;

