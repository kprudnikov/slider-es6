(function () {
  const body = document.documentElement || document.getElementsByTagName('body')[0];

  const mouseData = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isMouseDown: false,
  };

  function onMouseDown (e) {
    const coords = e.type.match('touch') ? e.touches[0] : e;
    mouseData.startX = coords.clientX;
    mouseData.startY = coords.clientY;
    mouseData.target = e.target;
    mouseData.isMouseDown = true;
  }

  function onMouseMove (e) {
    if (!mouseData.isMouseDown) return;
    const coords = e.type.match('touch') ? e.touches[0] : e;

    mouseData.endX = coords.clientX;
    mouseData.endY = coords.clientY;

    const vertDelta = mouseData.endY - mouseData.startY;
    const horizDelta = mouseData.endX - mouseData.startX;

    mouseData.startX = coords.clientX;
    mouseData.startY = coords.clientY;

    const dragEvent = new CustomEvent('drag', {
      bubbles: true,
      detail: {
        horizDelta,
        vertDelta,
      }
    });
    body.dispatchEvent(dragEvent);
  }

  function onMouseUp (e) {
    mouseData.isMouseDown = false;
  }

  body.addEventListener('mousedown', onMouseDown);
  body.addEventListener('touchstart', onMouseDown);
  
  body.addEventListener('mouseup', onMouseUp);
  body.addEventListener('touchend', onMouseUp);

  body.addEventListener('mousemove', onMouseMove);
  body.addEventListener('touchmove', onMouseMove);
})();