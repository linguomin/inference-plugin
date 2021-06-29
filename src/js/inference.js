/**
 * @description CreateContainer创建容器canvas准备画布
 * @param { DOM: Document }
 */
class CreateContainer {
  constructor(dom) {
    this.dom = dom;
    this.createCanvas();
  }

  createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "senseInference");
    canvas.width = this.dom.clientWidth;
    canvas.height = this.dom.clientHeight;
    this.canvasRatio = canvas.width / canvas.height;
    this.ctx = canvas.getContext("2d");
    this.dom.append(canvas);
    this.canvas = canvas;
  }
}

/**
 * @description InitImage画布中初始化加载图片
 * @param { url: string }
 */
class InitImage extends CreateContainer {
  constructor(dom, url) {
    super(dom);
    this.url = url;
  }

  createImage() {
    return new Promise(resolve => {
      const image = new Image();
      image.src = this.url;
      image.onload = () => {
        this.imageRatio = image.width / image.height;
        const canvasParam = {
          width: this.dom.clientWidth,
          height: this.dom.clientHeight,
          ratio: this.canvasRatio
        };
        const imageParam = {
          width: image.width,
          height: image.height,
          ratio: this.imageRatio
        };
        // 计算画布里面的图片大小位置
        this.sizePosition = computedCanvasImageSizePosition(
          canvasParam,
          imageParam
        );
        // 缩放比例
        this.scale = image.width / this.sizePosition.size.width;
        resolve(image);
      };
    });
  }
}

/**
 * @description computedCanvasImageSizePosition计算图片加载在画布中的大小位置
 * @param { width<number>, height<number>, ratio<number> } canvas
 * @param { width<number>, height<number>, ratio<number> } image
 * @returns { size: { width: number, height: number }, position: { x: number, y: number } }
 */
function computedCanvasImageSizePosition(canvas, image) {
  const result = { size: {}, position: {} };
  if (image.ratio > canvas.ratio) {
    result.size = { width: canvas.width, height: canvas.width / image.ratio };
  } else {
    result.size = { width: canvas.height * image.ratio, height: canvas.height };
  }
  if (canvas.width > image.width) {
    result.position = { x: (canvas.width - result.size.width) / 2, y: 0 };
  } else {
    result.position = { x: 0, y: (canvas.height - result.size.height) / 2 };
  }
  return result;
}

/**
 * @description 处理SenseInferenceRender中的data数据
 * @param { data: Array, scale: number, position: Object }
 * @returns { detection: Array, classification: Array, segmentation: Array, keypoint: Array }
 */
function listenChangeData(data, scale, position) {
  if (JSON.stringify(data) === "{}") {
    return [];
  }
  const result = [];
  for (const item of data) {
    if (item.type === "segmentation") {
      result.push(item);
      continue;
    }
    // 计算box缩放后的大小
    if (item.bbox) {
      item.bbox.left = item.bbox.left / scale + position.x;
      item.bbox.top = item.bbox.top / scale + position.y;
      item.bbox.width = item.bbox.width / scale;
      item.bbox.height = item.bbox.height / scale;
    }
    // 计算关键点缩放后的大小
    if (item.points) {
      for (const point of item.points) {
        point.x = point.x / scale + position.x;
        point.y = point.y / scale + position.y;
      }
    }
    result.push(item);
  }
  return result;
}

/**
 * @description 生成随机rgba颜色
 * @returns { r: number, g: number, b: number, a: number }
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return { r, g, b, a: 150 };
}

/**
 * @description SenseInferenceRender最终导出的实例
 * @param { dom: Document, url: string, data: Array } Object
 */
class SenseInferenceRender extends InitImage {
  constructor({ dom, url, data }) {
    super(dom, url);
    this.bboxStyle = {
      strokeStyle: "red",
      lineWidth: 1,
      fillStyle: "transparent"
    };
    this.randomColor = {};
    this.font = {
      fontSize: 14,
      fontFamily: "微软雅黑",
      color: "#000"
    };
    this.createImage().then(image => {
      if (image) {
        this.data = listenChangeData(
          data,
          this.scale,
          this.sizePosition.position
        );

        for (const item of this.data) {
          if (item.type === "segmentation") {
            this.drawSegmentationData(item).then(url => {
              image.src = url;
              image.onload = () => {
                this.ctx.drawImage(
                  image,
                  this.sizePosition.position.x,
                  this.sizePosition.position.y,
                  this.sizePosition.size.width,
                  this.sizePosition.size.height
                );
              };
            });
          }
          if (item.type === "detection") {
            this.drawDetectionData(item);
          }
          if (item.type === "classification") {
            this.drawClassificationData(item);
          }
          if (item.type === "keypoint") {
            this.drawKeypointData();
          }
        }

        setTimeout(() => {
          this.base64png = this.canvas.toDataURL("image/png");
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          image.src = this.url;
          image.onload = () => {
            this.ctx.drawImage(
              image,
              this.sizePosition.position.x,
              this.sizePosition.position.y,
              this.sizePosition.size.width,
              this.sizePosition.size.height
            );
            image.src = this.base64png;
            image.onload = () => {
              this.ctx.drawImage(
                image,
                0,
                0,
                this.canvas.width,
                this.canvas.height
              );
            };
          };
        });
      }
    });
  }

  // 处理物体检测数据
  drawDetectionData(item) {
    // 绘制矩形
    const strokeStyle = item.bbox.strokeStyle
      ? item.bbox.strokeStyle
      : this.bboxStyle.strokeStyle;
    const lineWidth = item.bbox.lineWidth
      ? item.bbox.lineWidth
      : this.bboxStyle.lineWidth;
    const fillStyle = item.bbox.fillStyle
      ? item.bbox.fillStyle
      : this.bboxStyle.fillStyle;

    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;
    this.ctx.fillStyle = fillStyle;

    this.ctx.beginPath();
    this.ctx.rect(
      item.bbox.left,
      item.bbox.top,
      item.bbox.width,
      item.bbox.height
    );
    this.ctx.stroke();
    this.ctx.fill();

    if (item.label.length) {
      const fontSize = item.bbox.fontSize
        ? item.bbox.fontSize
        : this.font.fontSize;
      const fontFamily = item.bbox.fontFamily
        ? item.bbox.fontFamily
        : this.font.fontFamily;
      this.ctx.font = `${fontSize}px ${fontFamily}`;

      const labelWidth = this.ctx.measureText(item.label).width + 6;

      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = lineWidth;
      this.ctx.fillStyle = strokeStyle;
      this.ctx.beginPath();
      this.ctx.rect(
        item.bbox.left,
        item.bbox.top - fontSize - 5,
        labelWidth,
        fontSize + 4
      );
      this.ctx.stroke();
      this.ctx.fill();

      // 绘制文字
      const color = item.bbox.color ? item.bbox.color : this.font.color;
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillText(item.label, item.bbox.left + 3, item.bbox.top - 2);
    }
  }

  // 处理图像分类数据
  drawClassificationData(item) {
    // 绘制矩形
    const strokeStyle = item.bbox.strokeStyle
      ? item.bbox.strokeStyle
      : this.bboxStyle.strokeStyle;
    const lineWidth = item.bbox.lineWidth
      ? item.bbox.lineWidth
      : this.bboxStyle.lineWidth;
    const fontSize = item.bbox.fontSize
      ? item.bbox.fontSize
      : this.font.fontSize;
    const fontFamily = item.bbox.fontFamily
      ? item.bbox.fontFamily
      : this.font.fontFamily;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    if (item.classes && Object.keys(item.classes).length) {
      const arr = Object.values(item.classes);
      const maxValue = Math.max(...arr);
      const maxValueIndex = arr.indexOf(maxValue);
      const maxValueLabel = Object.keys(item.classes)[maxValueIndex];

      const labelWidth = this.ctx.measureText(maxValueLabel).width + 6;

      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = lineWidth;
      this.ctx.fillStyle = strokeStyle;
      this.ctx.beginPath();
      this.ctx.rect(
        item.bbox.left - 2,
        item.bbox.top + 2,
        labelWidth,
        fontSize + 4
      );
      this.ctx.stroke();
      this.ctx.fill();

      const color = item.bbox.color ? item.bbox.color : this.font.color;
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "bottom";
      this.ctx.fillText(
        maxValueLabel,
        item.bbox.left,
        item.bbox.top + fontSize + 5
      );
    }
  }

  // 处理图像分割数据
  drawSegmentationData(item) {
    this.computedRandomColor();
    return new Promise(resolve => {
      const segCanvas = document.createElement("canvas");

      segCanvas.width = item.width;
      segCanvas.height = item.height;
      segCanvas.setAttribute("style", "visibility: hidden");
      document.body.append(segCanvas);

      // 获取画笔
      const segCanvasCtx = segCanvas.getContext("2d");
      // 创建新的空白图片
      const segImage = segCanvasCtx.createImageData(
        item.width,
        item.height
      );

      // 解析base64解码
      const dec = window.atob(item.label_matrix);

      const bs = [];
      for (let index = 0; index < dec.length; index++) {
        bs[index] = dec.charCodeAt(index);
      }

      for (let i = 0; i < bs.length; i++) {
        if (bs[i] === 0) {
          continue;
        }

        segImage.data[i * 4 + 0] = this.randomColor[bs[i]].r;
        segImage.data[i * 4 + 1] = this.randomColor[bs[i]].g;
        segImage.data[i * 4 + 2] = this.randomColor[bs[i]].b;
        segImage.data[i * 4 + 3] = this.randomColor[bs[i]].a;
      }

      segCanvasCtx.putImageData(segImage, 0, 0);

      const base64Url = segCanvas.toDataURL("image/png");

      // document.body.removeChild(segCanvas);
      console.log(base64Url);
      resolve(base64Url);
    });
  }

  // 处理关键点数据
  drawKeypointData(item) {}

  // 添加随机颜色
  computedRandomColor() {
    for (let index = 1; index <= 500; index++) {
      this.randomColor[index] = getRandomColor();
    }
  }
}

export default SenseInferenceRender;
