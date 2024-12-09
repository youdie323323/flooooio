import { UserData } from "../wave/WavePool";
import { CommandPointer, GoPointer } from "./command";
import { Token, Type } from "./commandLexer";

/**
 * Type alias to convert lexer type to primitive types.
 */
type TypeToPrimitive<T extends Type> =
    | T extends Type.STRING ? string :
    | T extends Type.NUMBER ? number :
    | T extends Type.BOOL ? boolean : any;

// Allows for a field which can dynamically prompt
type NonProvided<T extends Type> = (userData: UserData, args: string[]) => TypeToPrimitive<T>;

/**
 * Force require arg object to type-safe arg.
 */
export function createTypedArg<T extends Type>(arg: Omit<Arg<T>, 'type'> & { type: T }): Arg<T> {
    return arg;
}

// Represents a placeholder which can occur after a command parent
export interface Arg<T extends Type = Type> {
    name: string;
    description: string;
    openEnded: boolean;

    type: T;
    required: boolean;
    nonProvidedValue?: NonProvided<T>;
}

// Represents what is returned from the parseArgs function
export interface ArgValue {
    parent: ArgPointer;
    values: Token[];
}

// Represents the bundler for the ArgValue
export class ArgContext {
    command: CommandPointer;
    header: string;
    tokens: Token[];
    args: ArgValue[];
    text: string[];

    constructor(source: Partial<ArgContext>) {
        Object.assign(this, source);
    }

    public pos(node: number): ArgPointer {
        if (node >= this.command.args.length || node < 0) {
            if (node < 0 || this.args.length <= 0 || !this.args[this.args.length - 1].parent.openEnded) {
                return null;
            }

            return this.command.args[this.command.args.length - 1];
        }

        return this.command.args[node];
    }
}

export type ArgPointer = GoPointer<Arg<Type>>;