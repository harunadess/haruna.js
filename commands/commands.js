/**
 * Created by Jorta on 20/06/2017.
 */
let _haruna = require('../index.js'); //for access to image stores and client methods
let _args, _author, _channel, _command, _content, _guild;


module.exports.Commands = {
    processMessageIfCommandExists: function(message) {
        let response = '';
        _initialiseVariables(message);
        if(_commandExists(_command)) {
            response = _commando[_command].function();
        }
        return response;
    }
};

let _initialiseVariables = function(message) {
    _content = message.cleanContent;
    _channel = message.channel;
    _author = message.author;
    _guild = message.guild;
    _args = _content.slice(1).split(' ');
    _command = _args.shift().toLowerCase();
};

let _commandExists = function(command) {
    return _commando[command] !== undefined;
};

let _commando = {
    //help command
    'help': {
        'function': function() {
            return _generateHelpMessage();
        },
        'description': 'sends this message'
    },

    //hello command
    'hello': {
        'function': function() {
            let response = _generateGreetingMessage('Hello');

            if(_isAdmiral()) {
                response += ' \<3';
            }
            return response;
        },
        'description': 'sends hello to user (includes a \<3 for server owner)'
    },

    //goodbye command
    'bye': {
        'function': function() {
            let response = _generateGreetingMessage('Goodbye');
            if(_isAdmiral()) {
                response += ' \<3';
            }
            return response;
        },
        'description': 'sends a goodbye to user (includes a \<3 for server owner)'
    },

    //dice roll
    'roll': {
        'function': function() {
            let response, roll;
            if(_isNumber(parseInt(_args[0]))) {
                roll = _randomWholeNumber(parseInt(_args[0]));
            } else if(_args.length < 1) {
                roll = _randomWholeNumber(6);
            } else {
                response = 'incorrect parameter desu!';
                return response;
            }
            response = _author + ` you rolled a ${roll} desu!`;
            return response;
        },
        'description': 'rolls a user specified die (default of 6 sides if no arguments specified)'
    },

    //random number
    'random': {
        'function': function() {
            let random = 4;
            return _author + ` your random number is ${random} desu!`;
        },
        'description': 'generates a random number between 1 and 10'
    },

    //flip coin
    'coin': {
        'function': function() {
            let random = Math.random();
            let coinSide = _headsOrTailsFromRandomNumber(random);
            return _author + ` I choose ${coinSide} desu!`;
        },
        'description': 'flips a coin, returns heads or tails'
    },

    //purge command - deletes 100 messages //TODO: look into how to delete things again
    'purge': {
        'function': function() {
            let response = '';
            if(_channel.type === 'text') {
                response = _bulkDeleteFromChannel(_channel);
            } else {
                response = 'This command can only be used in text channel desu!';
            }

            return response;
        },
        'description': 'purges 100 messages from the channel the command was used in'
    },

    //smug anime girl command
    'smug': {
        'function': function() {
            let pos = _randomPositionInArray(_haruna.smugs.length);
            return _haruna.smugs[pos];
        },
        'description': 'sends a smug image'
    },

    //pouting anime girl command :T
    'pout': {
        'function': function() {
            let pos = _randomPositionInArray(_haruna.pouts.length);
            return _haruna.pouts[pos];
        },
        'description': 'sends a pout image'
    },

    //Haruna selfie command
    'selfie': {
        'function': function() {
            let pos = _randomPositionInArray(_haruna.selfies.length);
            return _haruna.selfies[pos];
        },
        'description': 'sends a haruna selfie'
    },

    //Idling text (from Kancolle) command
    'idle': {
        'function': function() {
            let pos = _randomPositionInArray(_haruna.idleTexts.length);
            return _haruna.idleTexts[pos];
        },
        'description': 'sends an idling message'
    },

    //Sends bot to sleep after sending a message
    'sleep': {
        'function': function() {
            let response = '';
            if(_isAdmiral()) {
                _haruna.shutdownGracefully(_channel);
            } else {
                response = _author + ' sorry desu, you don\'t have permission to do that! \<3'
            }
            return response;
        },
        'description': 'Bot Owner Commands: sends bot offline'
    },

    //generate invite command
    'invite': {
        'function': function() {
            _haruna.generateSelfInvite(_channel);
            return '';
        },
        'description': 'sends an invite link'
    },

    //comfort command
    'comfort': {
        'function': function() {
            let pos = _randomPositionInArray(_haruna.comfortTexts.length);
            return _haruna.comfortTexts[pos];
        },
        'description': 'sends a comforting message'
    },

    //pick command
    'pick': {
        'function': function() {
            let response = _author;
            if(_isNotPickCommandFormat(_content)) {
                response = ' That is not the correct format desu!';
                return response;
            } else {
                let options = _parseOptions(_content);
                let pos = _randomPositionInArray(options.length);
                let optionToSend = options[pos];
                response += ` I choose ${optionToSend} desu!`;
                return response;
            }
        },
        'description': 'picks random option from list given as -pick option_1 | option_2 | option_3'
    },

    //set game command (bot owner)
    'set_game': {
        'function': function() {
            let response = '';
            if(_isAdmiral()) {
                let game = '';
                for(let i = 0; i < _args.length; i++) {
                    game += _args[i] + " ";
                }
                response = _haruna.setGameWithResponse(game);
            } else {
                response = _author + ' sorry desu, you lack the permissions to do that! <3';
            }
            return response;
        },
        'description': `sets the bot's current activity (bot owner only)`
    },

    //replies with user's avatar
    'avatar': {
        'function': function() {
            let targetUser = _args[0];
            if(targetUser === '' || !targetUser) {
                return _author + ', ' + _author.avatarURL;
            } else {
                return _author + ', ' + targetUser.avatarURL;
            }
        },
        'description': `replies with author's avatar`
    },

    'hourly': {
        'function': function() {
            return _haruna.toggleIntervals('hourly', _author);
        },
        'description': 'sets/unsets hourly notifications'
    },

    'chat': {
        'function': function() {
            return _haruna.setConversationEngineActive();
        },
        'description': 'sets/unsets chatting'
    }
};

let _generateHelpMessage = function() {
    let response = '```md';
    response += '\n========= Help Commands ========='
        + '\nPrefix any command with "-"\n'
        + '\nhello: ' + _commando.hello.description
        + '\n----------------------------------------------------'
        + '\nbye: ' + _commando.bye.description
        + '\n----------------------------------------------------'
        + '\nroll: ' + _commando.roll.description
        + '\n----------------------------------------------------'
        + '\nrandom: ' + _commando.roll.description
        + '\n----------------------------------------------------'
        + '\ncoin: ' + _commando.coin.description
        + '\n----------------------------------------------------'
        + '\nhelp: ' + _commando.help.description
        + '\n----------------------------------------------------'
        + '\npick: ' + _commando.pick.description
        + '\n----------------------------------------------------'
        + '\npurge: ' + _commando.purge.description
        + '\n----------------------------------------------------'
        + '\nidle: ' + _commando.idle.description
        + '\n----------------------------------------------------'
        + '\ninvite: ' + _commando.invite.description
        + '\n----------------------------------------------------'
        + '\npout: ' + _commando.pout.description
        + '\n----------------------------------------------------'
        + '\nselfie: ' + _commando.selfie.description
        + '\n----------------------------------------------------'
        + '\nsleep: ' + _commando.sleep.description
        + '\n----------------------------------------------------'
        + '\nsmug: ' + _commando.smug.description
        + '\n----------------------------------------------------'
        + '\ncomfort: ' + _commando.comfort.description
        + '\n----------------------------------------------------'
        + '\nset_game: ' + _commando.set_game.description
        + '\n----------------------------------------------------'
        + '\navatar: ' + _commando.avatar.description
        + '\n----------------------------------------------------'
        + '\nhourly: ' + _commando.hourly.description
        + '\n=================================\n```';

    return response;
};

let _generateGreetingMessage = function(messageType) {
    return messageType + " " + _author + "!";
};

let _isNumber = function(value) {
    return !isNaN(value);
};

let _randomWholeNumber = function(num) {
    return Math.floor(Math.random()*num + 1);
};

let _headsOrTailsFromRandomNumber = function(random) {
    return (random === 0 ? 'heads' : 'tails');
};

let _randomPositionInArray = function(upperBound) {
    let pos = Math.floor(Math.random()*upperBound);
    return pos;
};

let _bulkDeleteFromChannel = function() {
    return _haruna.deleteMessagesFromChannel(50, _channel);
};

let _isAdmiral = function() {
    return _author.id === require('./json/auth.json').admiralID;
};

let _isNotPickCommandFormat = function() {
    return !(_content.includes('|'));
};

let _parseOptions = function(message) {
    let options = message.slice(5).split('|');
    for(let i = 0; i < options.length; i++) {
        options[i] = options[i].trim();
    }
    return options;
};