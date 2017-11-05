const _musicPlayer = require('../musicplayer/musicPlayer');
const Logger = require('../logger').Logger;
let _content, _channel, _authorVoiceChannel, _author, _guild, _command, _args;
let mp = new _musicPlayer.MusicPlayer();

module.exports.MusicCommands = {
    processMessageIfCommandExists: function(message) {
        let response = '';
        _initialiseVariables(message);
        if(_commandExists(_command)) {
            response = _musicCommando[_command].function();
            mp.setChannel(_channel);
        }
        return response;
    }
};

let _initialiseVariables = function(message) {
    _content = message.cleanContent;
    _channel = message.channel;
    _authorVoiceChannel = message.member.voiceChannel;
    _author = message.author;
    _guild = message.guild;
    _args = _content.slice(1).split(' ');
    _command = _args.shift().toLowerCase();
};

let _commandExists = function(command) {
    return _musicCommando[command] !== undefined;
};

let _musicCommando = {
    'join': {
        'function': function() {
            if(_authorNotInVoiceChannel()) {
                return `You must be in a voice channel first desu!`;
            }
            if(_alreadyInVoiceChannel()) {
                return `Haruna is already bound to \`\`#${mp.getVoiceChannel().name}\`\`!`
            } else {
                _joinClientToVoiceChannel();
                return `Haruna is now bound to the voice channel \`\`#${mp.getVoiceChannel().name}\`\`!`;
            }
        },
        'description': 'haruna joins the vc channel you are in'
    },
    'j': {
        'function': function() {

        }
    },

    'leave': {
        'function': function() {
            let voiceChannel = mp.getVoiceChannel();
            if(voiceChannel !== undefined) {
                _clientLeaveVoiceChannel();
                return `Haruna is has left the voice channel and is no longer bound to \`\`#${voiceChannel.name}\`\`!`;
            } else {
                return `Haruna is not in a channel yet desu!`;
            }
        },
        'description': 'haruna leaves vc'
    },
    'l': {
        'function': function() {
        }
    },

    'queue': {
        'function': function() {
            if(_args[0]) {
                mp.addToEnd(_args[0], _author);
                // return '';
            } else {
                return `${_author}, if you want to add something to the queue, you must give Haruna a URL!`;
            }
        },
        'description': 'use +queue *url*, where *url* is a valid youtube url'
    },
    'q': {
        'function': function() {
        }
    },

    'play': {
        'function': function() {
            if(_alreadyInVoiceChannel()) {
                Logger.log('Mcomm', 'before play');
                mp.play();
                Logger.log('Mcomm', 'after play');
                // return '';
            } else {
                Promise.resolve(_joinClientToVoiceChannel()).then(() => {
                    mp.play();
                    // return '';
                }).catch(error => {
                    return error;
                });
            }
        },
        'description': 'plays the current song in the queue'
    },
    'p': {
        'function': function() {
        }
    },

    'pause': {
        'function': function() {
            if(_alreadyInVoiceChannel()) {
                mp.pause();
            } else {
                return `${_author}, Haruna must be in a voice channel first desu!`;
            }
        },
        'description': 'pauses audio'
    },
    'pa': {
        'function': function() {
        }
    },

    'skip': {
        'function': function() {
            // mp.skip();
        },
        'description': 'skips current track, plays next song, if one exists'
    },

    'sk': {
        'function': function() {
        }
    },


    'stop': {
        'function': function() {
            if(_alreadyInVoiceChannel()) {
                // mp.stop();
            } else {
                return `${_author}, Haruna must be in a voice channel first desu!`;
            }
        },
        'description': 'stops playing the current song and empties the queue'
    },
    's': {
        'function': function() {
        }
    },

    'showqueue': {
        'function': function() {
            mp.getQueue();
        },
        'description': 'shows the current songs in the queue'
    },

    'sq': {
        'function': function() {
        }
    },

    'remove': {
        'function': function() {
            mp.removeSongFromEnd();
        },
        'description': 'removes the last song added to the queue'
    },

    'r': {
        'function': function() {
        }
    },

    'purgequeue': {
        'function': function() {
            mp.clearQueue();
        },
        'description': 'removes all items after the currently playing song from the queue'
    },
    'pq': {
        'function': function() {
        }
    },

    'help': {
        'function': function() {
            let response = _generateHelpMessage();
            return response;
        },
        'description': 'displays this'
    },

    'setvolume': {
        'function': function() {
            let volume = _args[0];
            volume /= 100;
            mp.setVolume(volume);
        },
        'description': 'set volume to a value between 0% and 100% (default: 20%)'
    }
};

let _authorNotInVoiceChannel = function() {
    return !_authorVoiceChannel;
};

let _alreadyInVoiceChannel = function() {
    return mp.getVoiceChannel();
};

let _joinClientToVoiceChannel = function() {
    mp.setVoiceChannel(_authorVoiceChannel);
    return mp.getVoiceChannel().join()
        .then(connection => {
            mp.setConnection(connection);
            return `Haruna is connected to ${_authorVoiceChannel} desu!`;
        })
        .catch(error => {
            mp.setConnection(undefined);
            Logger.log('ERR', 'Error creating connection desu: ' + error);
            return `There was an error creating a connection desu!`;
        });
};

let _clientLeaveVoiceChannel = function() {
    if(mp.getConnection()) {
        mp.getVoiceChannel().leave();
    }
    mp.setVoiceChannel(undefined);
};

let _generateHelpMessage = function() {
    let response = '```md';
    response += '\n========= Music Help Commands ========='
        + '\nPrefix any command with "+"\n'
        + '\njoin: ' + _musicCommando.join.description
        + '\n----------------------------------------------------'
        + '\nleave: ' + _musicCommando.leave.description
        + '\n----------------------------------------------------'
        + '\nqueue: ' + _musicCommando.queue.description
        + '\n----------------------------------------------------'
        + '\nplay: ' + _musicCommando.play.description
        + '\n----------------------------------------------------'
        + '\npause: ' + _musicCommando.pause.description
        + '\n----------------------------------------------------'
        + '\nstop: ' + _musicCommando.stop.description
        + '\n----------------------------------------------------'
        + '\nshowqueue: ' + _musicCommando.showqueue.description
        + '\n----------------------------------------------------'
        + '\nremove: ' + _musicCommando.remove.description
        + '\n----------------------------------------------------'
        + '\npurgequeue: ' + _musicCommando.purgequeue.description
        + '\n----------------------------------------------------'
        + '\nhelp: ' + _musicCommando.help.description
        + '\n=================================\n```';

    return response;
};








