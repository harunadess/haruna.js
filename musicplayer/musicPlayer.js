const YT = require('ytdl-core');
const Logger = require('../logger').Logger;
const Messaging = require('../messaging').Messaging;

/*
module.exports.MusicPlayer = (function() {
    function MusicPlayer() {
        this._queue = [];
        this._pointer = -1;
        this._voiceChannel = null;
        this._dispatcher = null;
        this._stream = null;
        this._connection = null;
        this._volume = 0.2;
        this._isPlaying = false; //todo: potentially implement checks on pause/resume and such
        this._isStopped = false; //todo: this may be overkill, and is already more or less implemented
    }

    MusicPlayer.prototype.addToEnd = function(songToAdd, author) {
        if(this._isValidURL(songToAdd)) {
            return new Promise((resolve, reject) => {
                this._addToQueue(songToAdd, author).then(title => {
                    return resolve(title);
                }).catch(error => {
                    return reject(error);
                });
            });
        } else {
            Logger.log('MUSIC', `Rejection of link: ${songToAdd}`);
            return `Please only use valid youtube links desu! <3`
        }
    };

    MusicPlayer.prototype._isValidURL = function(url) {
        return ((url.includes('youtu.be/')) || (url.includes('youtube.com/watch?v=')));
    };

    MusicPlayer.prototype._addToQueue = function(songToAdd, requester) {
        return new Promise((resolve, reject) => {
            YT.getInfo(songToAdd).then(info => {
                this._queue.push({
                    title: info.title,
                    url: info.video_url,
                    requester: (requester.username + '#' + requester.discriminator)
                });
                Logger.log('MUSIC', 'Added song to queue');
                resolve(`Haruna has added \`\`${this.getLastAdded().title}\`\` to the queue!`);
            }).catch(error => {
                Logger.log('ERR', 'Error getting song info: ' + error);
                reject('Error adding song to queue');
            });
        });
    };

    MusicPlayer.prototype.removeFromEnd = function() {
        if(this.hasItemsInQueue()) {
            let removedSong = this._queue.pop();
            Logger.log('MUSIC', `Removed ${removedSong.title} (requested by ${removedSong.requester} from the queue.`);
            return `Removed \`\`${removedSong.title}\`\` from the queue!\n${this.songsInQueueText()}`
        } else {
            return `The queue is empty desu! <3`;
        }
    };

    MusicPlayer.prototype.songsInQueueText = function() {
        console.log('queue length: ' + this._queue.length);
        if(this._queue.length > 1) {
            return `There are ${this._queue.length} songs in the queue! <3`;
        } else {
            return `There is 1 song in the queue! <3`;
        }
    };

    MusicPlayer.prototype.hasItemsInQueue = function() {
        return (this._queue.length > 0);
    };

    MusicPlayer.prototype.play = function() {
        if(!this._isPrepared()) {
            Logger.log('DEBUG', '_notPrepared');
            if(this.hasItemsInQueue()) {
                Logger.log('DEBUG', 'hasItemsInQueue');
                this._prepareForPlay();
                Logger.log('DEBUG', 'prepared');
                this._play();
                Logger.log('DEBUG', 'has played');
            } else {
                return `There are no songs in the queue desu!`;
            }
        } else {
            Logger.log('DEBUG', 'already prepared');
            if(this.hasItemsInQueue()) {
                Logger.log('DEBUG', 'items are in queue: pt2');
                this._play();
                Logger.log('DEBUG', 'has played: pt2');
            } else {
                Logger.log('DEBUG', 'no items in queue');
                this.stop();
                // return `There are no items in the queue desu! <3`;
            }
        }
    };

    MusicPlayer.prototype._isPrepared = function() {
        return this._connection && this._stream;
    };

    MusicPlayer.prototype._prepareForPlay = function() {
        this._createStream();
    };

    MusicPlayer.prototype._createStream = function() {
        let nextSong = this._getNextInQueue().url;
        this._stream = YT(nextSong, {
            audioonly: true
        });
        Logger.log('DEBUG', '_createStream');
    };

    MusicPlayer.prototype._play = function() {
        this._dispatcher = this._connection.playStream(this._stream, {
            volume: this._volume
        });
        Logger.log('DEBUG', '_play => playStream');
        this._dispatcher.on('end', () => {
            Logger.log('DEBUG', '_play => onEnd');
            return this._streamEnd();
        });
        this._dispatcher.on('error', () => {
            Logger.log('DEBUG', '_play => onError');
            return this._streamError();
        });
    };

    MusicPlayer.prototype._getNextInQueue = function() {
        this._pointer++;
        return this._queue[this._pointer];
    };

    MusicPlayer.prototype._streamEnd = function() {
        if(this._hasNext()) {
            Logger.log('DEBUG', '_streamEnd & hasNext');
            this.playNext();
        } else {
            return this.stop();
        }
    };

    MusicPlayer.prototype._hasNext = function() {
        Logger.log('DEBUG', '_hasNext');
        return this._queue[this._pointer + 1] !== undefined;
    };

    MusicPlayer.prototype.playNext = function() {
        Logger.log('DEBUG', 'playNext');
        this._createStream();
        Logger.log('DEBUG', 'playNext: createStream');
        this.play();
        Logger.log('DEBUG', 'playNext: play');
    };

    MusicPlayer.prototype.stop = function() {
        Logger.log('DEBUG', 'stop');
        this._dispatcher.pause();
        this._stream = null;
        this._connection = null;
        this._dispatcher = null;
        this._pointer = -1;
        return `Haruna has stopped playback and ${this.clearQueue()}`;
    };

    MusicPlayer.prototype.pause = function() {
        this._dispatcher.pause();
        return `Haurna has paused the current song desu! <3`;
    };

    MusicPlayer.prototype.resume = function() {
        this._dispatcher.resume();
        return `Haruna is resuming play desu! <3`;
    };

    MusicPlayer.prototype.skip = function() {
        this.playNext();
        return `Haruna is skipping this song desu! <3`;
    };

    MusicPlayer.prototype._streamError = function() {
        try {
            this.stop();
            this._voiceChannel.leave();
            this._voiceChannel = null;
        } catch(err) {
            Logger.log('MUSIC', 'dispatcher error: ' + err);
            return `Something went wrong desu, leaving voice channel`;
        }
        return `Something went wrong with the stream desu! Try asking me to join and resume play <3`;
    };

    MusicPlayer.prototype.printQueue = function() {
        let printedQueue = 'There are ' + this._queue.length + ' songs in the queue!\n```==Play Queue==\n';
        if(this.hasItemsInQueue()) {
            for(let i = 0; i < this._queue.length; i++) {
                printedQueue += (i + 1) + '. ' + this._queue[i].title
                    + '\n\t#Requested by ' + this._queue[i].requester
                    + '\n';
            }
        } else {
            printedQueue += `-no songs in queue desu-`
        }
        printedQueue += '```';
        return printedQueue;
    };

    MusicPlayer.prototype.clearQueue = function() {
        this._queue = [];
        this._pointer = -1;
        return 'Haruna has cleared the queue! <3';
    };

    MusicPlayer.prototype.setVoiceBroadcastChannel = function(voiceChannel) {
        this._voiceChannel = voiceChannel;
    };

    MusicPlayer.prototype.getVoiceBroadcastChannel = function() {
        return this._voiceChannel;
    };

    MusicPlayer.prototype.setConnection = function(connection) {
        this._connection = connection;
    };

    MusicPlayer.prototype.getConnection = function() {
        return this._connection;
    };

    MusicPlayer.prototype.setVolume = function(volume) {
        if(this._dispatcher) {
            if(volume > 1) {
                this._volume = 1;
            } else if(volume < 0) {
                this._volume = 0;
            } else {
                this._volume = volume;
            }
            this._dispatcher.setVolume(this._volume);
        }

        return `Set volume to ${this._volume*100}% desu! <3`;
    };

    MusicPlayer.prototype.getCurrent = function() {
        return this._queue[this._pointer];
    };

    MusicPlayer.prototype.getLastAdded = function() {
        if(this._queue.length > 1) {
            return this._queue[this._queue.length - 1];
        } else if(this._queue.length === 1) {
            return this._queue[0];
        } else {
            return `There is nothing in the queue desu!`;
        }
    };

    return MusicPlayer;
})(this.MusicPlayer || (this.MusicPlayer = {}));*/

module.exports.MusicPlayer = (function() {
    function MusicPlayer() {
        // this._queue = new Queue(); //todo: create queue obj to make the mp less polluted
        this._queue = {
            index: -1,
            songs: []
        };

        this._voiceChannel = undefined;

        this._player = {
            connection: undefined,
            dispatcher: undefined,
            stream: undefined
        };

        this._options = {
            volume: 0.2
        };

        this.musicInfo = { //todo: make separate obj to avoid having ulgy obj like this
            channel: undefined,
            messaging: Messaging,
            send: function(info) {
                this.messaging.sendTextMessageToChannel(info, this.channel);
            }
        };
    }

    MusicPlayer.prototype.setChannel = function(channel) {
        this.musicInfo.channel = channel;
    };

    MusicPlayer.prototype.addToEnd = function(songToAdd, requester) {
        if(_isValidUrl(songToAdd)) {
           Promise.resolve(this._addSongToQueue(songToAdd, requester)).then(songInfo => {
               this.musicInfo.send(songInfo);
           }).catch(error => {
               console.log(error);
               return `Oops, there was an error ${error}`;
           });
        } else {
            Logger.log('MUSIC', 'Invalid youtube link supplied');
            return `Please only use valid youtube links desu!`;
        }
    };

    let _isValidUrl = function(url) {
        return ((url.includes('youtu.be')) || (url.includes('youtube.com/watch?v=')));
    };

    MusicPlayer.prototype._addSongToQueue = function(songToAdd, requester) {
        return new Promise((resolve, reject) => {
            YT.getInfo(songToAdd).then(info => {
                this._queue.songs.push({
                    title: info.title,
                    url: info.video_url,
                    requester: (requester.username + '#' + requester.discriminator)
                });
                Logger.log('MUSIC', 'Added song = ' + JSON.stringify(this._getLastSongInQueue()) + '\nto the queue');
                this.musicInfo.send(`Haruna has added \`\`${this._getLastSongInQueue().title}\`\` to the queue!`);
            }).catch(error => {
                Logger.log('ERROR', 'Error getting song info: ' + error);
                reject('Error adding song to the queue :c');
            });
        });
    };

    MusicPlayer.prototype._getLastSongInQueue = function() {
        return this._queue.songs[this._queue.songs.length - 1];
    };

    MusicPlayer.prototype.getQueue = function() {
       let printedQueue = 'There are ' + this._queue.songs.length + ' songs in the queue!\n```==Play Queue==\n';
        if(this._hasSongsInQueue()) {
            if(this._queue.index > -1) {
                printedQueue += 'Now playing: ' + (this._queue.index + 1) + '. ' + this._queue.songs[this._queue.index].title
                    + '\n===================================================\n';
            }
            for(let i = 0; i < this._queue.songs.length; i++) {
                printedQueue += (i + 1) + '. ' + this._queue.songs[i].title
                    + '\n\t#Requested by ' + this._queue.songs[i].requester
                    + '\n';
            }
        } else {
            printedQueue += `There are no songs in the queue desu!`;
        }
        printedQueue += '```';
        this.musicInfo.send(printedQueue);
    };

    MusicPlayer.prototype._hasSongsInQueue = function() {
        if(!this._queue || !this._queue.songs) {
            return false;
        }
        return this._queue.songs.length > 0;
    };

    MusicPlayer.prototype.removeSongFromEnd = function() {
        if(this._hasSongsInQueue()) {
            let removedSong = this._queue.songs.pop();
            Logger.log('MUSIC', `Removed ${removedSong.title} from the queue!`);
            let songsInQueue = this._songsInQueue();
            this.musicInfo.send(`Removed \`\`${removedSong.title} requested by ${removedSong.requester}\`\` from the queue.
             There are now ${songsInQueue} in the queue! <3`);
        } else {
            this.musicInfo.send(`The queue is empty desu! <3`);
        }
    };

    MusicPlayer.prototype._songsInQueue = function() {
        return this._queue.songs.length;
    };

    MusicPlayer.prototype._songsInQueueText = function() {
        Logger.log('MUSIC', `Queue length: ${this._queue.songs.length}`);
        if(this._songsInQueue() > 1) {
            return `There are ${this._queue.songs.length} songs in the queue! <3`;
        } else if(this._songsInQueue() === 1) {
            return `There is 1 song in the queue! <3`;
        } else {
            return `There are no songs in the queue!`;
        }
    };

    MusicPlayer.prototype.play = function() {
        this._createAudioStream();
        this._play();

        this._player.dispatcher.on('end', () => {
            Logger.log('MUSIC', 'Stream end');
            console.log('queue:', JSON.stringify(this._queue.songs));
            console.log('index:', this._queue.index);
            if(this._hasNextSong()) {
                return this.play();
            } else {
                //leave and reset
                this.clearQueue();
                this.musicInfo.send(`Queue ended, leaving vc <3`);
                this._voiceChannel.leave();
            }
        });
        this._player.dispatcher.on('error', error => {
            Logger.log('MUSIC', 'Stream error: ' + error);
        });

        this.musicInfo.send(`Now playing: \`\`${this.getCurrentSong().title}\`\``);
    };

    //note: at this point of first play, dispatcher will always be undefined
    MusicPlayer.prototype._isPrepared = function() {
        return (this._player.connection !== undefined
            && this._player.dispatcher !== undefined);
    };

    MusicPlayer.prototype._createAudioStream = function() {
        let nextSong = this._advanceQueue();
        console.log('queueindex:', this._queue.index);
        console.log(JSON.stringify(nextSong));
        this._player.stream = YT(nextSong.url, { audioonly: true });
        Logger.log('MUSIC', 'Created stream');
    };

    MusicPlayer.prototype._play = function() {
        this._player.dispatcher = this._player.connection.playStream(
            this._player.stream,
            { volume: this._options.volume }
        );
        Logger.log('MUSIC', 'Playing...');
    };

    MusicPlayer.prototype._hasNextSong = function() {
        return this._queue.songs[(this._queue.index + 1)] !== undefined;
    };

    MusicPlayer.prototype._advanceQueue = function() {
        let nextSong = this._queue.songs[(this._queue.index + 1)];
        console.log('advancequeue:nextsong->', JSON.stringify(nextSong));
        if(nextSong) {
            this._queue.index++;
            return nextSong;
        }
        Logger.log('MUSIC', 'No next song in queue');
        return false;
    };

    MusicPlayer.prototype.skip = function() {
        let current = this.getCurrentSong();
        this.musicInfo.send(`Skipping \`\`${current.title}\`\`...`);
        this._player.stream.end();
    };

    MusicPlayer.prototype.getCurrentSong = function() {
        if(this._hasSongsInQueue()) {
            return this._queue.songs[this._queue.index];
        } else {
            throw new Error('Queue error: no items in queue!', this._queue.songs);
        }
    };

    MusicPlayer.prototype.setVoiceChannel = function(voiceChannel) {
        this._voiceChannel = voiceChannel;
    };

    MusicPlayer.prototype.getVoiceChannel = function() {
        return this._voiceChannel;
    };

    MusicPlayer.prototype.clearQueue = function() {
        this._queue.songs = [];
        this._queue.index = -1;
        this.musicInfo.send(`Haruna has cleared the queue!`);
    };

    MusicPlayer.prototype.setConnection = function(connection) {
        this._player.connection = connection;
    };

    MusicPlayer.prototype.getConnection = function() {
        return this._player.connection;
    };

    MusicPlayer.prototype.setVolume = function(volume) {
        if(volume > 100) {
            volume = 100;
        } else if(volume < 0) {
            volume = 0;
        }
        this._options.volume = volume;
    };

    return MusicPlayer;
})(this.MusicPlayer || (this.MusicPlayer = {}));

let Queue = (function() {
    function Queue() {
        this.index = -1;
        this.songs = [];
    }

    return Queue;
})(this.Queue || (this.Queue = {}));