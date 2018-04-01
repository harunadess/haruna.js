'use strict';
const fs = require('fs');
const Logger = require('./logger').Logger;

const Storinator = function() {
	Storinator.prototype._openFile = function(file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, 'utf8', (error, fileData) => {
				if(error) {
					Logger.log(Logger.tag.error, `Error opening file ${file} - ${error}`);
					reject(error);
				}
				Logger.log(Logger.tag.file, `Successfully opened file ${file}`);
				resolve(fileData);
			});
		});
	};

	Storinator.prototype._writeFile = function(file, data) {
		return new Promise((resolve, reject) => {
			fs.writeFile(file, data, error => {
				if(error) {
					Logger.log(Logger.tag.error, `Error writing file ${file} - ${error}`);
					reject(error);
				}
				Logger.log(Logger.tag.file, `Successfully wrote to file ${file}`);
				resolve(true);
			});
		});
	};

	Storinator.prototype.openJSON = function(jsonFile) {
		return this._openFile(jsonFile).then(data => {
			let jsonObj;
			try {
				jsonObj = JSON.parse(data);
			} catch(error) {
				Logger.log(Logger.tag.error, `Error parsing JSON ${jsonFile} in Storinator: ${error}`);
				jsonObj = undefined;
			}
			return jsonObj;
		}).catch(error => {
			Logger.log(Logger.tag.error, `Error opening file ${jsonFile} - ${error}`);
			return error;
		});
	};

	Storinator.prototype.writeJSON = function(jsonFile, obj) {
		let jsonObj = JSON.stringify(obj, null, 2);
		return this._writeFile(jsonFile, jsonObj).then(() => {
			Logger.log(Logger.tag.file, `Successfully wrote JSON to file ${jsonFile}`);
		}).catch(error => {
			Logger.log(Logger.tag.error, `Error writing JSON to file ${jsonFile} - ${error}`);
		});
	};
}

module.exports = Storinator;