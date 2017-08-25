const YT = require('ytdl-core');
const Logger = require('./logger').Logger;

module.exports.MusicPlayer = (function() {
    function MusicPlayer() {
        this._queue = [];
        this._pointer = -1;
        this._voiceChannel = undefined;
        this._dispatcher = undefined;
        this._stream = undefined;
        this._connection = undefined;
        this._volume = 1;
        this._isPlaying = false; //todo: potentially implement checks on pause/resume and such
        this._isStopped = false; //todo: this may be overkill, and is already more or less implemented
    }

    MusicPlayer.prototype.addToEnd = function(songToAdd, author) {
        if(this._isValidURL(songToAdd)) {
            this._addToQueue(songToAdd, this._queue, author);
            Logger.log('MUSIC', `Added ${songToAdd} to the queue.`);
            return `Added \`\`${songToAdd}\`\` to the queue!`;
        } else {
            Logger.log('MUSIC', `Rejection of link: ${songToAdd}`);
            return `Please only use valid youtube links desu! <3`
        }
    };

    MusicPlayer.prototype._isValidURL = function(url) {
        return ((url.includes('youtu.be/')) || (url.includes('youtube.com/watch?v=')));
    };

    MusicPlayer.prototype._addToQueue = function(songToAdd, queue, requester) {
        return YT.getInfo(songToAdd).then(info => {
            queue.push({
                title: info.title,
                url: info.video_url,
                requester: (requester.username + '#' + requester.discriminator)
            });
        }).catch(error => {
            Logger.log('ERR', 'Error getting song info: ' + error);
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
            if(this.hasItemsInQueue()) {
                this._prepareForPlay();
                this._play();
            } else {
                return `There are no songs in the queue desu!`;
            }
        } else {
            if(this.hasItemsInQueue()) {
                this.playNext();
            } else {
                return `There are no items in the queue desu! <3`;
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
        let nextSong = this._nextInQueue().url;
        this._stream = YT(nextSong, {
            audioonly: true
        });
    };

    MusicPlayer.prototype._play = function() {
        this._dispatcher = this._connection.playStream(this._stream, {
            volume: this._volume
        });
        this._dispatcher.on('end', () => {
            return this._streamEnd();
        });
        this._dispatcher.on('error', () => {
            return this._streamError();
        });
        return `Now playing: \`\`${this.getCurrent().title}\`\`! (position ${(this._pointer + 1)}/${this._queue.length})`;
    };

    MusicPlayer.prototype._nextInQueue = function() {
        this._pointer++;
        return this._queue[this._pointer];
    };

    MusicPlayer.prototype._streamEnd = function() {
        if(this._hasNext()) {
            this.playNext();
        } else {
            this.stop();
            this._voiceChannel.leave();
            this._voiceChannel = null;
            return `Queue is empty desu! Haruna is disconnecting from voice chat`;
        }
    };

    MusicPlayer.prototype._hasNext = function() {
        return this._queue[this._pointer + 1];
    };

    MusicPlayer.prototype.playNext = function() {
        this._createStream();
        this._play();
    };

    MusicPlayer.prototype.stop = function() {
        this._dispatcher.end();
        this._stream = null;
        this._connection = null;
        this.clearQueue();
        return `Haruna has stopped playback and cleared the queue <3`;
    };

    MusicPlayer.prototype._streamError = function() {
        try {
            this.stop();
            this._voiceChannel.leave();
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
                printedQueue += (i+1) + '. ' + this._queue[i].title
                    + '\n\t-Requested by ' + this._queue[i].requester
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
        this._pointer = 0;
        return 'Haruna has cleared the queue! <3';
    };

    MusicPlayer.prototype.setVoiceChannel = function(voiceChannel) {
        this._voiceChannel = voiceChannel;
    };

    MusicPlayer.prototype.getVoiceChannel = function() {
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
})(this.MusicPlayer || (this.MusicPlayer = {}));