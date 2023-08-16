
class Queue {
  constructor(historyLength, events) {
    this.initialize();
    this.historyLength = historyLength;

    if (events && Array.isArray(events) && events.length) {
      this.historyLength = events.length;
      this.buffer(events);
    }
  }

  replayHistory(events) {
    for (let item of events) {
        this.enqueue(item);
    }
  }

  initializeHistory() {
    this._event = {};
    this.frontIndex = 0;
    this.backIndex = 0;
  }

  enqueueEvent(item) {
    this._event[this.backIndex] = item
    this.backIndex++

    if (this.historyLength && this.backIndex > this.historyLength) {
      this.dequeue();
    }
  }

  dequeueEvent() {
    const item = this._event[this.frontIndex]
    delete this._event[this.frontIndex]
    this.frontIndex++
    return item
  }

  get history() {
    return this._event;
  }
}

module.exports = Queue;
