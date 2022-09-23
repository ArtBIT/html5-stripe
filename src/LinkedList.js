// Doubly Linked List implementation

export class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

export class LinkedList {
  constructor(head = undefined) {
    this.clear();
    if (head !== undefined) {
      this.append(head);
    }
  }
  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.length = 0;
  }
  push(data) {
    const node = new ListNode(data);
    this.current = node;
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
      this.current = node;
      this.length++;
      return;
    }
    this.tail.next = node;
    node.prev = this.tail;
    this.tail = node;
    this.length++;
  }
  pop() {
    return this.remove(this.length - 1);
  }
  unshift(data) {
    const node = new ListNode(data);
    this.current = node;
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
      this.length++;
      return;
    }
    this.head.prev = node;
    node.next = this.head;
    this.head = node;
    this.length++;
  }
  shift() {
    return this.remove(0);
  }
  remove(position) {
    let node = this.head;
    let index = 0;
    while (node) {
      if (index === position) {
        // hotwire
        if (node.prev) {
          node.prev.next = node.next?.prev;
        } else {
          // removed head
          this.head = node.next;
        }
        if (node.next) {
          node.next.prev = node.prev?.next;
        } else {
          // removed tail
          this.tail = node.prev;
        }
        this.current = node.prev || node.next;
        this.length--;
        return node.data;
      }
      index++;
      node = node.next;
    }
  }
  // The following methods are to mimic Array functionality
  forEach(cb) {
    let node = this.head;
    let index = 0;
    while (node) {
      cb(node.data, index, this, node);
      index++;
      node = node.next;
    }
  }
  map(cb) {
    const result = new LinkedList();
    let node = this.head;
    let index = 0;
    while (node) {
      const data = cb(node.data, index, this, node);
      index++;
      result.push(data);
      node = node.next;
    }
    return result;
  }
  // If you want an actual array...
  toArray() {
    const result = [];
    let node = this.head;
    while (node) {
      result.push(node.data);
      node = node.next;
    }
    return result;
  }
}

export default LinkedList;
