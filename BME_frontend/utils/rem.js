(function () {
  const baseSize = 16; // 设计图宽度是 375px 的话，这里用 24px 作为基础
  function setRem() {
    const scale = document.documentElement.clientWidth / 375; // 375 是设计图宽度
    document.documentElement.style.fontSize = baseSize * scale + 'px';
  }
  setRem();
  window.addEventListener('resize', setRem);
})();
