/**
 * Created by Jorta on 20/06/2017.
 */
const Logger = require('./logger').Logger;

module.exports.Messaging = {
    sendTextMessageToChannel(messageContent, channel) {
        channel.send(messageContent).then(message => {
            Logger.log(Logger.tag.message.text, `Sent message: ${message.cleanContent}`);
        }).catch(error => {
            Logger.log(Logger.tag.error, `Something went wrong sending a message: ${error}`);
        });
    },

    sendImageToChannel(imagePath, channel) {
        channel.send('', {file: imagePath}).then(message => {
            Logger.log(Logger.tag.message.image, `Sent message: ${message.attachments.first().filename}`);
        }).catch(error => {
            Logger.log(Logger.tag.error, `Something went wrong sending an image: ${error}`);
        });
    }
};