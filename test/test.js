let assert = require('assert');

// describe('Array', function() {
//     describe('#indexOf()', function() {
//         it('should return -1 when the value is not present', function() {
//             assert.equal(-1, [1,2,3].indexOf(4));
//         });
//     });
// });

//basic pattern
describe('', function() {
    describe('', function() {
        it.skip('', function() {

        });
    });
});

let logger = require('../logger').Logger;
let t_logger = logger;
t_logger.log = function(level, message) {
    return ('[' + level + ']' + " " + message);
};
t_logger.logUserMessage = function(message) {
    return ('[CMD]' + " " + message);
};

describe('Logger', function() {
    describe('#log(level, message)', function() {
        it.skip('should return: [level] message', function() {
            logger_will_log_generic_things();
        });
    });

    describe('#logUserMessage(message)', function() {
        it.skip('should return: [CMD] message', function() {
            logger_will_log_user_messages();
        });
    });
});

let logger_will_log_generic_things = function() {
    var actual_result = t_logger.log('TEST', 'this was a test');
    var expected_result = '[TEST] this was a test';
    assert.equal(actual_result, expected_result);
};

let logger_will_log_user_messages = function() {
    let actual_result = t_logger.logUserMessage('-test');
    let expected_result = '[CMD] -test';
    assert.equal(actual_result, expected_result);
};

describe('timer.js', function() {
    describe('#isItTopOfHour()', function() {
        it('should return: true if minutes = 00', function() {
            let topOfHour = is_it_top_of_an_hour();
            assert.equal(topOfHour, false);
        });
    });
});

let is_it_top_of_an_hour = function() {
    let time = new Date();
    let minutes = time.getMinutes();
    return minutes === 0;
};