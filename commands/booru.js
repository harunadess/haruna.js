'use strict';
const Logger = require('../util/logger').Logger;

//todo: fix image posting stuff
// ideally, we want to list what tags were sent and stuff, but..
const BooruSearch = function() {
	const Booru = require('danbooru');
	const login = require('../../auth/auth.json').danbooru.login;
	const key = require('../../auth/auth.json').danbooru.key;
	const danbooru = new Booru(`${login}:${key}`);
	const pixiv_base = 'https://pixiv.net/member_illust.php?mode=medium&illust_id=';
	this._content;

	BooruSearch.prototype.search = function(content) {
		Logger.log(Logger.tag.info, `Booru received ${content}`);

		this._initialiseVariables(content);
		Logger.log(Logger.tag.info, `_content: ${this._content}`);

		let tagsStr = this._parseTags(this._isSafe());
		Logger.log(Logger.tag.info, `tagsStr: ${tagsStr}`);
		return this._search(tagsStr).then(postUrl => {
			return postUrl;
		});
	};

	BooruSearch.prototype._initialiseVariables = function(content) {
		this._content = content.replace('haruna, search', '');
		this._content = this._content.replace(/for/, '');
		this._content = this._content.trim();
	};

	BooruSearch.prototype._parseTags = function(isSafe) {
		let tagsStr = isSafe ? 'rating:safe ' : '';
		this._content = this._content.replace('safe', '');
		tagsStr += this._content.trim();
		return tagsStr;
	}

	BooruSearch.prototype._isSafe = function() {
		return this._content.includes('safe');
	};

	BooruSearch.prototype._search = function(tags) {
		return danbooru.posts({tags: tags, random: true}).then(posts => {
			let index = Math.floor(Math.random()*posts.length);
			let post = posts[index];

			if(post !== undefined) {
				let postSrc = ['', ''];
				postSrc[0] = post.file_url;
				if(_isPixivSource(post.source)) {
					let pixivId = _findPixivID(post.source);
					postSrc[1] = pixiv_base + pixivId;
				} else {
					postSrc[1] = post.source;
				}
				postSrc[1] = danbooru.url(postSrc[1]).href;
				console.log(postSrc);
				return postSrc;
			} else {
				return `haruna couldn't find anything, desu!`;
			}
		});
	};
};

let _findPixivID = function(src) {
	return src.substr(src.search(/[0-9]{8}/), 8);
};

let _isPixivSource = function(src) {
	return src.includes('pximg.net')
		|| src.includes('pixiv.net');
}

module.exports = BooruSearch;
