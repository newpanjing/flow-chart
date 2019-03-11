function componentInit() {

    //注册组件
    Vue.component('shape', {
        props: ['shape'],
        data: function () {

            var shape = this.shape;


            var mappers = {
                numbers: ['left', 'top', 'width', 'height', 'borderWidth', 'fontSize', 'borderRadius', 'padding'],
                strings: ['active', 'borderColor', 'borderStyle', 'fontColor', 'background', 'fontStyle', 'index']
            }
            var alias = {
                fontColor: 'color',
                index: 'z-index'
            };

            return {
                width() {
                    return shape.width
                },
                height() {
                    return shape.height
                },
                data: shape,
                live() {
                    return shape;
                },
                value() {

                    var value = shape.value;
                    //换行改为br
                    //空格改为占位符
                    value = value.replace(/ /g, '&nbsp;').replace(/\r|\n/g, '<br/>');
                    return value;
                },
                style() {
                    var json = {};
                    for (var key in shape) {
                        var value = shape[key];

                        var isNumber = mappers.numbers.indexOf(key) != -1;
                        var isString = mappers.strings.indexOf(key) != -1;

                        //不在样式表范围内的字段不处理
                        if (isNumber || isString) {
                            if (isNumber) {
                                value = value + 'px';
                            }

                            key = alias[key] || key;
                            json[key] = value;
                        }
                    }

                    //判断显示菱形
                    if (json.background && shape.type == 1) {
                        var bg = Diamond(shape.width, shape.height);
                        json.background = `url("${bg}") no-repeat;`
                    }

                    var str = '';
                    for (var i in json) {
                        str += `${i}:${json[i]};`
                    }
                    return str;
                }
            }
        },
        watch: {},
        methods: {
            blur: function (e, data) {
                //失去焦点就让编辑禁用
                data.editor = false;
                //通知刷新
                this.$forceUpdate();
            },
            dblclick: function (e, data) {
                data.editor = true;
            },
            move: function (e) {
                // console.log(e.code)
                //通知
                this.$emit('shapemove', e);
                // e.preventDefault()
                // e.stopPropagation()

            }
        },
        computed: {},
        template: '#shape-template'
    });
}
