const fs = require('fs');
const Logger = require('./logger').Logger;
const Storage_Root = '../json/storage/';
const File_Write_Root = './json/storage/';

let localStorage = function() {
    let _file = null, _jsonStorageObj = null, _storage = null;

    localStorage.prototype.setStorage = function(file) {
        try {
            _storage = require(Storage_Root + file);   
            _file = file;
            Logger.log(Logger.tag.file, 'Haruna has successfully read Local Storage! <3');
            Logger.log(Logger.tag.file, `current storage:\n${JSON.stringify(_storage, null, 0)}`);         
        } catch(error) {
            Logger.log(Logger.tag.file, `Haruna's Local Storage encountered an error: ${error}`);
        }
    };

    localStorage.prototype.writeJSONLocalStorage = function(file, property, obj) {
        if(file !== _file) {
            this.setStorage(file);
        }
        try {
            _storage[property] = obj;
        } catch(error) {
            Logger.log(Logger.tag.error, `Local Storage property error on ${Storage_Root}${_file}: ${error}`)
        }
        _jsonStorageObj = JSON.stringify(_storage, null, 2);
        fs.writeFile(File_Write_Root + _file, _jsonStorageObj, error => {
            if(error) {
                Logger.log(Logger.tag.error, `Haruna encountered an error writing to Local Storage: ${error}`);
                return;
            }
            Logger.log(Logger.tag.file, 'Haruna successfully wrote to Local Storage! <3');
        });
        this.setStorage(_file);
    };

    localStorage.prototype.getItemFromStorage = function(property) {
        let itemToReturn = undefined;
        this.setStorage(_file);
        try {
            itemToReturn = _storage[property];
            Logger.log(Logger.tag.success, `Successfully found property [${property}] in Local Storage!`);
        } catch(error) {
            Logger.log(Logger.tag.error, `Local Storage property error in on ${localStorage.Storage_Root}${localStorage._file}: ${error}`);
            itemToReturn = undefined;
        }
        return itemToReturn;
    }
}

module.exports = localStorage;