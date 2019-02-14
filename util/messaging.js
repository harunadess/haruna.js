'use strict';
const Logger = require('./logger').Logger;
const Typing_Time = 800;
//todo: create fun embed template that may or may not be nicer
// than standard pixiv embeds
const Embed_Template = {
	//acutal post link
	title: "",
	url: "",
	color: 16312092,
	"footer": {
	  "icon_url": "",
	  "text": "daijobu desu!"
	},
	//image from danbooru, since we can get full size
	"image": {
	  "url": ""
	}
  };

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
	},

	sendEmbedToChannel: function(url, rawMessage) {
		let embed = Embed_Template;
		embed.title = url[1];
		embed.url = url[1];
		embed.image.url = url[0];

		rawMessage.channel.send('Haruna found something, desu! <3', {embed: embed}).then(message => {
			Logger.log(Logger.tag.message.image, `Sent message: ${JSON.stringify(message)}`);
        }).catch(error => {
            Logger.log(Logger.tag.error, `Something went wrong sending an embed: ${JSON.stringify(error, null, 2)}`);
        });
	}
};