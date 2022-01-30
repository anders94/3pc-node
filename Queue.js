/*
  Queue
  =====

  Queues hold an array of functions which will be executed syncronously in
  FIFO order. New entries can be added at any time.
*/

class Queue {
    constructor() {
	this.list = [];
	this.running = false;
    }
    enqueue = async (f) => {
	if (typeof f === 'function') {
	    this.list.push(f);
	    await this.run();
	}
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
