'use strict';
const Logger = require('./logger').Logger;
const Typing_Time = 800;

module.exports.Messaging = {
    sendTextMessageToChannel: function(messageContent, channel) {
		channel.startTyping();
		setTimeout(function() {
			channel.stopTyping();
			channel.send(messageContent).then(message => {
				Logger.log(Logger.tag.message.text, `Sent message: ${message.cleanContent}`);
			}).catch(error => {
				Logger.log(Logger.tag.error, `Something went wrong sending a message: ${error}`);
			});
		}, Typing_Time);
	},
	
	sendTextMessageToChannelNoDelay: function(messageContent, channel) {
		channel.send(messageContent).then(message => {
			Logger.log(Logger.tag.message.text, `Sent message: ${message.cleanContent}`);
		}).catch(error => {
			Logger.log(Logger.tag.error, `Something went wrong sending a message: ${error}`);
		});
	},

    sendImageToChannel: function(imagePath, channel) {
        channel.send('', {file: imagePath}).then(message => {
            Logger.log(Logger.tag.message.image, `Sent message: ${message.attachments.first().filename}`);
        }).catch(error => {
            Logger.log(Logger.tag.error, `Something went wrong sending an image: ${error}`);
        });
    }
};