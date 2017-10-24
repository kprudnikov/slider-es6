## Build:

> git clone https://github.com/kprudnikov/slider-es6.git

> npm install

> npm start

Open http://localhost:8080/

---

### Quickstart:

> var swiper = new Swiper(swiperNode, config);

swiperNode: HTML element

config: object

---


### Config:

__speed__: speed in ms. Default 400.

__threshold__: value to determine how far you should pull a slide in order to swipe. min 0, max 1. Default 0.2.

__wrapperClass__: string. Default 'swiper-wrapper'.

__slidesClass__: string. Default 'slide',

__additionalSlides__: additionalnumber of slides before and after the main sequence for a smoother experience. min 1, max -
 initial slides number. Default 2.
 
__beforeSwipe__: callback function (swiper) {}.

__afterSwipe__: callback function (swiper) {}.


### About:

the purpose of this project is to demostrate ES2015 knowledge. No old browsers support etc.