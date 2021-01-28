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
    return new Promise((resolve) => {
      const image = new Image();
      image.src = this.url;
      image.onload = () => {
        this.imageRatio = image.width / image.height;
        const canvasParam = {
          width: this.dom.clientWidth,
          height: this.dom.clientHeight,
          ratio: this.canvasRatio,
        };
        const imageParam = {
          width: image.width,
          height: image.height,
          ratio: this.imageRatio,
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
    result.size = { width: canvas.height / image.ratio, height: canvas.height };
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
 * @description 生成随机颜色
 * @returns 十六进制颜色 #000000
 */
function getRandomColor() {
  return "#" + Math.random().toString(16).slice(2, 8);
}

/**
 * @description computedSegmentationFeature处理图像分割二进制数据
 * @param label_matrix 图像分割二进制数据解析
 */
function computedSegmentationFeature(label_matrix, width) {
  // 解析base64解码
  const dec = window.atob(label_matrix);
  const bs = [];
  for (let index = 0; index < dec.length; index++) {
    bs[index] = dec.charCodeAt(index);
  }
  const arr = chunk(bs, width);
  const result = [];
  for (let i = 0; i < arr[0].length; i++) {
    result[i] = [];
  }
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      result[j][i] = arr[i][j];
    }
  }

  return result;
}

/**
 * @description 将数据分成指定大小的数组
 * @param { data: Array, size: number }
 * @return { Array }
 */
function chunk(data, size) {
  return Array.from({ length: Math.ceil(data.length / size) }, (v, i) =>
    data.slice(i * size, i * size + size)
  );
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
      fillStyle: "transparent",
    };
    this.randomColor = {};
    this.font = {
      fontSize: 14,
      fontFamily: "微软雅黑",
      color: "#000",
    };
    this.createImage().then((image) => {
      if (image) {
        this.data = listenChangeData(
          data,
          this.scale,
          this.sizePosition.position
        );
        this.ctx.drawImage(
          image,
          this.sizePosition.position.x,
          this.sizePosition.position.y,
          this.sizePosition.size.width,
          this.sizePosition.size.height
        );
        for (const item of this.data) {
          if (item.type === "detection") {
            this.drawDetectionData(item);
          }
          if (item.type === "classification") {
            this.drawClassificationData(item);
          }
          if (item.type === "keypoint") {
            this.drawKeypointData();
          }
          if (item.type === "segmentation") {
            this.drawSegmentationData(item).then((url) => {
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
        }
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
    if (item.classes) {
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
    return new Promise((resolve) => {
      const segCanvas = document.createElement("canvas");
      const feature = item.feature
        ? item.feature
        : computedSegmentationFeature(item.label_matrix, item.bbox.width);
      segCanvas.width = feature.length;
      segCanvas.height = feature[0].length;
      segCanvas.setAttribute("style", "visibility: hidden");
      document.body.append(segCanvas);

      // 获取画笔
      const segCanvasCtx = segCanvas.getContext("2d");
      segCanvasCtx.lineWidth = 1;

      for (let y = 0; y <= feature.length; y++) {
        for (let x = 0; x <= feature[0].length; x++) {
          if (!feature[y] || feature[y][x] === 0) {
            continue;
          }

          if (x == 0) {
            segCanvasCtx.beginPath();
            segCanvasCtx.strokeStyle = this.randomColor[feature[y][x]];
            segCanvasCtx.moveTo(y, x);
          } else if (feature[y][x] == feature[y][x - 1]) {
            segCanvasCtx.lineTo(y, x);
          } else {
            segCanvasCtx.stroke();
            segCanvasCtx.beginPath();
            segCanvasCtx.strokeStyle = this.randomColor[feature[y][x]];
            segCanvasCtx.moveTo(y, x);
          }
        }
      }
      const base64Url = segCanvas.toDataURL("image/png");
      document.body.removeChild(segCanvas);
      resolve(base64Url);
    });
  }

  // 处理关键点数据
  drawKeypointData(item) {}

  // 添加随机颜色
  computedRandomColor() {
    for (let index = 0; index <= 100; index++) {
      this.randomColor[index] = getRandomColor();
    }
  }
}

export default SenseInferenceRender;
