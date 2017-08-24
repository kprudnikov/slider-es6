import './event-emitter';
require('../scss/main.scss');

const swipersRootsList = [];
const swipersList = [];

const body = document.documentElement || document.getElementsByTagName('body')[0];
function noop () {};

body.addEventListener('drag', (e) => {
  const { horizDelta, vertDelta } = e.detail;
  let direction;

  if (Math.abs(horizDelta) > Math.abs(vertDelta)) {
    if (horizDelta > 0) {
      direction = 'right';
    } else if (horizDelta < 0){
      direction = 'left';
    }
    const dragEvent = new CustomEvent(`drag${direction}`, {
      bubbles: true,
      detail: {
        horizDelta
      }
    });
    swipersRootsList.forEach(root => root.dispatchEvent(dragEvent));
  }
});

export default class Swiper {
  constructor (rootNode, userConfig = {}) {
    const rootType = Object.prototype.toString.call(rootNode);
    if (!rootNode) throw new Error('No element to initialize');
    if (!rootType.match(/html/i)) throw new Error(`Expected a HTML DOM element, but received ${rootType} instead.`);
    if (swipersRootsList.indexOf(rootNode) >= 0) return swipersList[swipersRootsList.indexOf(rootNode)]; // already initialized

    swipersRootsList.push(rootNode);
    swipersList.push(this);

    const defaultConfig = {
      speed: 400, // ms
      threshold: 200, // px
      wrapperClass: 'swiper-wrapper',
      slidesClass: 'slide',
      afterSwipe: noop,
    };

    this._flags = {
      isSliding: false,
      isMouseDown: false,
      initialOffset: parseInt(rootNode.style.left) || 0,
      slideWidth: 0,
    };

    this.rootNode = rootNode;
    this.config = Object.assign(defaultConfig, userConfig);
    this.config.speed = this.config.speed/1000 + 's';
    this.wrapperNode = rootNode.querySelector(`.${this.config.wrapperClass}`);
    this._flags.slideWidth = rootNode.querySelector(`.${this.config.slidesClass}`).offsetWidth;

    this.rootNode.addEventListener('dragleft', this.onDragLeft.bind(this));
    this.rootNode.addEventListener('dragright', this.onDragRight.bind(this));
    this.rootNode.addEventListener('touchstart', this.onSwipeStart.bind(this));
    this.rootNode.addEventListener('mousedown', this.onSwipeStart.bind(this));
    this.rootNode.addEventListener('transitionend', () => {
      Swiper.resetTransition(this.wrapperNode);
      if (this._flags.isSliding) {
        this.config.afterSwipe();
        this._flags.isSliding = false;
      }
    });

    body.addEventListener('touchend', this.onSwipeEnd.bind(this));
    body.addEventListener('mouseup', this.onSwipeEnd.bind(this));
  }

  onDragLeft (e) {
    if (!this._flags.isMouseDown) return;
    const currentPosition = parseInt(this.wrapperNode.style.left) || 0;
    this.wrapperNode.style.left = `${currentPosition + e.detail.horizDelta}px`;
  }

  onDragRight (e) {
    if (!this._flags.isMouseDown) return;
    const currentPosition = parseInt(this.wrapperNode.style.left) || 0;
    this.wrapperNode.style.left = `${currentPosition + e.detail.horizDelta}px`;
  }

  onSwipeStart () {
    this._flags.isMouseDown = true;
    Swiper.resetTransition(this.wrapperNode);
    this._flags.initialOffset = parseInt(this.wrapperNode.style.left) || 0;
  }

  onSwipeEnd () {
    if (!this._flags.isMouseDown) return;

    this._flags.isMouseDown = false;
    const currentPosition = parseInt(this.wrapperNode.style.left) || 0;
    const offset = currentPosition - this._flags.initialOffset;
    this.wrapperNode.style.transition = `left ${this.config.speed}, right ${this.config.speed}`;

    if (Math.abs(offset) < this.config.threshold) {
      this.wrapperNode.style.left = `${this._flags.initialOffset}px`;
    } else {
      this._flags.initialOffset = offset > 0 ? this._flags.initialOffset + this._flags.slideWidth :
        this._flags.initialOffset - this._flags.slideWidth;
      this.wrapperNode.style.left = `${this._flags.initialOffset}px`;
      this._flags.isSliding = true;
    }
  }

  static resetTransition (node) {
    node.style.transition = 'all 0s';
    return node;
  }
}