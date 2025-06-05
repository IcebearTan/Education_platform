(function (window, document) {
  var sizeUI = 375; // 设计图宽度
  var remBase = 37.5; // 基准值，1rem = 37.5px
  var docEl = document.documentElement;

  function setRemUnit() {
    var docWidth = docEl.clientWidth;
    var docFontSize = (docWidth / sizeUI) * remBase;
    docEl.style.fontSize = docFontSize + 'px';
    document.body.style.fontSize = (16 / docFontSize) + 'rem';
    handleRemAdapt();
  }

  function handleRemAdapt() {
    var currentFontSize = parseInt(docEl.style.fontSize);
    var temp = currentFontSize;
    for (var i = 0; i < 100; i++) {
      var realFontSize = parseInt(window.getComputedStyle(docEl).fontSize);
      var differ = realFontSize - currentFontSize;
      if (Math.abs(differ) >= 1) {
        temp += (differ > 0) ? -1 : 1;
        docEl.style.fontSize = temp + 'px';
      } else {
        break;
      }
    }
  }

  setRemUnit();
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) setRemUnit();
  });
})(window, document);
