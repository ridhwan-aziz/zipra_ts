const default_empty_parsed_message = {
    command: null,
    arguments: null
};

const command_empty = {
    command: null,
    prefix: null,
    raw: null
}

const args_empty = {
    position: null,
    args: [null]
}

class Command {
    command; username?: string;
    constructor(
        command: string,
        username?: string
    ) {
        this.command = command;
        this.username = username;
    }
}

class Args {
    text: string;
    position: number;

    constructor(
        text: string,
        position: number
    ) {
        this.text = text;
        this.position = position;
    }
}

class Argument {
    original: string;
    position: number;
    args: [Args];

    constructor(
        original: string,
        position: number,
        args: [Args]
    ) {
        this.original = original;
        this.position = position;
        this.args = args;
    }
}

class Parser {
    text?; username: string;
    prefix = ['/', '!', '$', ',', '}'];

    constructor(
        text: string,
        username: string
    ) {
        this.text = text;
        this.username = username;
    }

    get_command() {
        if (this.text == undefined) {
            return command_empty;
        }
        var text: string = this.text;
        var has_username = false;

        if (!(this.prefix.includes(text[0]))) {
            return command_empty;
        }

        var splitted = text.split(' ')
        var command: string = splitted[0]

        /* Check for \n after split */

        if (command.indexOf("\n") > -1) {
            command = command.split('\n')[0];
        }

        /* Check for username tagging */
        // Ignore it if username is different

        if (command.indexOf('@') > -1) {
            var same_username = command.split('@')[1] == this.username ? true : false;
            if (same_username == true) {
                has_username = true;
                command = command.split('@')[0];
            } else {
                return command_empty;
            }
        }

        return {
            command: command.slice(1, command.length),
            prefix: command[0],
            raw: command
        }
    }

    get_args(position?: number) {
        if (this.text == undefined) {
            return args_empty;
        }

        const cmd = this.get_command().raw;

        if (!(cmd)) {
            return args_empty;
        }

        let text = this.text;
        let before = text.length;
        text = text.replace(cmd, '').trim();
        const origin = text;
        let after = text.length;
        const arg_pos = before - after;
        let cur_pos = arg_pos;
        
        let args = [];
        const splitted = text.split(/[\n\s\r\t]+/gmi);

        if (position && position > 0) {
            // splitted.forEach((arg) => {
            //     console.log(arg);
            //     let found = text.search(arg);
            //     let no_rep = text.length
            //     text = text.replace(arg, '').trim()
            //     let len = no_rep - text.length
            //     let json = {}
            //     args.push(json)
            // })
            for (let i = 0; i <= position; i++) {
                if (i >= splitted.length) {
                    break;
                }
                let arg = splitted[i];
                cur_pos += text.search(arg);
                let json = {
                    text: arg,
                    position: cur_pos
                }
                let no_rep = text.length;
                text = text.replace(arg, '').trim();
                cur_pos += no_rep - text.length;
                args.push(json);
            }
        }

        return {
            origin: origin,
            position: arg_pos,
            split: args
        };
    }

    parse_all(arg_pos?: number) {
        if (this.text == undefined) {
            return default_empty_parsed_message;
        }

        const cmd = this.get_command();
        const args = this.get_args(arg_pos);

        return {
            cmd: cmd,
            args: args
        }
    }
}

export { Parser }