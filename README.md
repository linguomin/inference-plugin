# inference-plugin

描述：根据算法得到的推理结果展示物体检测、图像分类、图像分割内容

## 使用方法

### 安装

```install
npm istall inference-plugin
```

### 组件内引入

```import
import senseInference from 'inference-plugin';
```

### 实例化前提

***声明一个div作为承载容器，例：***

`<div id="myCanvas"></div>`

#### 物体检测算法调用

```detection
const url = "./img.png";

const data = [
  {
    bbox: {
      left: 50,
      top: 50,
      width: 50,
      height: 50,
    },
    label: "汽车",
  },
  {
    bbox: {
      left: 100,
      top: 100,
      width: 100,
      height: 100,
    },
    label: "绝缘子",
  },
]; // data里面的数据字段名不可更改，babel没有需传空字符串，一个对象代表一个框

// 初始化实例
const detection = new senseInference("myCanvas");

// 添加物体检测框数据
detection.addDetection(data);

// 传入url加载图片及渲染检测框
detection.init(url);
```

#### 图像分类算法调用

```classification
const url = "./img.png";

const data = {
  label: "苹果",
}; // label为必需，如添加了字段插件不执行，如有需求请提需求

// 初始化实例
const classification = new senseInference("myCanvas");

// 添加物体检测框数据
classification.addClassification(data);

// 传入url加载图片及渲染标签
classification.init(url);
```

#### 图像分割算法调用

```lightSeg
const url = "./img.png";

const data = [
  [0,1,2,0,0,0,1,1,1,2,2,2,1,1,0],
  [0,1,2,0,0,0,1,1,1,2,2,2,1,1,0],
  [0,1,2,0,0,0,1,1,1,2,2,2,1,1,0],
  [0,1,2,0,0,0,1,1,1,2,2,2,1,1,0],
  [0,1,2,0,0,0,1,1,1,2,2,2,1,1,0],
]; // 数组内代表标签枚举，0为背景色，其余视情况而定

// 初始化实例
const lightSeg = new senseInference("myCanvas");

// 可设定背景颜色,0不渲染，其余可设定标签枚举定义颜色；
// 如不设定则不需要调用addSegmentationColor方法，内部自取随机100种颜色，不设定颜色最多支持100种颜色
const color = { 0: '#000', 1: "red" };
lightSeg.addSegmentationColor({ 0: "#000", 1: "red" });

// 添加图像分割数据
lightSeg.addSegmentation(data);

// 传入url加载图片
lightSeg.init(url);
```

***插件如有bug请联系linguomin_sam@163.com***
