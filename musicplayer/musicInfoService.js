const Messaging = require('../util/messaging').Messaging;

MusicInfoService = (function() {
	function MusicInfoService() {
		this.channel = undefined;
		this.messaging = Messaging;
		
		this.send = function(info) {
			this.messaging.sendTextMessageToChannel(info, this.channel);
		}
	}

	return MusicInfoService;
})();

module.exports = MusicInfoService;