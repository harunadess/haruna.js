/**
 * Created by Jorta on 20/06/2017.
 */

let _haruna = require('./haruna.js'); //for access to image stores TODO: find a better way?? || this may be the best way..
let _content, _channel, _author, _guild, _guildOwner, _command, _args;


module.exports.Commands = {
    processMessageIfCommandExists(message) {
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
    _guildOwner = _guild.owner;
    _args = _content.slice(1).split(' ');
    _command = _args.shift().toLowerCase();
};

let _commando = {
    //help command
    'help': {
        'function': function () {
            let response = _generateHelpMessage();
            return response;
        },
        'description': 'sends this message'
    },

    //hello command
    'hello': {
        'function': function () {
            let response = _generateGreetingMessage('Hello');

            if (_isAdmiral()) {
                response += ' \<3';
            }
            return response;
        },
        'description': 'sends hello to user (includes a <3 for server owner)'
    },

    //goodbye command
    'bye': {
        'function': function () {
            let response = _generateGreetingMessage('Goodbye');
            if (_isAdmiral()) {
                response += ' \<3';
            }
            return response;
        },
        'description': 'sends a goodbye to user (includes a <3 for server owner)'
    },

    //dice roll
    'roll': {
        'function': function () {
            let roll, response;
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
        'function': function () {
            let random = 4;
            let response = _author + ` your random number is ${random} desu!`;
            return response;
        },
        'description': 'generates a random number between 1 and 10'
    },

    //flip coin
    'coin': {
        'function': function () {
            let random = Math.random();
            let coinSide = _headsOrTailsFromRandomNumber(random);
            let response = _author + ` I choose ${coinSide} desu!`;
            return response;
        },
        'description': 'flips a coin, returns heads or tails'
    },

    //purge command - deletes 100 messages
    'purge': {
        'function': function () {
            let response = _bulkDeleteFromChannel(_channel);
            return response;
        },
        'description': 'purges 100 messages from the channel the command was used in'
    },

    //smug anime girl command
    'smug': {
        'function': function () {
            let pathForImage = _randomElementFromArray(_haruna.smugs);
            return pathForImage;
        },
        'description': 'sends a smug image'
    },

    //pouting anime girl command :T
    'pout': {
        'function': function () {
            let pathForImage = _randomElementFromArray(_haruna.pouts);
            return pathForImage;
        },
        'description': 'sends a pout image'
    },

    //Haruna selfie command
    'selfie': {
        'function': function () {
            let pathForImage = _randomElementFromArray(_haruna.selfies);
           return pathForImage;
        },
        'description': 'sends a haruna selfie'
    },

    //Idling text (from Kancolle) command
    'idle': {
        'function': function () {
            let randomIdle = _randomElementFromArray(_haruna.idleTexts);
            return randomIdle;
        },
        'description': 'sends an idling message'
    },

    //Sends bot to sleep after sending a message
    'sleep': {
        'function': function () {
            let response = '';
            if(_isAdmiral()) {
                _haruna.shutdownGracefully(_channel);
            }
            else {
                response = 'Sorry desu; you don\'t have permission to do that! \<3'
            }
            return response;
        },
        'description': 'Bot Owner Commands: sends bot offline'
    },

    //generate invite command
    'invite': {
        'function': function () {
            _haruna.generateSelfInvite(_channel);
            return '';
        },
        'description': 'sends an invite link'
    },

    //comfort command
    'comfort': {
        'function': function () {
            let comfortText = _randomElementFromArray(_haruna.comfortTexts);
            return comfortText;
        },
        'description': 'sends a comforting message'
    },

    //pick command
    'pick': {
        'function': function () {
            let response = '';
            if (_isNotPickCommandFormat(_content)) {
                response = 'That is not the correct format desu!';
                return response;
            } else {
                let options = _parseOptions(_content);
                let optionToSend = _randomElementFromArray(options);
                response += `I choose ${optionToSend} desu!`;
                return response;
            }
        },
        'description': 'picks random option from list given as -pick option_1 | option_2 | option_3'
    }
};

let _commandExists = function(command) {
    return _commando[command] !== null;
};

let _generateHelpMessage = function() {
    let response = '```\n';
    response += '========= Help Commands =========\n'
        + 'Prefix any command with "-"\n'
        + 'hello: ' + _commando.hello.description + '\n'
        + '----------------------------------------------------'
        + 'bye: ' + _commando.bye.description + '\n'
        + '----------------------------------------------------'
        + 'roll: ' + _commando.roll.description + '\n'
        + '----------------------------------------------------'
        + 'random: ' + _commando.roll.description + '\n'
        + '----------------------------------------------------'
        + 'coin: ' + _commando.coin.description + '\n'
        + '----------------------------------------------------'
        + 'help: ' + _commando.help.description + '\n'
        + '----------------------------------------------------'
        + 'pick: ' + _commando.pick.description + '\n'
        + '----------------------------------------------------'
        + 'purge: ' + _commando.purge.description + '\n'
        + '----------------------------------------------------'
        + 'idle: ' + _commando.idle.description + '\n'
        + '----------------------------------------------------'
        + 'invite: ' + _commando.invite.description + '\n'
        + '----------------------------------------------------'
        + 'pout: ' + _commando.pout.description + '\n'
        + '----------------------------------------------------'
        + 'selfie: ' + _commando.selfie.description + '\n'
        + '----------------------------------------------------'
        + 'sleep: ' + _commando.sleep.description + '\n'
        + '----------------------------------------------------'
        + 'smug: ' + _commando.smug.description + '\n'
        + '----------------------------------------------------'
        + 'comfort: ' + _commando.comfort.description + '\n'
        + '=================================\n```'

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

let _randomElementFromArray = function(array) {
    let pos = Math.floor(Math.random()*array.length);
    return array[pos];
};

let _bulkDeleteFromChannel = function() {
    return _haruna.deleteMessagesFromChannel(100, _channel);
};

let _isAdmiral = function() {
    return _author.id === require('./auth.json').admiralID;
};

let _isNotPickCommandFormat = function() {
    return !(_content.includes('|'));
};

let _parseOptions = function(message) {
    let options = message.slice(5).split('|');
    for(var i = 0; i < options.length; i++) {
        options[i] = options[i].trim();
    }
    return options;
};