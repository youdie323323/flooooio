// Represents a tokenizing type
enum Type {
    STRING,
    NUMBER,
    BOOL,
    SPACE,
    BLANK,

    // This supports all the token types
    ANY
}

type Wrapper = String | Number | Boolean | BigInt | Symbol | undefined | null;

type WrapperToPrimitive<T extends Wrapper> =
    | T extends String ? string :
    | T extends Number ? number :
    | T extends Boolean ? boolean :
    | T extends BigInt ? bigint :
    | T extends Symbol ? symbol :
    | T extends undefined ? undefined :
    | T extends null ? null : 
    | T;

// Represents an argument arbitrary within the source
class Token {
    type: Type;
    literal: any;

    constructor(source: Partial<Token>) {
        Object.assign(this, source);
    }

    /**
     * Convert any literal type to primitive value.
     */
    public toPrimitive?<T extends Wrapper>(
        a: new (...args: any[]) => T
    ): WrapperToPrimitive<T> {
        return new a(this.literal) as any;
    }
}

// Unicode utilities
const isDigit = (char: string) => '0' <= char && char <= '9';
const isLetter = (char: string) => /\p{L}/u.test(char);
const isSpace = (char: string) => /\t|\n|\v|\f|\r| |[\u0085\u00A0]/.test(char) || /\p{White_Space}/u.test(char);

const PARSE_BOOL_KEYWORDS = [
    "t", "T", "on", "true", "TRUE", "True",
    "f", "F", "off", "false", "FLASE", "False"
];
const parseBool = (str: string): boolean => {
    switch (str) {
        case "t": case "T": case "on": case "true": case "TRUE": case "True":
            return true
        case "f": case "F": case "off": case "false": case "FALSE": case "False":
            return false
    }

    return false
};

// Implements a base tokenization process
function tokenize(text: string, tokens: Token[] = []): Token[] {
    const index: string[] = text.split('');

    for (let pos = 0; pos < index.length; pos++) {
        const char = index[pos];

        switch (char) {
            case ' ':
                if (pos === 0) {
                    tokens.push(new Token({ literal: '', type: Type.BLANK }));
                }

                tokens.push(new Token({
                    literal: char,
                    type: Type.SPACE
                }));

                if (pos + 1 >= index.length) {
                    tokens.push(new Token({ literal: '', type: Type.BLANK }));
                    return tokens;
                }

                break;

            case '"':
            case '\'':
                tokens.push(new Token({
                    type: Type.STRING,
                    literal: char
                }));

                let stringValue = '';
                for (let i = pos + 1; i < index.length; i++) {
                    const nextChar = index[i];
                    stringValue += nextChar;
                    if (nextChar === char) {
                        break;
                    }
                }

                tokens[tokens.length - 1].literal = stringValue.slice(0, -1);
                pos += stringValue.length;
                
                break;

            default:
                if (isDigit(char)) {
                    let numberValue = char;
                    for (let i = pos + 1; i < index.length; i++) {
                        const nextChar = index[i];
                        if (!isDigit(nextChar) && nextChar !== '.') {
                            break;
                        }
                        numberValue += nextChar;
                    }

                    pos += numberValue.length - 1;

                    if (numberValue.includes('.')) {
                        tokens.push(new Token({
                            type: Type.STRING,
                            literal: numberValue
                        }));
                        continue;
                    }

                    tokens.push(new Token({
                        type: Type.NUMBER,
                        literal: parseInt(numberValue)
                    }));

                } else if (isLetter(char)) {
                    let word = char;
                    for (let i = pos + 1; i < index.length; i++) {
                        const nextChar = index[i];
                        if (isSpace(nextChar) || nextChar === '"') {
                            break;
                        }
                        word += nextChar;
                    }

                    pos += word.length - 1;

                    if (PARSE_BOOL_KEYWORDS.includes(word)) {
                        tokens.push(new Token({
                            type: Type.BOOL,
                            literal: parseBool(word),
                        }));
                    } else {
                        tokens.push(new Token({
                            type: Type.STRING,
                            literal: word
                        }));
                    }
                }
        }
    }

    return tokens;
}

export { Type, Token, tokenize }