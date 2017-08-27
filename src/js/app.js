import Swiper from './slider';

const swiperNodes = document.querySelectorAll('.swiper');
window.Swiper = Swiper;
Array.prototype.slice.call(swiperNodes).forEach((swiperNode, i) => {
    new Swiper(swiperNode, {
      speed: 500,
      threshold: 0.1,
      wrapperClass: 'inner',
      slidesClass: 'slide',
    });
});