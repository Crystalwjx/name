(function(window) {
    function Tablet(container, config) {
        this._init(container, config);
        this._ctxInit();
        this._bindEvent()
    }
    Tablet._conut = 0;
    Tablet.prototype._init = function(_container, config) {
        var container = $(_container);
        if (container.length == 0) {
            throw "第一个参数必须是包裹前面板的选择器！"
        }
        container = container.eq(0);
        var that = this;
        this.config = {
            selectColor: true,
            response: true,
            width: 0,
            height: 0,
            extraClass: "",
            clearBtnHtml: "",
            saveBtnHtml: "",
            otherHtml: "",
            defaultColor: "#000",
            defaultBackgrondColor: "transparent",
            imgType: "png",
            onInit: function() {},
            onBeforeClear: function() {},
            onClear: function() {}
        };
        if (config && ({}).toString.call(config) === "[object Object]") {
            $.extend(true, this.config, config)
        }
        this.container = container;
        this.id = "Tablet_LYN_" + (Tablet._conut++);
        this.color = this.config.defaultColor;
        this.bgColor = this.config.defaultBackgrondColor;
        this.isMobile = isMobile = /phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone/i.test(navigator.userAgent);
        this.lineConfig = {
            strokeStyle: this.config.defaultColor,
            lineWidth: 8,
            lineCap: "round",
            lineJoin: "round",
            shadowBlur: 1,
            shadowColor: this.config.defaultColor
        };
        this.container.append($(this.buildTablet()));
        this.tablet = $("#" + this.id);
        this.$canvas = this.tablet.find("canvas");
        this.canvas = this.tablet.find("canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.point = {
            x: 0,
            y: 0
        };
        this.points = {
            x: [],
            y: [],
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        this.degree = 0;
        if (typeof this.config.width === "function") {
            this.width = this.config.width()
        } else {
            this.width = this.config.width
        }
        if (typeof this.config.height === "function") {
            this.width = this.config.height()
        } else {
            this.width = this.config.height
        }
        that.setCanvasWH(that.width, that.height);
        if (that.config.response && !this.isMobile) {
            var event = "resize";
            event += window.onorientationchange ? " orientationchange": "";
            $(window).on(event,
            function() {
                that.setCanvasWH();
                that.canvasReset()
            })
        }
        var winW = $(window).width();
        if (this.isMobile) {
            if (winW >= 768) {
                that.lineConfig.lineWidth = 8
            } else {
                if (winW < 768 && winW >= 414) {
                    that.lineConfig.lineWidth = 6
                } else {
                    if (winW < 414 && winW >= 375) {
                        that.lineConfig.lineWidth = 4
                    } else {
                        if (winW < 375 && winW >= 320) {
                            that.lineConfig.lineWidth = 2
                        }
                    }
                }
            }
        }
        this.config.onInit && (typeof this.config.onInit === "function") && this.config.onInit.call(this)
    };
    Tablet.prototype._ctxInit = function() {
        var that = this,
        pait = function(singal) {
            switch (singal) {
            case 1:
                that.ctx.beginPath();
                that.ctx.moveTo(that.point.x, that.point.y);
            case 2:
                that.ctx.lineTo(that.point.x, that.point.y);
                that.ctx.stroke();
                break;
            default:
            }
        },
        clientRect = that.clientRect = that.canvas.getBoundingClientRect(),
        pressed = this.pressed = false,
        create = function(singal) {
            return function(e) {
                // 判断默认行为是否可以被禁用
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
                if (singal === 1) {
                    that.pressed = true
                }
                if (singal === 1 || that.pressed) {
                    e = that.isMobile ? e.touches[0] : e;
                    that.point.x = e.clientX - that.clientRect.left + 0.5;
                    that.point.y = e.clientY - that.clientRect.top + 0.5;
                    that.points.x.push(that.point.x);
                    that.points.y.push(that.point.y);
                    pait(singal)
                }
            }
        };
        that.ctx.lineWidth = that.lineConfig.lineWidth;
        that.ctx.strokeStyle = that.lineConfig.strokeStyle;
        that.ctx.lineCap = that.lineConfig.lineCap;
        that.ctx.lineJoin = that.lineConfig.lineJoin;
        if (!that.isMobile) {
            that.ctx.shadowBlur = that.lineConfig.shadowBlur;
            that.ctx.shadowColor = that.lineConfig.shadowColor
        }
        var start = create(1),
        move = create(2),
        animationMove = window.requestAnimationFrame ?
        function(e) {
            requestAnimationFrame(function() {
                move(e)
            })
        }: move;
        if (isMobile) {
            this.canvas.addEventListener("touchstart", start ,{passive: false});
            this.canvas.addEventListener("touchmove", move,{passive: false});
        } else {
            this.canvas.addEventListener("mousedown", start);
            this.canvas.addEventListener("mousemove", move)
        } ["touchend", "mouseleave", "mouseup"].forEach(function(event, index) {
            that.canvas.addEventListener(event,
            function() {
                that.pressed = false
            },{passive: false})
        })
    };
    Tablet.prototype._bindEvent = function() {
        var that = this;
        this.tablet.find(".clear-canvas").on("click",
        function() {
            if (that.config.onBeforeClear && (typeof that.config.onBeforeClear === "function")) {
                var flag = that.config.onBeforeClear.call(this);
                if (flag === false) {
                    return
                }
            }
            that.clear();
            that.config.onBeforeClear && (typeof that.config.onBeforeClear === "function") && that.config.onBeforeClear.call(this)
        })
    };
    Tablet.prototype.setColor = function(color) {
        var that = this;
        that.ctx.beginPath();
        if (color) {
            that.color = color;
            that.lineConfig.strokeStyle = color
        }
        that.ctx.strokeStyle = that.lineConfig.strokeStyle;
        if (!that.isMobile) {
            that.lineConfig.shadowColor = color;
            that.ctx.shadowColor = that.lineConfig.shadowColor
        }
        return this
    };
    Tablet.prototype.setLineWidth = function(number) {
        var that = this;
        number = parseFloat(number);
        if (isNaN(number)) {
            return this
        }
        that.ctx.beginPath();
        that.lineConfig.lineWidth = number;
        that.ctx.lineWidth = that.lineConfig.lineWidth;
        return this
    };
    Tablet.prototype.setCanvasWH = function(width, height) {
        var that = this,
        //$tabletBtns = this.tablet.find(".tablet-btns"),
        bt = parseFloat(this.$canvas.css("border-top-width"), 10),
        bb = parseFloat(this.$canvas.css("border-bottom-width"), 10),
        bl = parseFloat(this.$canvas.css("border-left-width"), 10),
        br = parseFloat(this.$canvas.css("border-right-width"), 10);
        if (!width || !height) {
            var _w = 0,
            _h = 0,
            $canvasParent = this.tablet;
            if (!that.isMobile) {
                _w = $canvasParent.width();
                _h = $canvasParent.height();
            } else {
                var winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                _w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                _h = winH;
                that.tablet.children(".-canvas-wrapper").css({
                    width: _w,
                    height: _h
                })
            }
            this.width = _w - bl - br;
            this.height = _h - bt - bb
        } else {
            this.tablet.children(".-canvas-wrapper").css({
                width: width,
                height: height
            });
            this.width = width - bl - br;
            this.height = height - bt - bb
        }
        that.clientRect = that.canvas.getBoundingClientRect();
        /*var devicePixelRatio = this.devicePixelRatio = window.devicePixelRatio;
        if (devicePixelRatio) {
            this.$canvas.width(this.width);
            this.$canvas.height(this.height);
            this.canvas.width = this.width * devicePixelRatio;
            this.canvas.height = this.height * devicePixelRatio;
            this.ctx.scale(devicePixelRatio, devicePixelRatio)
        } else {
            this.canvas.width = this.width;
            this.canvas.height = this.height
        }
        */
        this.canvas.width = this.width;
        this.canvas.height = this.height
        return this
    };
    Tablet.prototype.canvasReset = function() {
        var that = this;
        that.ctx.lineWidth = that.lineConfig.lineWidth;
        that.ctx.strokeStyle = that.lineConfig.strokeStyle;
        that.ctx.lineCap = that.lineConfig.lineCap;
        that.ctx.lineJoin = that.lineConfig.lineJoin;
        that.clientRect = that.canvas.getBoundingClientRect();
        if (!that.isMobile) {
            that.ctx.shadowBlur = that.lineConfig.shadowBlur;
            that.ctx.shadowColor = that.lineConfig.shadowColor
        }
        this.points = {
            x: [],
            y: [],
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        return this
    };
    Tablet.prototype.clear = function() {
        var w = this.width,
        h = this.height;
        if (this.degree == 90 || this.degree == -90) {
            w = this.height;
            h = this.width
        }
        this.ctx.clearRect(0, 0, w, h);
        this.points = {
            x: [],
            y: [],
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        return this
    };
    Tablet.prototype.getBase64 = function(type) {
        //var that = this,
        //position = Tablet.getMax(this.points.x, this.points.y);
        if (!type) {
            type = "image/png"
        } else {
            var _type = type.toLowerCase();
            if (_type === "png") {
                type = "image/png"
            } else {
                if (_type === "jpg" || _type === "jpeg") {
                    type = "image/jpg"
                }
            }
        }
        var base64Img = this.canvas.toDataURL(type, 1);
        return base64Img
    };
    Tablet.prototype.getBlob = function(type) {
        var that = this,
        base64Img = this.getBase64(type),
        arr = base64Img.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bStr = atob(arr[1]),
        len = bStr.length,
        u8arr = new Uint8Array(len);
        while (len--) {
            u8arr[len] = bStr.charCodeAt(len)
        }
        return new Blob([u8arr], {
            type: mime
        })
    };
    Tablet.prototype.rotate = function(degree) {
        var minDeg = -90,
        maxDeg = 180,
        angle = 0,
        that = this,
        translateLen = 0,
        winW = $(window).width(),
        winH = $(window).height(),
        w = winW,
        h = winH,
        newCanvas = $("<canvas>");
        degree = ~~degree;
        if (degree < minDeg) {
            degree = minDeg
        }
        if (degree > maxDeg) {
            degree = maxDeg
        }
        this.degree = degree;
        angle = degree * Math.PI / 180;
        this.tablet.find("canvas").remove();
        this.tablet.find(".-canvas-wrapper").append(newCanvas);
        translateLen = (winH - winW) / 2;
        switch (degree) {
        case 0:
            translateLen = 0;
            break;
        case - 90 : w = h;
            h = winW;
            translateLen = -translateLen;
            break;
        case 90:
            w = h;
            h = winW;
            break;
        case 180:
            translateLen = 0;
            break;
        default:
            translateLen = 0
        }
        this.tablet.children().css({
            transform: "rotate(" + degree + "deg) translate(" + translateLen + "px," + translateLen + "px)",
            transformOrigin: "center center"
        });
        this.$canvas = this.tablet.find("canvas").eq(0);
        this.canvas = this.$canvas[0];
        this.ctx = this.canvas.getContext("2d");
        this._ctxInit();
        that.setCanvasWH(w, h);
        this.canvasReset();
        this.ctx.rotate( - angle);
        switch (degree) {
        case 0:
            break;
        case - 90 : this.ctx.translate(0, -this.width);
            break;
        case 90:
            this.ctx.translate( - this.height, 0);
            break;
        case - 180 : case 180:
            this.ctx.translate( - this.width, -this.height);
            break;
        default:
        }
    };
    Tablet.prototype.buildTablet = function() {
        var that = this,
        html = "",
        flex = "";
        if (this.isMobile) {
            flex = "flex "
        }
        html += '<div class="-tablet ' + flex + this.config.extraClass + '" id="' + this.id + '">';
        //html += '<div class="-tablet-container">';
        //html += '    <div class="tablet-btns">';
        //if (this.config.selectColor) {
        //    html += '   <input class="-color-picker color-color" type="text" value="字体色" readonly />'
        //}
        //html += '        <div class="clear-canvas">';
        //html += this.config.clearBtnHtml ? this.config.clearBtnHtml: "清屏";
        //html += "        </div>";
        if (typeof this.config.otherHtml === "string" && this.config.otherHtml.length > 0) {
            html += this.config.otherHtml
        }
        //html += "    </div>";
        html += '    <div class="-canvas-wrapper">';
        html += "        <canvas></canvas>";
        html += "    </div>";
        html += "</div>";
        html += "</div>";
        return html
    };
    Tablet.getMax = function(xPoints, yPoints) {
        var obj = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        if (({}).toString.call(xPoints) !== "[object Array]" || ({}).toString.call(yPoints) !== "[object Array]") {
            return obj
        }
        obj.left = Math.min.apply(null, xPoints);
        obj.right = Math.max.apply(null, xPoints);
        obj.top = Math.min.apply(null, yPoints);
        obj.bottom = Math.max.apply(null, yPoints);
        return obj
    };
    window.Tablet = Tablet
})(window);