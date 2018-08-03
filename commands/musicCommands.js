'use strict';
const _musicPlayer = require('../musicplayer/musicPlayer');
const Logger = require('../util/logger').Logger;
let _args, _author, _authorVoiceChannel, _channel, _command, _content;
let mp = new _musicPlayer.MusicPlayer();

module.exports.MusicCommands = {
    processMessageIfCommandExists(message) {
        let response = '';
        _initialiseVariables(message);
        if(_commandExists(_command)) {
            response = _musicCommando[_command].function();
            mp.setChannel(_channel);
        } else if(_shortHandCommandExists(_command)) {
            response = _shortHandCommando[_command].function();
            mp.setChannel(_channel);
        } else {
            response = `${_author}, Haruna does not know that command desu!`;
        }
        return response;
    }
};

let _initialiseVariables = function(message) {
    _content = message.cleanContent;
    _channel = message.channel;
    _authorVoiceChannel = message.member.voiceChannel;
    _author = message.author;
    _args = _content.slice(1).split(' ');
    _command = _args.shift().toLowerCase();
};

let _commandExists = function(command) {
    console.log('command -->', command);
    return _musicCommando[command] !== undefined;
};

let _shortHandCommandExists = function(command) {
    return _shortHandCommando[command] !== undefined;
}

let _musicCommando = {
    'join': {
        'function'() {
            if(_authorNotInVoiceChannel()) {
                return `You must be in a voice channel first desu!`;
            }
            if(_alreadyInVoiceChannel()) {
                return `Haruna is already bound to \`\`#${mp.getVoiceChannel().name}\`\`!`;
            } else {
                _joinClientToVoiceChannel();
                return `Haruna is now bound to the voice channel \`\`#${mp.getVoiceChannel().name}\`\`!`;
            }
        },
        'description': 'haruna joins the vc channel you are in'
    },

    'leave': {
        'function'() {
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

    'queue': {
        'function'() {
            if(_args[0]) {
                mp.addToEnd(_args[0], _author);
            } else {
                return `${_author}, if you want to add something to the queue, you must give Haruna a URL!`;
            }
        },
        'description': 'use +queue <url> to add to the queue'
    },

    'play': {
        'function'() {
            if(_alreadyInVoiceChannel()) {
                mp.play();
            } else {
                Promise.resolve(_joinClientToVoiceChannel()).then(() => {
                    mp.play();
                }).catch(error => {
                    Logger.log('CMD', 'There was an error in the play command: ' + JSON.stringify(error));
                    return error;
                });
            }
        },
        'description': 'plays the current song in the queue'
    },

    'pause': {
        'function'() {
            if(_alreadyInVoiceChannel()) {
                mp.pause();
            } else {
                return `${_author}, Haruna must be in a voice channel first desu!`;
            }
        },
        'description': 'pauses the current song'
    },

    'skip': {
        'function'() {
            mp.skip();
        },
        'description': 'skips current song, plays next song, if one exists'
    },


    'resume': {
        'function'() {
            mp.resume();
        },
        'description': 'resumes playing current song'
    },


    'stop': {
        'function'() {
            if(_alreadyInVoiceChannel()) {
                mp.stop();
            } else {
                return `${_author}, Haruna must be in a voice channel first desu!`;
            }
        },
        'description': 'stops playing the current song and empties the queue'
    },

    'showqueue': {
        'function'() {
            mp.getQueue();
        },
        'description': 'shows the current songs in the queue'
    },

    'remove': {
        'function'() {
            mp.removeSongFromEnd();
        },
        'description': 'removes the last song added to the queue'
    },

    'purgequeue': {
        'function'() {
            mp.clearQueue('purge mf');
        },
        'description': 'removes all items after the currently playing song from the queue'
    },

    'help': {
        'function'() {
            let response = _generateHelpMessage();
            return response;
        },
        'description': 'displays this'
    },

    'setvolume': {
        'function'() {
            let volume = _args[0];
            volume /= 100;
            mp.setVolume(volume);
        },
        'description': 'set volume to a value between 0% and 100% (default: 15%)'
    },

    /*'local': {
        'function': function() {
            let args = _args.reduce((prevItem, item) => {return prevItem.concat(' ', item);});
            if(!_alreadyInVoiceChannel()) {
                Promise.resolve(_joinClientToVoiceChannel()).then(() => {
                    mp.playLocalSoundClip(args, _author).catch(error => {
                      Logger.log(Logger.tag.error, `Haruna has an error in her music player: ${error}`);
                    });
                }).catch(error => {
                    Logger.log('CMD', 'There was an error in the local command: ' + JSON.stringify(error));
                    return error;
                });
            } else {
                mp.playLocalSoundClip(args, _author).catch(error => {
                    Logger.log(Logger.tag.error, `Haruna has an error in her music player: ${error}`);
                  });
            }
        },
        'description': 'plays a local audio clips'
    }*/
};

let _shortHandCommando = {
    'j': {
        'function': _musicCommando.join.function
    },

    'l': {
        'function': _musicCommando.leave.function
    },

    'q': {
        'function': _musicCommando.queue.function
    },

    'p': {
        'function': _musicCommando.play.function
    },

    'pa': {
        'function': _musicCommando.pause.function
    },

    'sk': {
        'function': _musicCommando.skip.function
    },

    're': {
        'function': _musicCommando.resume.function
    },

    's' : {
        'function': _musicCommando.stop.function
    },

    'sq': {
        'function': _musicCommando.showqueue.function
    },

    'r': {
        'function': _musicCommando.remove.function
    },

    'pq': {
        'function': _musicCommando.purgequeue.function
    },

    'h': {
        'function': _musicCommando.help.function
    },

    'v': {
        'function': _musicCommando.setvolume.function
    }
}

let _authorNotInVoiceChannel = function() {
    return !_authorVoiceChannel;
};

let _alreadyInVoiceChannel = function() {
    return mp.getVoiceChannel() !== undefined;
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
    _authorVoiceChannel = undefined;
};

let _generateHelpMessage = function() {
    let response = '```css';
    response += '\n========= Music Help Commands ========='
        + '\nPrefix any command with "+"\n'
        + '\n[join|j]: ' + _musicCommando.join.description
        + '\n----------------------------------------------------'
        + '\n[leave|l]: ' + _musicCommando.leave.description
        + '\n----------------------------------------------------'
        + '\n[queue|q]: ' + _musicCommando.queue.description
        + '\n----------------------------------------------------'
        + '\n[play|p]: ' + _musicCommando.play.description
        + '\n----------------------------------------------------'
        + '\n[pause|p]: ' + _musicCommando.pause.description
        + '\n----------------------------------------------------'
        + '\n[resume|re]: ' + _musicCommando.resume.description
        + '\n----------------------------------------------------'
        + '\n[stop|s]: ' + _musicCommando.stop.description
        + '\n----------------------------------------------------'
        + '\n[showqueue|sq]: ' + _musicCommando.showqueue.description
        + '\n----------------------------------------------------'
        + '\n[remove|r]: ' + _musicCommando.remove.description
        + '\n----------------------------------------------------'
        + '\n[purgequeue|pq]: ' + _musicCommando.purgequeue.description
        + '\n----------------------------------------------------'
        + '\n[setvolume|v]: ' + _musicCommando.setvolume.description
        + '\n----------------------------------------------------'
        + '\n[help|h]: ' + _musicCommando.help.description
        + '\n=================================\n```';

    return response;
};