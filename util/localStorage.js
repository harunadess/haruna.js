'use strict';
const Storinator = require('./storinator');
const Logger = require('./logger').Logger;
const Storage_Root = './json/storage/';

const LocalStorage = function() {
	let _file = null, _jsonStorageObj = null, _storage = null;
	const _storinator = new Storinator();
	
	LocalStorage.prototype.setStorage = function(file) {
		return _storinator.openJSON((Storage_Root + file)).then(fileData => {
			_storage = fileData;
			_file = file;
			Logger.log(Logger.tag.file, 'Haruna has successfully read Local Storage! <3');
            Logger.log(Logger.tag.file, `current storage:\n${JSON.stringify(_storage, null, 0)}`);     
		}).catch(error => {
			Logger.log(Logger.tag.error, `Haruna's Local Storage encountered an error: ${error}`);
			throw error;
		});
	};

	LocalStorage.prototype.writeJSONLocalStorage = function(file, property, obj) {
		return this.setStorage(file).then(() => {
			_storage[property] = obj;
			return _storinator.writeJSON((Storage_Root + _file), _storage).then(() => {
				Logger.log(Logger.tag.info, `Haruna has saved local storage! <3`);
				this.setStorage(file);
			}).catch(error => {
				Logger.log(Logger.tag.error,`Haruna encountered an error while saving local storage: ${error}`);
				throw error;
			});
		}).catch(error => {
			Logger.log(Logger.tag.error, `Haruna's Local Storage encountered an error: ${error}`);
			throw error;
		});
	};

    LocalStorage.prototype.getItemFromStorage = function(property) {
        let itemToReturn = undefined;
        return this.setStorage(_file).then(() => {
			try {
				itemToReturn = _storage[property];
				Logger.log(Logger.tag.success, `Successfully found property [${property}] in Local Storage!`);
			} catch(error) {
				Logger.log(Logger.tag.error, `Local Storage property error in on ${LocalStorage.Storage_Root}${LocalStorage._file}: ${error}`);
				itemToReturn = undefined;
			}
			return itemToReturn;
		});
    };
};

module.exports = LocalStorage;