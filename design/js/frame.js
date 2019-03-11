/**
 * 初始化布局UI
 */
function frameInit() {

    initResize();
    initSelectArea();
    initDrag();
    initFocus();

    componentInit();
    initApp();
    initLayout();

    initJsPlumb();


    document.addEventListener('click', function () {

        app.popup.show = false;
        app.cardPopup.show = false;
    });

    for (var i = 0; i < 2; i++) {

        pushShape({
            left: i * 3 * 20,
            top: i * 3 * 20,
            width: 100,
            height: 28,
            // value: new Date().getTime(),
            value: '开始',
            type: 0,
        })
    }

}

function pushShape(data) {


    //0=文本，1=图片

    //一个随机不重复的id，用于当前判断
    if (!data.id) {
        data.id = getShapeId();
    }

    //默认不能编辑
    data.editor = false;

    if (!data.active) {
        data.active = false;
    }
    data.type = data.type || 0;

    if (data.type == 0) {
        data.background = '#ffb952';
        data.borderWidth = 2;
        data.borderColor = 'black';
    }

    if (data.type == 1) {
        data.fontColor = 'black';
        data.padding = '0px';
    }

    if (data.type == 2) {
        data.background = '#5a95c9';
        data.borderRadius = '0';
        data.borderWidth = 2;
        data.borderColor = 'black';
    }

    data.selectArea = false;

    var defaultData = {
        borderWidth: 0,
        borderColor: '#000000',
        borderStyle: 'solid',
        borderRadius: '20',
        padding: '10',

        fontColor: '#000000',
        fontSize: 12,
        fontStyle: '',
        value: '文本标签',
        height: 28
        , background: 'green',
        //端点
        endpoints: []
    }
    for (var key in defaultData) {
        if (!data[key]) {
            data[key] = defaultData[key];
        }
    }
    app.shapes.push(data);
    data.index = app.shapes.length;
    setTimeout(() => {
        endpoint(data.id, data.type)
    }, 100)
}

/**
 * 获取一个随机数id，18位
 * @returns {string}
 */
function getShapeId() {
    return new Date().getTime() + "" + Math.floor(Math.random() * 89999 + 10000);
}

function initFocus() {
    Vue.directive('focus', {
        inserted(el, binding) {
            console.log(binding.value)
            if (binding) {
                el.focus();
            }
        }
    });
}

function initSelectArea() {
    Vue.directive('selectarea', {
        inserted(el, binding) {
            new SelectArea({
                onBegin: function () {

                },
                onHandler: function (data) {

                    var count = 0;
                    var tempShape = null;
                    app.shapes.forEach(item => {
                        //计算出每个item的x1 x2 y1 y2
                        var ix1 = item.left, ix2 = item.left + item.width;
                        var iy1 = item.top, iy2 = item.top + item.height;

                        //碰撞检测
                        var crash = (data.y2 >= iy1 && data.y1 <= iy2) && (data.x2 >= ix1 && data.x1 <= ix2);
                        item.active = crash;
                        item.selectArea = crash;
                        if (crash) {
                            tempShape = item;
                            count++;
                        }
                    });

                    //如果只有一个，显示置顶和底菜单，并显示属性
                    var single = count == 1;
                    for (var i = 1; i < app.popup.menus.length; i++) {
                        app.popup.menus[i].show = single;
                    }

                    if (single) {
                        app.selectShape(null, tempShape);
                    } else {
                        app.selected = {}
                    }
                },
                onEnd: function () {

                }
            }).register(el);
        }
    });
}

function initResize() {
    Vue.directive('resize', {
        inserted(dv, binding) {
            //注册拉伸
            var resize = new Resize({
                onResize: function (data) {
                    for (var key in data) {
                        binding.value.shape[key] = data[key];
                    }
                    // console.log(this)
                    // jsp.repaint(this);
                    jsp.repaintEverything();
                }
            });
            resize.register(dv);
        }
    });
}

function initDrag() {

    Vue.directive('drag', {
        inserted(dv, binding) {
            var drag = new Drag({
                onBegin: function (data) {

                    var id = parseInt(dv.getAttribute('data-id'));


                    var self = {}
                    for (var i = 0; i < app.shapes.length; i++) {
                        var item = app.shapes[i];
                        if (item.id == id) {
                            self = item;
                            break;
                        }
                    }
                    self.active = true;

                    if (!self.selectArea) {
                        app.shapes.forEach(item => {
                            if (item != self) {
                                item.selectArea = false;
                                item.active = false;
                            }
                        })
                    } else {
                        //所有选中的 记录下旧的坐标
                        app.shapes.forEach(item => {
                            if (item.active) {
                                item.oldLeft = item.left;
                                item.oldTop = item.top;
                            }
                        });
                    }

                },
                onEnd: function (data) {
                    app.shapes.forEach(item => {
                        if (item.active) {
                            item.oldLeft = item.left;
                            item.oldTop = item.top;
                        }
                    });
                },
                onDrag: function (data) {
                    var shape = binding.value.shape;
                    shape.left = data.left;
                    shape.top = data.top;

                    //所有选中的移动，不包括当前
                    app.shapes.forEach(item => {
                        if (item.active && item != shape) {
                            item.left = data.x + item.oldLeft;
                            item.top = data.y + item.oldTop;
                        }
                    });

                    //重绘
                    jsp.repaintEverything();
                }
            })
            drag.register(dv);

            // //注册拉伸
            // var resize = new Resize({
            //     onResize: function (data) {
            //         for (var key in data) {
            //             binding.value.shape[key] = data[key];
            //         }
            //     }
            // });
            // resize.register(dv);
        }
    });

}

function moveLeft(val) {
    app.shapes.forEach(item => {
        if (item.active) {
            item.left += val;
            jsp.repaintEverything();
        }
    });
}

function moveTop(val) {
    app.shapes.forEach(item => {
        if (item.active) {
            item.top += val;
            jsp.repaintEverything();
        }
    });
}

function initApp() {
    window.app = new Vue({
        el: '#app',
        data: {
            layout: {
                left: 250,
                right: 250,
                center: 200,
                margin: 0,
                width: getSize().width,
                height: getSize().width
            },
            card: {
                width: 5000,
                height: 5000,
                name: ''
            },
            selected: {},
            isSelected: false,
            shapes: [],
            cardPopup: {
                show: false,
                left: 0,
                top: 0,
                menus: [{
                    text: '重绘界面',
                    // icon: 'fas fa-sync-alt',
                    handler: function () {
                        jsp.repaintEverything();
                    }
                }, {
                    text: '插入开始',
                    icon: '',
                    handler: function () {
                        app.addShape(0, app.mousePos.x, app.mousePos.y);
                    }
                }, {
                    split: true
                }, {
                    text: '插入判断',
                    icon: 'far fa-diamond',
                    handler: function () {
                        app.addShape(1, app.mousePos.x, app.mousePos.y);
                    }
                }, {
                    text: '插入结果',
                    icon: 'far fa-rectangle-landscape',
                    handler: function () {
                        app.addShape(2, app.mousePos.x, app.mousePos.y);
                    }
                }, {
                    text: '全部删除',
                    icon: '',
                    handler: function () {
                        deleteAll();
                    }
                }]
            },
            popup: {
                show: false,
                left: 0,
                top: 0,
                menus: [{
                    text: '删除',
                    icon: 'fa-unlink',
                    show: true,
                    handler: function () {
                        var data = app.popup.data;

                        x0p('Confirmation', '确定要该元素吗？', 'warning').then(function (e) {
                            if (e.button == 'warning') {
                                app.shapes = app.shapes.filter(t => {

                                    return t.id != data.id
                                });

                                //删除元素有关的连接线
                                // jsp.remove(data.id);
                                jsp.removeAllEndpoints(data.id);
                                jsp.repaintEverything();

                                if (data.active) {
                                    app.selected = {};
                                }
                            }
                        });


                    }
                }, {
                    split: true,
                    show: true
                }, {
                    text: '编辑',
                    icon: 'fa-edit',
                    show: true,
                    handler: function () {
                        var data = app.popup.data;
                        data.editor = true;
                    }
                }]
            },
            isShiftDown: false
        },
        watch: {
            selected: function (value) {
                var sed = false;


                for (var i in value) {
                    sed = true;
                    break;
                }

                app.isSelected = sed;
            }
        },
        created: function () {
            console.log('ok')
            console.log(this.shapes)

        },
        methods: {
            cardClick: function (e) {
                if (e.button != 0) {
                    return;
                }
                app.shapes.forEach(item => {
                    item.active = false;
                    item.selectArea = false;
                });
                app.popup.show = false;
                app.selected = {}

            },
            selectShape: function (e, shape) {
                this.shapes.forEach(item => {
                    if (!item.selectArea) {
                        item.active = false
                    }
                });
                shape.active = true;
                if (e) {
                    e.preventDefault();
                }
                this.selected = shape;
                this.isSelected = true;
            },
            showContextmenu: function (e, data) {
                app.popup.left = e.clientX;
                app.popup.top = e.clientY;
                app.popup.show = true;
                app.popup.data = data;

                app.cardPopup.show = false;
            },
            showCardMenu: function (e) {
                var cardMenu = app.cardPopup;
                cardMenu.left = e.clientX;
                cardMenu.top = e.clientY;
                cardMenu.show = true;
                app.popup.show = false;

                //记录鼠标指针临时位置
                app.mousePos = {
                    x: e.clientX - e.target.offsetLeft,
                    y: e.clientY - e.target.offsetTop
                }
            },
            cardKeyup: function (e) {
                if (e.keyCode == 9) {
                    app.isShiftDown = false;
                }
            },
            selectAll: function () {
                app.shapes.forEach(item => {
                    item.active = true;
                    item.selectArea = true;
                });
            },
            unselectAll: function () {
                app.shapes.forEach(item => {
                    item.active = false;
                    item.selectArea = false;
                });
            },
            shapeMove: function (e, data, index) {
                var code = e.keyCode;
                if (e.ctrlKey && code == 65) {
                    this.selectAll();
                    return;
                }

                if (e.ctrlKey && code == 68) {
                    this.unselectAll();
                    return;
                }
                var keymaps = {
                    37: () => moveLeft(-1),
                    38: () => moveTop(-1),
                    39: () => moveLeft(1),
                    40: () => moveTop(1),
                    9: () => app.isShiftDown = true,
                    8: function () {

                        // app.popup.del();
                    },

                };
                var fun = keymaps[code];
                if (fun) {

                    if (e && e.stopPropagation) {
                        //W3C取消冒泡事件
                        e.stopPropagation();
                    } else {
                        //IE取消冒泡事件
                        window.event.cancelBubble = true;
                    }
                    fun.call(data, index);
                }
            },
            addShape: function (type, x, y) {
                x = x || 10;
                y = y || 10;
                var value = '文本';
                var width = 60, height = 28;

                //默认图片
                if (type == 1) {
                    value = '判断';
                    width = 145;
                    height = 75;
                }
                //获取滚动条位置

                var sx = document.getElementById('center').scrollLeft, sy = document.getElementById('center').scrollTop;

                var data = {
                    left: x + sx,
                    top: y + sy,
                    width: width,
                    height: height,
                    value: value,
                    type: type,
                    active: true
                };
                app.selectShape(null, data);
                pushShape(data)
            }
        }
    });
}

function initLayout() {


    function handlerLayout() {
        var size = getSize();
        // if (size.width < 600 || size.height < 500) {
        //     return;
        // }
        app.layout.width = size.width;
        app.layout.height = size.height;

        //计算center的宽度
        //2=3个边框的宽度3*2
        //20=2个框的外边距
        //20=内边距

        app.layout.center = size.width - app.layout.left - (app.layout.margin * 2);

    }

    handlerLayout();

    window.onresize = handlerLayout;

}

function getSize() {

    return {
        width: document.documentElement.clientWidth || document.body.clientWidth,
        height: document.documentElement.clientHeight || document.body.clientHeight
    };
}

function initJsPlumb() {
    jsPlumb.ready(function () {
        // jsPlumb.setSuspendDrawing(true);
        var instance = window.jsp = jsPlumb.getInstance({
            // default drag options
            DragOptions: {cursor: 'pointer', zIndex: 2000},
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
                ["Arrow", {
                    location: 1,
                    visible: true,
                    width: 11,
                    length: 11,
                    id: "ARROW",
                    events: {
                        click: function () {
                            alert("you clicked on the arrow overlay")
                        }
                    }
                }],
                ["Label", {
                    location: 0.8,
                    id: "label",
                    cssClass: "aLabel",
                    events: {
                        tap: function () {
                            var connId = this.component.id;

                            console.log(connId)
                            var label = this;
                            var val = label.getLabel();
                            if (!val || val == '') {
                                val = '标签';
                            }

                            x0p('输入描述', null, 'input').then(
                                function (data) {

                                    if (data.button == 'info') {
                                        val = data.text;
                                        label.setLabel(val);
                                    }
                                });

                        }
                    }
                }]
            ],
            Container: "card-wrapper"
        });

        var basicType = {
            connector: "StateMachine",
            paintStyle: {stroke: "red", strokeWidth: 4},
            hoverPaintStyle: {stroke: "blue"},
            overlays: [
                "Arrow"
            ]
        };
        instance.registerConnectionType("basic", basicType);

        instance.bind("connection", function (connInfo, originalEvent) {
            var label = connInfo.connection.getOverlay("label");
            label.setLabel('标签');
        });
        instance.bind("Endpoint", function () {
            console.log(arguments);
        })

        // 单点击了连接线,
        jsp.bind('dblclick', function (conn, originalEvent) {
            console.log('删除链接：' + conn.id)
            x0p('Confirmation', '确定要删除连接线吗？', 'warning').then(function (e) {
                if (e.button == 'warning') {

                    jsp.deleteConnection(conn)
                }
            });

        });
    });
}

function deleteAll() {
    app.shapes.forEach(item => {
        jsp.removeAllEndpoints(item.id)
    });
    jsp.repaintEverything();
    app.shapes = [];
}

var common = {
    isSource: true,
    isTarget: true,
    connector: 'Flowchart',
    endpoint: ['Dot', {
        radius: 5,
        fill: '#ff5722'
    }],
    // enabled:true,
    cssClass: '',
    maxConnections: -1,
    paintStyle: {
        radius: 3,
        fill: '#FFFFFF',
        stroke: "#7AB02C",

        // strokeWidth: 1,
        // width:3
    },
    hoverPaintStyle: {
        fill: "#216477",
        stroke: "#216477"
    },
    connectorStyle: {
        strokeWidth: 2,
        stroke: "#216477",
        outlineWidth: 3,
        outlineStroke: "white"
    },
    connectorHoverStyle: {
        strokeWidth: 3,
        stroke: "#216477",
        outlineWidth: 5,
        outlineStroke: "white"
    },
    dragOptions: {},
    // connectorHoverStyle: {
    //     strokeWidth: 0.2
    // },
    //不允许回环自己
    allowLoopback: false
    //如果只想产生一个端点，而不是多个端点
    //uniqueEndpoint:true
    , overlays: [
        "Arrow",
        // [ "Label", { label:"1", location:1, id:"",cssClass:'endpoint-label-lkiarest' } ]
    ],

}

function endpoint(id, type) {


    /*

    anchor:"Continuous"
    //or
    anchor:["Continuous",{faces:["top","left"]}]

    faces同样有四个值：top,left,right,bottom。

    将CSS类与Anchors相关联
    var ep = jsPlumb.addEndpoint("ele1",{
      anchor:[0,0,0,0,0,0,"test"]
    });

    * */
    var array = ['Top', 'Bottom', 'Right', 'Left'];
    array.forEach(val => {

        jsp.addEndpoint(id, {
            anchor: val
        }, common)
    }, function () {
        console.log('ok')
    });

    // jsp.draggable(id);
}

function getData() {

    var json = {};
    //读取endpoints 信息
    var data = {};
    var shapes = [];
    json.shapes = shapes;

    app.shapes.forEach(item => {

        //太多无用的字段，只挑选需要的
        var fields = ['id', 'left', 'top', 'width', 'height', 'type', 'value'];
        var temp = {};
        fields.forEach(key => {
            temp[key] = item[key];
        });
        temp.endpoints = []
        data[temp.id] = temp;
    });

    //保存endpoints
    jsp.getConnections().forEach(item => {
        data[item.sourceId].endpoints.push({
            targetId: item.targetId,
            label: item.getOverlay("label").getLabel(),
            anchors: [item.endpoints[0].anchor.type, item.endpoints[1].anchor.type]
        })

    });
    //转为json数组
    for (var i in data) {
        shapes.push(data[i]);
    }
    json.card = app.card;
    return json;
}

function loadChart(app, data) {

    deleteAll();
    app.card = data.card;
    var shapes = data.shapes;
    app.$nextTick(function () {
        shapes.forEach(item => {
            pushShape(item);
        });
    });
    app.$nextTick(function () {
        shapes.forEach(item => {
            jsp.makeSource(item.id, common);
        });
        var endpoints = [];

        shapes.forEach(item => {
            item.endpoints.forEach(p => {
                endpoints.push({
                    source: item.id,
                    target: p.targetId,
                    anchors: p.anchors,
                    tips: p.label
                    // label: p.label,
                    // overlays: [
                    //     "Arrow",
                    //     ["Label", {label: p.l, location: 1, id: "label", cssClass: 'aLabel'}]
                    // ],
                });
            });
        });
        setTimeout(function () {

            endpoints.forEach(item => {
                var conn = jsp.connect(item, common);
                conn.getOverlay('label').setLabel(item.tips);
            });
        }, 100)

    })
}

var ddd = {
    "shapes": [
        {
            "id": "155226886759344950",
            "left": 403,
            "top": 70,
            "width": 100,
            "height": 28,
            "type": 0,
            "value": "开始22",
            "endpoints": [
                {
                    "targetId": "155226887217748113",
                    "label": "123",
                    "anchors": [
                        "Right",
                        "Top"
                    ]
                },
                {
                    "targetId": "155226887217748113",
                    "label": "111",
                    "anchors": [
                        "Bottom",
                        "Top"
                    ]
                }
            ]
        },
        {
            "id": "155226887217748113",
            "left": 645,
            "top": 179,
            "width": 145,
            "height": 75,
            "type": 1,
            "value": "判断111",
            "endpoints": [
                {
                    "targetId": "155226887627288485",
                    "label": "555",
                    "anchors": [
                        "Bottom",
                        "Top"
                    ]
                },
                {
                    "targetId": "155226888658553342",
                    "label": "444",
                    "anchors": [
                        "Left",
                        "Top"
                    ]
                }
            ]
        },
        {
            "id": "155226887627288485",
            "left": 674,
            "top": 334,
            "width": 60,
            "height": 28,
            "type": 2,
            "value": "文本222",
            "endpoints": []
        },
        {
            "id": "155226888658553342",
            "left": 480,
            "top": 324,
            "width": 60,
            "height": 28,
            "type": 2,
            "value": "文本111",
            "endpoints": []
        }
    ],
    "card": {
        "width": 5000,
        "height": 5000,
        "name": "客户咨询流程图"
    }
}

