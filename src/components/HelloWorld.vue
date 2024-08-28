<template>
  <div id="cesiumContainer"></div>
  <div class="container">
    <NodeList
      @edit="openEdit"
      @deleteSate="deleteSate"
      @shotSate="shotSate"
      @trackSate="trackSate"
    />
    <CreatSate
      v-if="visible"
      @setSatePara="getSatePara"
      :editIndex="editIndex"
    />
    <button class="button" @click="(visible = true), (editIndex = undefined)">
      添加卫星
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import CreatSate from "./CreatSate.vue";
import NodeList from "./NodeList.vue";
import { useStore } from "vuex";

const store = useStore();

let viewer;
const visible = ref(false);
const sateArr = ref();
let editIndex = ref();

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MmUwNWJjOC0xNmZmLTRhOGUtYTEzNi1iYTM3Mjk2YzU3NmYiLCJpZCI6MTYzNzE0LCJpYXQiOjE2OTM0NjkzMDJ9.k80jNxQNVAl9ijau5Swcp1eGqUHY3mTqLScj5gr6bC4";

onMounted(() => {
  viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
  });
  sateArr.value = store.state.sateArr;
  if (sateArr.value.length) {
    loadSate();
  }
//   viewer.camera.flyTo({
//     // destination : Cesium.Cartesian3.fromDegrees(-122.19, 46.25, 5000.0),
//     orientation : {
//         direction : new Cesium.Cartesian3(-0.04231243104240401, -0.20123236049443421, -0.97862924300734),
//         up : new Cesium.Cartesian3(-0.47934589305293746, -0.8553216253114552, 0.1966022179118339)
//     }
// });
});

const createOrbit = (majorAxis, eccentricity, inclination) => {
  const position = new Cesium.SampledPositionProperty();
  const currentTime = Cesium.JulianDate.now();
  const timeStepInSeconds = 600;
  const totalSeconds = 86400;

  //？？？？？？？如何解决初始不出现point，我猜测是因为设置了timeStepInSeconds？？？？？？？
  //gpt的方法是：在循环添加位置时，先给开始时间加上位置，如这堆代码最后一行
  //   const angle = 1 * Cesium.Math.TWO_PI;
  //   const x = majorAxis * 1000 * Math.cos(angle);
  //   const y =
  //     majorAxis * 1000 * Math.sin(angle) * Math.sqrt(1 - eccentricity ** 2);
  //   const z = 0;
  //   const rotation = Cesium.Matrix3.fromRotationZ(
  //     Cesium.Math.toRadians(inclination)
  //   );
  //   const positionVector = new Cesium.Cartesian3(x, y, z);
  //   Cesium.Matrix3.multiplyByVector(rotation, positionVector, positionVector);
  // }
  // position.addSample(viewer.clock.startTime, positionVector);

  //我的方法是，把for循环的i初始值减去timeStepInSeconds
  for (let i = -timeStepInSeconds; i <= totalSeconds; i += timeStepInSeconds) {
    const time = Cesium.JulianDate.addSeconds(
      currentTime,//如果我没用以上2个方法，而是保持1=0，则用currentTime会导致初始不显示point，改成0又会静止不动，且没有轨道（应该是因为时间不是动态的所以不更新）
      i,
      new Cesium.JulianDate()
    );
    const angle = (i / totalSeconds) * Cesium.Math.TWO_PI;
    const x = majorAxis * 1000 * Math.cos(angle);
    const y =
      majorAxis * 1000 * Math.sin(angle) * Math.sqrt(1 - eccentricity ** 2);
    const z = 0;
    const rotation = Cesium.Matrix3.fromRotationZ(
      Cesium.Math.toRadians(inclination)
    );
    const positionVector = new Cesium.Cartesian3(x, y, z);
    Cesium.Matrix3.multiplyByVector(rotation, positionVector, positionVector);
    // if (
    //   isNaN(positionVector.x) ||
    //   isNaN(positionVector.y) ||
    //   isNaN(positionVector.z)
    // ) {
    //   continue;
    // }
    position.addSample(time, positionVector);
  }
  return { position };
};

//添加实体方法2-先单独设置实体属性，再用add添加这个属性，且方法有以下2种：
//1-用cesium的类进行实例化：const point = new Cesium.Entity({})
//2-如下直接用对象字面量，cesium会自动将其转换为一个 Entity 实例
const sateDot = (param, orbit) => {
  return {
    id: param.name,
    label: {
      text: param.name,
      show: true,
      fillColor: Cesium.Color.fromCssColorString(param.color), //字体颜色
      // backgroundColor:Cesium.Color.AQUA,    //背景颜色
      // showBackground:true,                //是否显示背景颜色
      // style: Cesium.LabelStyle.FILL,        //label样式
      // outlineWidth : 2,
      // verticalOrigin : Cesium.VerticalOrigin.CENTER,//垂直位置
      // horizontalOrigin :Cesium.HorizontalOrigin.CENTER,//水平位置
      pixelOffset: new Cesium.Cartesian2(0, -20), //偏移
      scale: 0.5,
    },
    position: orbit.position,
    point: {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString(param.color),
    },
    path: {
      resoltution: 60,
      width: 1,
      //这样设置轨道是随时间画出来的，不是一开始就完整展示的
      // leadTime: 0,
      // trailTime: 86400,
      //始终完整展示轨道
      leadTime: 86400, //一开始gpt推荐leadTime和trailTime都用Number.POSITIVE_INFINITY，但是leadtime会报错长度无效，因为生成轨道点过多，内存溢出了
      trailTime: 86400, //所以改成一个较大的时间（实际项目改成时间轴时间应该就可以）
      material: Cesium.Color.fromCssColorString(param.color),
    },
  };
};

const loadSate = async () => {
  viewer.entities.removeAll();
  // viewer.entities.suspendEvents(); //性能优化方法1：暂停事件处理
  for (let index = 0; index < sateArr.value.length; index++) {
    const param = sateArr.value[index];
    const { name, majorAxis, eccentricity, inclination, color } = param;
    const orbit = createOrbit(majorAxis, eccentricity, inclination);
    await viewer.entities.add(sateDot(param, orbit));
  }
  // viewer.entities.resumeEvents(); //性能优化方法1：恢复事件处理
};

const shotSate = async (index) => {
  //定位
  const sate = viewer.entities.getById(sateArr.value[index].name);
  viewer.clock.shouldAnimate = false;
  viewer.clock.multiplier = 1;  
  viewer.flyTo(sate, 
  {
    offset: new Cesium.HeadingPitchRange(10, Cesium.Math.toRadians(-20), 5000000),
    //0是heading，标示相机朝向正北（正数是顺时针旋转，负数是逆时针旋转）
    //第2个是pitch，-Cesium.Math.PI_OVER_TWO就是-90，向下看的意思，0表示平行地面，正数标朝上看，负数朝下看
    //最后一个数是range，标示距离目标的距离，单位：米
  }
);
  sate.point = undefined;
  const resource = Cesium.IonResource.fromAssetId(2653471).then((res) => {
    sate.model = {
      uri: res,
      minimumPixelSize: 80,
      maximmumScale: 2000,
    };
  });
};
const trackSate = (index) => {
  //实时追踪
  const sate = viewer.entities.getById(sateArr.value[index].name);
  sate.model = undefined;
  sate.point = {
    pixelSize: 10,
    color: Cesium.Color.fromCssColorString(sateArr.value[index].color),
  };
  console.log("trackSATE", sate);
  viewer.trackedEntity = sate;
  viewer.clock.shouldAnimate = true;
  viewer.clock.multiplier = 200;
};

const deleteSate = () => {
  visSate();
};

const getSatePara = (val) => {
  if (val === 1 || sateArr.value) {
    loadSate();
  }
  visible.value = false;
};

const openEdit = (val) => {
  visible.value = true;
  editIndex.value = val;
};
</script>

<style>
#cesiumContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.button {
  position: absolute;
  top: 20px;
  left: 20px;
}
</style>
