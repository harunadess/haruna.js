'use strict';

const Messaging = require('../util/messaging').Messaging;
const Logger = require('../util/logger').Logger;

const Reminders = function(localStorage) {
    this.localStorage = localStorage;

    Reminders.prototype.createUserReminder = function(author, reminder) {
        /**
         *  Parse reminder into parts - text, time
         *  Create reminder object
         *  Add reminder object into local storage
         *  Tell user
         *  Actually tell user
         *  
         * 
         * 
         *  THEN: somehow use local storage persistence.
         *  i.e.
         *  1. run initialise function
         *      1.1. function checks local storage
         *      1.2. add reminders to timeouts list/queue
         *      1.3. after reminder is triggered, tell user
         *      1.4. after telling user, remove from queue.
         *  ....
         *  4. PROFIT
        */
    };
};

module.exports = Reminders;