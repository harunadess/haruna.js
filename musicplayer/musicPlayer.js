'use strict';
const YT = require('ytdl-core');
const Logger = require('../util/logger').Logger;
const Queue = require('./musicQueue');
const MusicInfoService = require('./musicInfoService');
const Admiral_Id = require('../json/auth.json').admiralID;
// const musicRoot = require('../json/paths/audio.json').musicRoot;

//todo: add checks so can not play after resuming
//todo: better error handling/notification

module.exports.MusicPlayer = (function() {
    function MusicPlayer() {
        this._queue = new Queue();
        this._voiceChannel = undefined;

		this._states = {
			stopped: 0,
			paused: 1,
			playing: 2,
			stopped: 3
		}

        this._player = {
            connection: undefined,
            dispatcher: undefined,
			stream: undefined,
			activeState: this._states.stopped
		};

        this._options = {
            volume: 0.15
        };

        this.musicInfo = new MusicInfoService();
    }

    MusicPlayer.prototype.setChannel = function(channel) {
        this.musicInfo.channel = channel;
    };

    MusicPlayer.prototype.addToEnd = function(songToAdd, requester) {
        if(_isValidUrl(songToAdd)) {
           Promise.resolve(this._addSongToQueue(songToAdd, requester)).then(songInfo => {
               Logger.log('MUSIC', 'Added song = ' + JSON.stringify(songInfo, null, '\t') + ' to the queue');
               this.musicInfo.send(`Haruna has added \`\`${songInfo.title}\`\` to the queue!`);
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
                resolve(this._getLastSongInQueue());
            }).catch(error => {
                Logger.log('ERROR', 'Error getting song info: ' + error);
                reject('Error adding song to the queue :c');
            });
        });
    };

    MusicPlayer.prototype._addLocalSongToQueue = function(songToAdd, requester) {
        return new Promise((resolve, reject) => {
            let files = require('../json/paths/audio.json').files;
            let song = this._findSong(files, songToAdd);
            if(song) {
                this._queue.songs.push({
                    title: song.title,
                    url: song.url,
                    requester: (requester.username + '#' + requester.discriminator)
                });
                resolve(this._getLastSongInQueue());
            } else {
                Logger.log('ERROR', 'Error adding song to queue: song undefined');
                reject('Error adding song to queue :c');
            }
        });
    };

    MusicPlayer.prototype._findSong = function(files, songToAdd) {
        return files.find((item) => {
            if(songToAdd.toLowerCase() === item.title.toLowerCase()) {
                return item;
            }
        });
    };

    MusicPlayer.prototype.playLocalSoundClip = function(clipTitle, requester) {
        if(clipTitle === undefined || typeof clipTitle !== 'string') {
            return `Please give me a title of a sound clip desu!`;
        }
        return Promise.resolve(this._addLocalSongToQueue(clipTitle.toString(), requester)).then(songInfo => {
            Logger.log('MUSIC', 'Added song = ' + JSON.stringify(songInfo, null, '\t') + ' to the queue');
            this.musicInfo.send(`Haruna has added \`\`${songInfo.title}\`\` to the queue!`);

            this._playLocal(songInfo);
        }).catch(error => {
            console.log(error);
            this.musicInfo.send('Haruna cannot find or play the specified file. Make sure you typed it correctly desu!');
            return `Oops, there was an error ${error}`;
        });
    };

    MusicPlayer.prototype._playLocal = function(songInfo) {
        let delay = 2000;
        setTimeout(() => {
            this._player.dispatcher = this._player.connection.playFile(musicRoot.concat(songInfo.url));   
            this._player.dispatcher.on('end', () => {
                Logger.log('MUSIC', 'Stream end');
                console.log('queue:', JSON.stringify(this._queue.songs));
                this.clearQueue();
                this.musicInfo.send(`The queue has ended!`);
                this._voiceChannel.leave();
                this._voiceChannel = undefined;
                this._player.activeState = this._states.stopped;
                this._player.connection = undefined;
                this.musicInfo.send('Haruna will now leave vc \<3');
                Logger.log('MUSIC', 'active state: ' + this._getActiveState());
            });
            this._player.dispatcher.on('error', error => {
                Logger.log('MUSIC', 'Stream error: ' + error);
                this.musicInfo.send('<@'+ Admiral_Id + '>, there was an error! Check the captain\'s log \<3');

                this._player.activeState = this._states.stopped;
                Logger.log('MUSIC', 'active state: ' + this._getActiveState());
            });
        }, delay);
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
            this.musicInfo.send(`Removed \`\`${removedSong.title}\`\` from the queue. There's now ${songsInQueue} song(s) in the queue! <3`);
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
		if(this._player.activeState !== this._states.paused) {
			Logger.log('MUSIC', 'active state: ' + this._getActiveState());
			
			this._createAudioStream();
			this._play();

			this._player.dispatcher.on('end', () => {
				Logger.log('MUSIC', 'Stream end');
				console.log('queue:', JSON.stringify(this._queue.songs));
				if(this._hasNextSong()) {
					return this.play();
				} else {
					//leave and reset
					this.clearQueue();
					this.musicInfo.send(`The queue has ended!`);
					this._voiceChannel.leave();
					this._voiceChannel = undefined;
					this._player.activeState = this._states.stopped;
					this._player.connection = undefined;
					this.musicInfo.send('Haruna will now leave vc \<3');
					Logger.log('MUSIC', 'active state: ' + this._getActiveState());
				}
			});
			this._player.dispatcher.on('error', error => {
				Logger.log('MUSIC', 'Stream error: ' + error);
				this.musicInfo.send('<@'+ Admiral_Id + '>, there was an error! Check the captain\'s log \<3');

				this._player.activeState = this._states.stopped;
				Logger.log('MUSIC', 'active state: ' + this._getActiveState());
			});
	
			this.musicInfo.send(`Now playing: \`\`${this.getCurrentSong().title}\`\``);
		} else  {
			this.resume();
		}
	};
	
	MusicPlayer.prototype._getActiveState = function() {
		let activeState = this._player.activeState;
		if(activeState === this._states.playing) {
			return 'Playing';
		} else if(activeState === this._states.paused) {
			return 'Paused';
		} else if(activeState === this._states.stopped) {
			return 'Stopped';
		}
		return 'Unknown';
	}

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
            {volume: this._options.volume}
        );
		Logger.log('MUSIC', 'Playing...');
		this._player.activeState = this._states.playing;


		Logger.log('MUSIC', 'active state: ' + this._getActiveState());
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

    MusicPlayer.prototype.pause = function() {
		this._player.dispatcher.pause();
		this._player.activeState = this._states.paused;
		Logger.log('MUSIC', 'active state: ' + this._getActiveState());
        this.musicInfo.send('Haruna is now paused!');
    };

    MusicPlayer.prototype.resume = function() {
		this._player.dispatcher.resume();
		this._player.activeState = this._states.playing;
		Logger.log('MUSIC', 'active state: ' + this._getActiveState());
        this.musicInfo.send('Haruna has now resumed!');
    };

    MusicPlayer.prototype.stop = function() {
		this._player.dispatcher.end();
    };

    MusicPlayer.prototype.getCurrentSong = function() {
        if(this._hasSongsInQueue()) {
            return this._queue.songs[this._queue.index];
        } else {
            return 'Queue error: no items in queue!';
        }
    };

    MusicPlayer.prototype.setVoiceChannel = function(voiceChannel) {
        this._voiceChannel = voiceChannel;
    };

    MusicPlayer.prototype.getVoiceChannel = function() {
        return this._voiceChannel;
    };

    MusicPlayer.prototype.clearQueue = function(purge) {
        this._queue.songs = [];
		this._queue.index = -1;

		if(purge) {
			this.musicInfo.send(`Haruna has cleared the queue!`);			
		}
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
        if(this._player.dispatcher) {
            this._player.dispatcher.setVolume(this._options.volume);
        }
        this.musicInfo.send(`Haruna has set the volume to ${(volume*100)}%!`);
    };

    return MusicPlayer;
})(this.MusicPlayer || (this.MusicPlayer = {}));