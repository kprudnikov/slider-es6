const swiperNodes = document.querySelectorAll('.swiper');
const swipersRootsList = [];

const Swiper = (() => {
  const body = document.documentElement || document.getElementsByTagName('body')[0];

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

  class Swiper {
    constructor (swiperNode, userConfig = {}) {
      const rootType = Object.prototype.toString.call(swiperNode);
      if (!swiperNode) throw new Error('No element to initialize');
      if (!rootType.match(/html/i)) throw new Error(`Expected an HTML DOM element, but recieved ${rootType} instead.`);
      if (swipersRootsList.indexOf(swiperNode) >= 0) return; // already initialized
      swipersRootsList.push(swiperNode);

      const defaultConfig = {
        speed: 400, // ms
        threshold: 200, // px
        afterSwipe: () => {console.log('swipe end');},
      };

      this._serviceData = {
        isSliding: false,
      };

      this.config = Object.assign(defaultConfig, userConfig);
      this.root = swiperNode;
      this.config.speed = this.config.speed/1000 + 's';
      let initialOffset = parseInt(this.root.style.left) || 0;
      let isMouseDown = false;

      this.root.addEventListener('dragleft', (e) => {
        if (!isMouseDown) return;
        const currentPosition = parseInt(this.root.style.left) || 0;
        this.root.style.left = `${currentPosition + e.detail.horizDelta}px`;
      });

      this.root.addEventListener('dragright', (e) => {
        if (!isMouseDown) return;
        const currentPosition = parseInt(this.root.style.left) || 0;
        this.root.style.left = `${currentPosition + e.detail.horizDelta}px`;
      });

      this.root.addEventListener('touchstart', onSwipeStart.bind(this));
      this.root.addEventListener('mousedown', onSwipeStart.bind(this));

      this.root.addEventListener('transitionend', (e) => {
        this.resetTransition(this.root);
        if (this._serviceData.isSliding) {
          this.config.afterSwipe();
          this._serviceData.isSliding = false;
        }
      });

      body.addEventListener('touchend', onSwipeEnd.bind(this));
      body.addEventListener('mouseup', onSwipeEnd.bind(this));

      function onSwipeStart (e) {
        isMouseDown = true;
        this.resetTransition(this.root);
        initialOffset = parseInt(this.root.style.left) || 0;
      }

      function onSwipeEnd (e) {
        if (!isMouseDown) return;

        isMouseDown = false;
        const currentPosition = parseInt(this.root.style.left) || 0;
        const offset = currentPosition - initialOffset;
        this.root.style.transition = `left ${this.config.speed}, right ${this.config.speed}`;

        if (Math.abs(offset) < this.config.threshold) {
          this.root.style.left = `${initialOffset}px`;
        } else {
          initialOffset = offset > 0 ? this.root.offsetWidth : 0;
          this.root.style.left = `${initialOffset}px`;
          this._serviceData.isSliding = true;
        }
      }
    }

    resetTransition (node) {
      node.style.transition = 'all 0s';
    }
  }

  return Swiper;

})();

Array.prototype.slice.call(swiperNodes).forEach((swiperNode, i) => {
  if (i) {
    new Swiper(swiperNode);
  } else {
    new Swiper(swiperNode, {
      speed: 500,
      threshold: 400,
    });
  }
});