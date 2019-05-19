'use strict';
const Logger = require('./logger').Logger;
const Typing_Time = 800;
const Embed_Template = {
	//acutal post link
	title: "",
	url: "",
	color: 16750848,
	"footer": {
	  "icon_url": "https://cdn.discordapp.com/avatars/285402443041210368/0d1ec0dad4879ec386e6bd621cc11f3e.png?size=2048",
	  "text": "daijobu desu! | powered by *booru"
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
			return channel.send(messageContent).then(message => {
				Logger.log(Logger.tag.message.text, `Sent message: ${message.cleanContent}`);
			}).catch(error => {
				Logger.log(Logger.tag.error, `Something went wrong sending a message: ${error}`);
			});
		}, Typing_Time);
	},
	
	sendTextMessageToChannelNoDelay: function(messageContent, channel) {
		return channel.send(messageContent).then(message => {
			Logger.log(Logger.tag.message.text, `Sent message: ${message.cleanContent}`);
		}).catch(error => {
			Logger.log(Logger.tag.error, `Something went wrong sending a message: ${error}`);
		});
	},

    sendImageToChannel: function(imagePath, channel) {
		return channel.send('', {file: imagePath}).then(message => {
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

		rawMessage.channel.startTyping();
		setTimeout(function() {
			rawMessage.channel.stopTyping();
			return rawMessage.channel.send('Haruna found something, desu! <3', {embed: embed}).then(message => {
				Logger.log(Logger.tag.message.embed, `Sent message: ${message.cleanContent}, ${message.embeds}`);
			}).catch(error => {
				Logger.log(Logger.tag.error, `Something went wrong sending an embed: ${error.message}`);
			});
		}, Typing_Time);
	}
};