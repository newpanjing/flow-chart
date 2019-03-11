//引入js

var libs = ['/js/jsplumb.js','/js/select.area.js','js/resize.js','js/drag.js','vue/vue.js','/js/diamond.js','js/components.js','/x0popup/x0popup.min.js','/js/frame.js'];
var base = './design/';
libs.forEach(lib => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = base + lib;
    document.body.appendChild(script);
});

window.onload = function () {
    //初始化
    frameInit();
}
