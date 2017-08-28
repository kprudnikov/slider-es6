import Swiper from './slider';
require('../scss/main.scss');

const swiperNodes = document.querySelectorAll('.swiper');
Array.prototype.slice.call(swiperNodes).forEach((swiperNode) => {
    new Swiper(swiperNode, {
      speed: 500,
      threshold: 0.1,
      wrapperClass: 'inner',
      slidesClass: 'slide',
      additionalSlides: 2,
    });
});