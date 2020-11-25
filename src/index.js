export default class senseInference {
  constructor(id) {
    this.id = id;
    this.container = document.getElementById(this.id);
    this.scale = null; // 图片缩放比例
    this.image = {}; // 图片信息
    this.canvas = {}; // 画布信息
    this.senseImage = {
      position: [],
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
      color: "#fff",
    };

    this.classificationStyle = {
      lineWidth: 1,
      borderColor: "blue",
      textBackground: "blue",
      fontFamily: "微软雅黑",
      fontSize: 20,
      color: "#fff",
    };

    this.segmentationStyle = {};
  }

  // 生成图片及图中内容
  init(url) {
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
    const image = new Image();
    image.src = this.image.url;
    image.onload = () => {
      this.image.width
        ? (image.width = this.image.width)
        : (this.image.width = image.width);
      this.image.height
        ? (image.height = this.image.height)
        : (this.image.height = image.height);
      this.image.aspectRatio = this.image.width / this.image.height;

      // 通过画布比跟图片比计算加载后的图片高宽
      if (this.image.aspectRatio > this.canvas.aspectRatio) {
        this.senseImage.width = this.canvas.dom.width;
        this.senseImage.height = this.canvas.dom.width / this.image.aspectRatio;
      } else {
        this.senseImage.width = this.canvas.dom.height * this.image.aspectRatio;
        this.senseImage.height = this.canvas.dom.height;
      }
      // 通过画布与加载的图片高宽比计算图片加载的位置
      if (this.canvas.dom.width > this.senseImage.width) {
        this.senseImage.position[0] =
          (this.canvas.dom.width - this.senseImage.width) / 2;
        this.senseImage.position[1] = 0;
      }
      if (this.canvas.dom.height > this.senseImage.height) {
        this.senseImage.position[0] = 0;
        this.senseImage.position[1] =
          (this.canvas.dom.height - this.senseImage.height) / 2;
      }

      // 缩放比例
      this.scale = this.image.width / this.senseImage.width;
      // 画图
      this.canvas.ctx.drawImage(
        image,
        this.senseImage.position[0],
        this.senseImage.position[1],
        this.senseImage.width,
        this.senseImage.height
      );

      if (this.detection) {
        this.loadDetection();
      }
      if (this.classification) {
        this.loadClassification();
      }
      if (this.segmentation) {
        this.loadSegmentation().then((res) => {
          image.src = res;
          image.onload = () => {
            this.canvas.ctx.drawImage(
              image,
              this.senseImage.position[0],
              this.senseImage.position[1],
              this.senseImage.width,
              this.senseImage.height
            );
          };
        });
      }
    };
  }

  // 加载物体检测数据
  loadDetection() {
    for (const item of this.detection) {
      item.senseBbox.left =
        item.bbox.left / this.scale + this.senseImage.position[0];
      item.senseBbox.top =
        item.bbox.top / this.scale + this.senseImage.position[1];
      item.senseBbox.width = item.bbox.width / this.scale;
      item.senseBbox.height = item.bbox.height / this.scale;

      this.drawRect(
        item.senseBbox.left,
        item.senseBbox.top,
        item.senseBbox.width,
        item.senseBbox.height,
        this.detectionStyle
      );

      if (this.detectionStyle.show) {
        this.drawText(
          item.label,
          [item.senseBbox.left, item.senseBbox.top],
          this.detectionStyle
        );
      }
    }
  }

  // 加载图像分类数据
  loadClassification() {
    this.drawText(
      this.classification.label,
      [this.senseImage.position[0] + 20, this.senseImage.position[1] + 40],
      this.classificationStyle
    );
  }

  // 加载图片分割数据
  loadSegmentation() {
    return new Promise((resolve) => {
      const virtualCanvas = document.createElement("canvas");
      virtualCanvas.width = this.segmentation.length;
      virtualCanvas.height = this.segmentation[0].length;
      virtualCanvas.setAttribute("style", "visibility: hidden");
      document.body.append(virtualCanvas);
      // 获取画笔
      const virtualCtx = virtualCanvas.getContext("2d");
      virtualCtx.lineWidth = 1;

      for (let y = 0; y <= this.segmentation.length; y++) {
        for (let x = 0; x <= this.segmentation[0].length; x++) {
          if (!this.segmentation[y] || this.segmentation[y][x] === 0) {
            continue;
          }

          if (x == 0) {
            virtualCtx.beginPath();
            virtualCtx.strokeStyle = this.segmentationStyle[
              this.segmentation[y][x]
            ];
            virtualCtx.moveTo(y, x);
          } else if (this.segmentation[y][x] == this.segmentation[y][x - 1]) {
            virtualCtx.lineTo(y, x);
          } else {
            virtualCtx.stroke();
            virtualCtx.beginPath();
            virtualCtx.strokeStyle = this.segmentationStyle[
              this.segmentation[y][x]
            ];
            virtualCtx.moveTo(y, x);
          }
        }
      }
      const base64Url = virtualCanvas.toDataURL("image/png");
      document.body.removeChild(virtualCanvas);
      resolve(base64Url);
    });
  }

  // 绘制矩形
  drawRect(left, top, width, height, style) {
    this.canvas.ctx.strokeStyle = style.borderColor;
    this.canvas.ctx.lineWidth = style.lineWidth;
    this.canvas.ctx.fillStyle = style.background;

    this.canvas.ctx.beginPath();
    this.canvas.ctx.rect(left, top, width, height);
    this.canvas.ctx.stroke();
    this.canvas.ctx.fill();
  }

  // 绘制文本
  drawText(text, position, style) {
    if (!text.length) {
      return;
    }
    this.canvas.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
    const textWidth = this.canvas.ctx.measureText(text).width + 6;
    // 画框
    this.drawRect(
      position[0],
      position[1] - style.fontSize - 5,
      textWidth,
      style.fontSize + 4,
      {
        borderColor: style.borderColor,
        lineWidth: style.lineWidth,
        background: style.textBackground,
      }
    );

    // 绘制文字
    this.canvas.ctx.beginPath();
    this.canvas.ctx.fillStyle = style.color;
    this.canvas.ctx.textAlign = "left";
    this.canvas.ctx.textBaseline = "bottom";
    this.canvas.ctx.fillText(text, position[0] + 3, position[1] - 2);
  }

  // 添加物体检测数据
  addDetection(data) {
    for (const item of data) {
      item.senseBbox = { left: null, top: null, width: null, height: null };
    }
    this.detection = data;
  }

  // 添加图像分类数据
  addClassification(data) {
    this.classification = data;
  }

  // 添加图像分割数据
  addSegmentation(data) {
    this.segmentation = data;
    if (JSON.stringify(this.segmentationStyle) === "{}") {
      for (let index = 0; index <= 100; index++) {
        this.segmentationStyle[index] = this.getRandomColor();
      }
    }
  }

  // 添加颜色
  addSegmentationColor(data) {
    this.segmentationStyle = data;
  }

  // 设置图片大小
  setImageSize({ width, height }) {
    this.image.width = width;
    this.image.height = height;
  }

  // 生成随机颜色
  getRandomColor() {
    return "#" + Math.random().toString(16).slice(2, 8);
  }
}
