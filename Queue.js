class Queue {
    constructor() {
	this.list = [];
	this.running = false;
    }
    enqueue = async (f) => {
	this.list.push(f);
	this.run();
    }
    dequeue = () => this.list.shift();
    isEmpty = () => this.list.length == 0;
    length = () => this.list.length;
    run = async () => {
	if (!this.running) {
	    this.running = true;
	    while (!this.isEmpty())
		await this.dequeue()();
	    this.running = false;
	}
    };
}

module.exports = Queue;
