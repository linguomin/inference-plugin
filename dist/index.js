"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var senseInference = function () {
  function senseInference(id) {
    _classCallCheck(this, senseInference);

    this.id = id;
    this.container = document.getElementById(this.id);
    this.scale = null; // 图片缩放比例
    this.image = {}; // 图片信息
    this.canvas = {}; // 画布信息
    this.senseImage = {
      position: []
    }; // 画布中图片的信息

    this.detection = null; // 物体检测数据
    this.classification = null; // 图像分类数据
    this.segmentation = null; // 图像分割数据

    this.detectionStyle = {
      lineWidth: 1,
      borderColor: "red",
      background: "transparent",
      textBackground: "red",
      show: true,
      fontFamily: "微软雅黑",
      fontSize: 14,
      color: "#fff"
    };

    this.classificationStyle = {
      lineWidth: 1,
      borderColor: "blue",
      textBackground: "blue",
      fontFamily: "微软雅黑",
      fontSize: 20,
      color: "#fff"
    };

    this.segmentationStyle = {};
  }

  // 生成图片及图中内容


  _createClass(senseInference, [{
    key: "init",
    value: function init(url) {
      var _this = this;

      this.image.url = url;
      // 生成画布DOM
      this.canvas.dom = document.createElement("canvas");
      this.canvas.dom.setAttribute("id", "senseCanvas");
      this.container.append(this.canvas.dom);
      this.canvas.dom.width = this.container.clientWidth;
      this.canvas.dom.height = this.container.clientHeight;
      this.canvas.aspectRatio = this.canvas.dom.width / this.canvas.dom.height;
      // 获取画笔
      this.canvas.ctx = this.canvas.dom.getContext("2d");
      // 生成加载图片
      var image = new Image();
      image.src = this.image.url;
      image.onload = function () {
        _this.image.width ? image.width = _this.image.width : _this.image.width = image.width;
        _this.image.height ? image.height = _this.image.height : _this.image.height = image.height;
        _this.image.aspectRatio = _this.image.width / _this.image.height;

        // 通过画布比跟图片比计算加载后的图片高宽
        if (_this.image.aspectRatio > _this.canvas.aspectRatio) {
          _this.senseImage.width = _this.canvas.dom.width;
          _this.senseImage.height = _this.canvas.dom.width / _this.image.aspectRatio;
        } else {
          _this.senseImage.width = _this.canvas.dom.height * _this.image.aspectRatio;
          _this.senseImage.height = _this.canvas.dom.height;
        }
        // 通过画布与加载的图片高宽比计算图片加载的位置
        if (_this.canvas.dom.width > _this.senseImage.width) {
          _this.senseImage.position[0] = (_this.canvas.dom.width - _this.senseImage.width) / 2;
          _this.senseImage.position[1] = 0;
        }
        if (_this.canvas.dom.height > _this.senseImage.height) {
          _this.senseImage.position[0] = 0;
          _this.senseImage.position[1] = (_this.canvas.dom.height - _this.senseImage.height) / 2;
        }

        // 缩放比例
        _this.scale = _this.image.width / _this.senseImage.width;
        // 画图
        _this.canvas.ctx.drawImage(image, _this.senseImage.position[0], _this.senseImage.position[1], _this.senseImage.width, _this.senseImage.height);

        if (_this.detection) {
          _this.loadDetection();
        }
        if (_this.classification) {
          _this.loadClassification();
        }
        if (_this.segmentation) {
          _this.loadSegmentation().then(function (res) {
            image.src = res;
            image.onload = function () {
              _this.canvas.ctx.drawImage(image, _this.senseImage.position[0], _this.senseImage.position[1], _this.senseImage.width, _this.senseImage.height);
            };
          });
        }
      };
    }

    // 加载物体检测数据

  }, {
    key: "loadDetection",
    value: function loadDetection() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.detection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item.senseBbox.left = item.bbox.left / this.scale + this.senseImage.position[0];
          item.senseBbox.top = item.bbox.top / this.scale + this.senseImage.position[1];
          item.senseBbox.width = item.bbox.width / this.scale;
          item.senseBbox.height = item.bbox.height / this.scale;

          this.drawRect(item.senseBbox.left, item.senseBbox.top, item.senseBbox.width, item.senseBbox.height, this.detectionStyle);

          if (this.detectionStyle.show) {
            this.drawText(item.label, [item.senseBbox.left, item.senseBbox.top], this.detectionStyle);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    // 加载图像分类数据

  }, {
    key: "loadClassification",
    value: function loadClassification() {
      this.drawText(this.classification.label, [this.senseImage.position[0] + 20, this.senseImage.position[1] + 40], this.classificationStyle);
    }

    // 加载图片分割数据

  }, {
    key: "loadSegmentation",
    value: function loadSegmentation() {
      var _this2 = this;

      return new Promise(function (resolve) {
        var virtualCanvas = document.createElement("canvas");
        virtualCanvas.width = _this2.segmentation.length;
        virtualCanvas.height = _this2.segmentation[0].length;
        virtualCanvas.setAttribute("style", "visibility: hidden");
        document.body.append(virtualCanvas);
        // 获取画笔
        var virtualCtx = virtualCanvas.getContext("2d");
        virtualCtx.lineWidth = 1;

        for (var y = 0; y <= _this2.segmentation.length; y++) {
          for (var x = 0; x <= _this2.segmentation[0].length; x++) {
            if (!_this2.segmentation[y] || _this2.segmentation[y][x] === 0) {
              continue;
            }

            if (x == 0) {
              virtualCtx.beginPath();
              virtualCtx.strokeStyle = _this2.segmentationStyle[_this2.segmentation[y][x]];
              virtualCtx.moveTo(y, x);
            } else if (_this2.segmentation[y][x] == _this2.segmentation[y][x - 1]) {
              virtualCtx.lineTo(y, x);
            } else {
              virtualCtx.stroke();
              virtualCtx.beginPath();
              virtualCtx.strokeStyle = _this2.segmentationStyle[_this2.segmentation[y][x]];
              virtualCtx.moveTo(y, x);
            }
          }
        }
        var base64Url = virtualCanvas.toDataURL("image/png");
        document.body.removeChild(virtualCanvas);
        resolve(base64Url);
      });
    }

    // 绘制矩形

  }, {
    key: "drawRect",
    value: function drawRect(left, top, width, height, style) {
      this.canvas.ctx.strokeStyle = style.borderColor;
      this.canvas.ctx.lineWidth = style.lineWidth;
      this.canvas.ctx.fillStyle = style.background;

      this.canvas.ctx.beginPath();
      this.canvas.ctx.rect(left, top, width, height);
      this.canvas.ctx.stroke();
      this.canvas.ctx.fill();
    }

    // 绘制文本

  }, {
    key: "drawText",
    value: function drawText(text, position, style) {
      if (!text.length) {
        return;
      }
      this.canvas.ctx.font = style.fontSize + "px " + style.fontFamily;
      var textWidth = this.canvas.ctx.measureText(text).width + 6;
      // 画框
      this.drawRect(position[0], position[1] - style.fontSize - 5, textWidth, style.fontSize + 4, {
        borderColor: style.borderColor,
        lineWidth: style.lineWidth,
        background: style.textBackground
      });

      // 绘制文字
      this.canvas.ctx.beginPath();
      this.canvas.ctx.fillStyle = style.color;
      this.canvas.ctx.textAlign = "left";
      this.canvas.ctx.textBaseline = "bottom";
      this.canvas.ctx.fillText(text, position[0] + 3, position[1] - 2);
    }

    // 添加物体检测数据

  }, {
    key: "addDetection",
    value: function addDetection(data) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          item.senseBbox = { left: null, top: null, width: null, height: null };
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.detection = data;
    }

    // 添加图像分类数据

  }, {
    key: "addClassification",
    value: function addClassification(data) {
      this.classification = data;
    }

    // 添加图像分割数据

  }, {
    key: "addSegmentation",
    value: function addSegmentation(data) {
      this.segmentation = data;
      if (JSON.stringify(this.segmentationStyle) === "{}") {
        for (var index = 0; index <= 100; index++) {
          this.segmentationStyle[index] = this.getRandomColor();
        }
      }
    }

    // 添加颜色

  }, {
    key: "addSegmentationColor",
    value: function addSegmentationColor(data) {
      this.segmentationStyle = data;
    }

    // 设置图片大小

  }, {
    key: "setImageSize",
    value: function setImageSize(_ref) {
      var width = _ref.width,
          height = _ref.height;

      this.image.width = width;
      this.image.height = height;
    }

    // 生成随机颜色

  }, {
    key: "getRandomColor",
    value: function getRandomColor() {
      return "#" + Math.random().toString(16).slice(2, 8);
    }
  }]);

  return senseInference;
}();

exports.default = senseInference;
