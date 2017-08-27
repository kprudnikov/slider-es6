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

    swipersRootsList.push(rootNode); // TODO - maybe add 'destroy' function?
    swipersList.push(this);

    const defaultConfig = {
      speed: 400, // ms
      threshold: 0.2, // % of width
      wrapperClass: 'swiper-wrapper',
      slidesClass: 'slide',
      additionalSlides: 2,
      beforeSwipe: noop,
      afterSwipe: noop,
    };

    this._flags = {
      isSliding: false,
      isMouseDown: false,
      initialOffset: 0,
      slideWidth: 0,
      slidesNumber: 0,
      currentSlideIndex: 0,
    };

    this.rootNode = rootNode;
    this.config = Object.assign(defaultConfig, userConfig);
    this.config.speed = this.config.speed/1000 + 's';
    this.wrapperNode = rootNode.querySelector(`.${this.config.wrapperClass}`);
    this.slides = rootNode.querySelectorAll(`.${this.config.slidesClass}`);
    this._flags.slideWidth = this.slides[0].offsetWidth;
    this._flags.slidesNumber = this.slides.length;

    this.rootNode.addEventListener('dragleft', this.onDragLeft.bind(this));
    this.rootNode.addEventListener('dragright', this.onDragRight.bind(this));
    this.rootNode.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.rootNode.addEventListener('mousedown', this.onTouchStart.bind(this));
    this.rootNode.addEventListener('transitionend', () => {
      Swiper.resetTransition(this.wrapperNode);
      if (this._flags.isSliding) {
        this.config.afterSwipe(this);
        this._flags.isSliding = false;
      }
    });

    body.addEventListener('touchend', this.onTouchEnd.bind(this));
    body.addEventListener('mouseup', this.onTouchEnd.bind(this));
    window.addEventListener('resize', () => { // TODO add debounce
      this._flags.slideWidth = this.slides[0].offsetWidth;
      this.wrapperNode.style.left = `-${this._flags.slideWidth * this._flags.currentSlideIndex}px`;
    });
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

  onTouchStart (e) {
    if (!(e.buttons === 1 || (typeof e.buttons === 'undefined' && e.type.match('touch')))) {
      this.onTouchEnd(e);
    } else {
      this._flags.isMouseDown = true;
      Swiper.resetTransition(this.wrapperNode);
      this._flags.initialOffset = parseInt(this.wrapperNode.style.left) || 0;
    }
  }

  onTouchEnd () {
    if (!this._flags.isMouseDown) return;

    this._flags.isMouseDown = false;
    const currentPosition = parseInt(this.wrapperNode.style.left) || 0;
    const offset = currentPosition - this._flags.initialOffset;
    const thresholdInPx = this._flags.slideWidth * this.config.threshold;
    this.wrapperNode.style.transition = `left ${this.config.speed}, right ${this.config.speed}`;

    if (Math.abs(offset) < thresholdInPx) {
      this.wrapperNode.style.left = `${this._flags.initialOffset}px`;
    } else {
      const slidingLeft = offset < 0;
      const slidingRight = offset > 0;
      const slidingBeyondFirst = this._flags.initialOffset >= 0 && slidingRight;
      const slidingBeyondLast = (Math.abs(this._flags.initialOffset) >=
        this._flags.slideWidth * (this._flags.slidesNumber - 1) &&
        Math.sign(this._flags.initialOffset) === -1 && slidingLeft);

      if (!(slidingBeyondFirst || slidingBeyondLast)) {
        this._flags.initialOffset = offset > 0 ? this._flags.initialOffset + this._flags.slideWidth :
          this._flags.initialOffset - this._flags.slideWidth;

        this._flags.currentSlideIndex = slidingLeft ?
          this._flags.currentSlideIndex + 1 :
          this._flags.currentSlideIndex - 1;

        this._flags.isSliding = true;
        this.config.beforeSwipe(this);
      }
      this.wrapperNode.style.left = `${this._flags.initialOffset}px`;
    }
  }

  static resetTransition (node) {
    node.style.transition = 'all 0s';
    return node;
  }
}
