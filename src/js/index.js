import SenseInferenceRender from "./inference";
import test from "../image/test.jpeg";

const DOM = document.getElementById("canvas");
const mockData = [];

for (let i = 0; i < 100; i++) {
  mockData[i] = [];
  for (let j = 0; j < 100; j++) {
    mockData[i][j] = Math.round(Math.random() * 12);
  }
}
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
    feature: mockData,
    label_matrix:
      "AAAAQEBAAAAQEBAAAAAQEBAAAAQEBAAAAAQEBAAAAQEBAAQEBAAAAAAAQEBAQEBAQEBAQEBA",
  },
  {
    // 检测
    type: "detection",
    father_index: 0,
    label: "老虎", // 表示其意义
    bbox: {
      // 框区域
      left: 240,
      top: 330,
      width: 166,
      height: 469,
    },
    confidence: 0.98, // 概率
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
    // 分类
    type: "classification",
    father_index: 0,
    bbox: {
      // 框区域
      left: 1040,
      top: 330,
      width: 166,
      height: 469,
    },
    attribute: "动物", // 分类属性，一张图片的分类属性可能会有多个，会被拆开作为一个独立的节点（比如“球类”，“大小”）；但是一个属性的所有分类作为一个独立的整体
    classes: {
      // 各个分类的意义和其概率
      篮球: 0.20996715128421783,
      狼王: 0.48788318037986755,
      排球: 0.19172067940235138,
      高尔夫: 0.10272260755300522,
      乒乓球: 0.0072526871226727962,
      网球: 0.000453635846497491,
    },
  },
  {
    // 关键点
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
];

const inference = new SenseInferenceRender({ dom: DOM, url: test, data: data });
console.log(inference);
