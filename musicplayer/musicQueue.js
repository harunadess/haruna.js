Queue = (function() {
    function Queue() {
        this.index = -1;
        this.songs = [];
    }

    return Queue;
})();

module.exports = Queue;