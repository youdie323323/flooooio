import { logger } from "../main";
import { UserData } from "../wave/WavePool";
import { Arg, ArgContext, ArgPointer, ArgValue } from "./commandArgs";

import { Token, tokenize, Type } from "./commandLexer";
import root from "./commandRoot";

// Represents the config for each individual command
export class Command {
    private parent: CommandPointer;
    public aliases: string[];
    public description: string;
    // public permissions: string[]
    public subcommands: CommandPointer[] = [];
    public args: ArgPointer[] = [];

    // Required
    public commandFunc: CommandFunc;

    constructor(source: Partial<CommandPointer>) {
        Object.assign(this, source);
    }

    /**
     * Register a new command into the subcommand for the root.
     */
    public newCommand(cmd: CommandPointer): CommandPointer {
        const middlewareBreak = cmd.commandFunc;

        // Middleware for logging on command execution
        cmd.commandFunc = (ac: ArgContext, u: UserData): RespondValue => logger.region(() => {
            using _guard = logger.metadata({
                waveClientId: u.waveClientId,
                waveRoomClientId: u.waveRoomClientId,
            });

            logger.info("User invoked command");

            return middlewareBreak(ac, u);
        });

        cmd.parent = this;
        this.subcommands.push(cmd);

        logger.region(() => {
            using _guard = logger.metadata({
                aliases: cmd.aliases.join(","),
                parentAliases: cmd.parent.aliases.join(","),
            });

            logger.info("Command registerd");
        })

        return cmd;
    }

    /**
     * Indexes and categorizes subcommands.
     */
    private indexSubcommands(alias: string): CommandPointer {
        let currentNode: CommandPointer = this;
        if (currentNode == null) {
            return null;
        }

        for (const cmd of currentNode.subcommands) {
            if (!cmd.aliases.includes(alias.split("=")[0])) {
                continue;
            }

            return cmd;
        }

        return null;
    }

    /**
     * Indexes and categorizes commands & subcommands.
     */
    public indexCommands(args: string[]): CommandPointer {
        let currentNode: CommandPointer = this;
        while (true) {
            const index = currentNode.indexSubcommands(args[0]);

            if (index == null && index !== root) {
                return currentNode;
            }

            args = args.slice(1);
            if (args.length < 1 && index !== root) {
                return index;
            }

            currentNode = index;
        }
    }

    /**
     * Find all the parents of a command.
     */
    public parents(): CommandPointer[] {
        const commands: CommandPointer[] = [];

        let currentNode: CommandPointer = this;
        while (true) {
            if (currentNode.parent == null) {
                return commands;
            }

            commands.push(currentNode.parent);
            currentNode = commands[commands.length - 1];
        }
    }

    public parseArgs(args: string[], text: string[], userData: UserData): ArgContext | Error {
        const tokens = tokenize(args.join(" "), []);

        const ctx: ArgContext = new ArgContext({
            command: this,
            tokens: [],
            args: [],
            text: text,
        });

        for (let pos = 0; pos < tokens.length; pos++) {
            if (pos >= this.args.length) {
                break;
            }

            if (tokens[pos].type === Type.SPACE) {
                tokens.splice(pos, 1);
                pos--;
                continue;
            }

            if (tokens[pos].type === Type.BLANK) {
                tokens[pos].type = this.args[pos].type;
            }

            // Type checks the value
            if (tokens[pos].type !== this.args[pos].type && this.args[pos].type !== Type.ANY) {
                return new Error(`Type mismatch in the argument ${this.args[pos].name}.`);
            }

            ctx.args.push({
                values: [tokens[pos]],
                parent: this.args[pos],
            });

            ctx.tokens.push(tokens[pos]);
            if (!this.args[pos].openEnded) {
                continue;
            }

            const indexTokens = tokens.slice(pos + 1);
            for (let i = 0; i < indexTokens.length; i++) {
                let indexToken = indexTokens[i];

                if (indexToken.type === Type.SPACE) {
                    indexTokens.splice(i, 1);
                    i--;
                    continue;
                }

                if (indexToken.type === Type.BLANK) {
                    indexToken.type = this.args[pos].type;
                }

                if (indexToken.type !== this.args[pos].type && this.args[pos].type !== Type.ANY) {
                    return new Error(`Type mismatch in the argument ${this.args[pos].name}.`);
                }

                ctx.tokens.push(indexTokens[i]);
                ctx.args[ctx.args.length - 1].values.push(indexTokens[i]);
            }

            break;
        }

        if (ctx.tokens.length === 0 && this.args.length > 0) {
            ctx.tokens.push(new Token({
                type: this.args[0].type,
                literal: ""
            }));
        }

        for (const arg of this.args.slice(ctx.args.length)) {
            if (arg.required) {
                return new Error(`Please provide the argument ${arg.name}.`);
            }

            let provided = "";

            if (typeof arg.nonProvidedValue === 'function') {
                provided = String(arg.nonProvidedValue(userData, args));
            }

            const tokens = tokenize(provided, []);

            if (tokens.length > 0 && tokens[0].type !== arg.type && arg.type !== Type.ANY) {
                return new Error(`Type mismatch in the argument ${arg.name}.`);
            }

            ctx.args.push({
                parent: arg,
                values: tokens,
            });
        }

        return ctx;
    }

    public async execute(userData: UserData, args: string[]): RespondValue {
        if (args.length === 0 || args[0].length === 0) {
            return null;
        }

        const cmd = this.indexCommands(args);
        const parents = cmd.parents();
        parents.concat(cmd).forEach(parent => {
            /*
            if functions.CanAccessThemPermissions(session.User, parent.Permissions...) {
                continue
            }
            return session.ExecuteBranding(make(map[string]any), "command_access_denied.tfx")
            */
        });

        const ctx = cmd.parseArgs(args.slice(parents.length), args, userData);
        if (ctx instanceof Error) {
            return ctx;
        }

        if (parents.length - 1 >= 1) {
            ctx.header = args[parents.length - 1].split("=").slice(1).join("=");
        }

        if (!cmd.commandFunc) {
            return null;
        }

        const err = await cmd.commandFunc(ctx, userData);
        if (!err) {
            return null;
        }

        return err;
    }
}

export type Nil = null;

export type GoPointer<T> = T | Nil;

export type CommandPointer = GoPointer<Command>;

export type RespondValue = Promise<string | Error> | Nil;

/**
 * Converts a GoError to a string.
 * If the GoError is null (nil), returns an empty string.
 * If the GoError is an Error, returns its toString() result.
 * @param error - The GoError to convert.
 * @returns A string representation of the error or an empty string.
 */
export async function goErrorToString(error: RespondValue): Promise<string> {
    try {
        const resolvedError = await error;

        if (typeof resolvedError === "string") {
            return resolvedError;
        }

        return resolvedError?.message || ""; // Ensure resolvedError is not null
    } catch (err) {
        // Catch unexpected Promise rejections and convert them to strings
        return err instanceof Error ? err.toString() : String(err);
    }
}

// This will called upon whenever the command is executed
export type CommandFunc = (ctx: ArgContext, userData: UserData) => RespondValue;