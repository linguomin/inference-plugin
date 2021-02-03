# inference-plugin

描述：根据算法得到的推理结果展示物体检测、图像分类、图像分割、关键点内容

## 开发环境

***安装依赖***

```install
npm install
```

***启动开发服务***

```start
npm start
```

## 线上环境

***编译***

```build
npm run build
```

***运行build生成的dist文件***

```run
1、打开控制台进入dist文件夹
2、执行命令： python -m SimpleHTTPServer
```

## 使用方法

### 安装

```install
npm install inference-plugin
```

***HTML声明一个div作为承载容器，例：***

`<div id="myCanvas"></div>`

***js逻辑，例：***

```javascript
// 引入方法
import SenseInferenceRender from 'inference-plugin';
// 引入图片
import test from "../image/test.jpeg";

// 获取DOM
const DOM = document.getElementById("myCanvas");

// 准备数据
const data = [
  {
    // 检测
    type: "detection",
    father_index: 0,
    label: "老虎", // 表示其意义
    bbox: {
      // 框区域
      left: 540,
      top: 330,
      width: 166,
      height: 469,
    },
    confidence: 0.98, // 概率
  },
  {
    // 分割
    type: "segmentation",
    father_index: 0,
    name: "",
    channel: 1,
    bbox: {
      // feature区域
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    },
    label_matrix:
      "AAAAQEBAAAAQEBAAAAAQEBAAAAQEBAAAAAQEBAAAAQEBAAQEBAAAAAAAQEBAQEBAQEBAQEBA",
  },
  {
    // 分类
    type: "classification",
    father_index: 0,
    bbox: {
      // 框区域
      left: 1240,
      top: 330,
      width: 166,
      height: 469,
    },
    attribute: "球类", // 分类属性，一张图片的分类属性可能会有多个，会被拆开作为一个独立的节点（比如“球类”，“大小”）；但是一个属性的所有分类作为一个独立的整体
    classes: {
      // 各个分类的意义和其概率
      篮球: 0.20996715128421783,
      足球: 0.48788318037986755,
      排球: 0.19172067940235138,
      高尔夫: 0.10272260755300522,
      乒乓球: 0.0072526871226727962,
      网球: 0.000453635846497491,
    },
  },
  {
    // 关键点 暂时不支持
    type: "keypoint",
    father_index: 0,
    bbox: {
      // 框区域
      left: 1240,
      top: 330,
      width: 166,
      height: 469,
    },
    points: [
      // 有关联的一组关键点（根据需求进行分割，比如吊弦上下关键点分类是分开产生作用的，将其分开；而吊弦关键点线检测是通过两个点一起发生作用的，不分开，TODO，确认panorama是否有此需求）
      {
        confidence: 0.63401412963867188,
        visibility: 0.97283381223678589,
        x: 156.99609375,
        y: 821.7265625,
      },
      {
        confidence: 0.76698744297027588,
        visibility: 0.96908289194107056,
        x: 144.10546875,
        y: 821.7265625,
      },
    ],
  },
]

const inference = new SenseInferenceRender({ dom: DOM, url: test, data: data });
console.log(inference);

// 如果需要获取无底图png图片，可以按下面的代码进行获取，不需要就不用写
const imgbase64 = inference.base64png;
```

***插件如有bug请联系linguomin_sam@163.com***
