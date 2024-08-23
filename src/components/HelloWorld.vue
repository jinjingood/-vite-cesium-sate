<template>
  <div id="cesiumContainer"></div>
  <div class="container">
    <NodeList @edit="openEdit" @deleteSate="deleteSate" @shotSate="shotSate"/>
    <CreatSate
      v-if="visible"
      @setSatePara="getSatePara"
      :editIndex="editIndex"
    />
    <!-- <CreatSate v-if="visible" @setSatePara="close" /> -->
    <button class="button" @click="(visible = true), (editIndex = undefined)">
      添加卫星
    </button>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as Cesium from "cesium";
import CreatSate from "./CreatSate.vue";
import NodeList from "./NodeList.vue";
import { useStore } from "vuex";

const store = useStore();

let viewer;
const visible = ref(false);
const sateArr = ref();
let editIndex = ref();
// let start = Cesium.JulianDate.fromDate(new Date()); //获取当前实际时间
// start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()); //把start获取的时间加8个小时，存储为1个新的cesium时间
// let stop = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()); //把start获取的时间加8个小时，存储为1个新的cesium时间

// viewer.clock.startTime=start.clone()
// viewer.clock.currentTime=start.clone()
// viewer.clock.stopTime=stop.clone()
// viewer.timeline.zoomTo(start,stop)

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MmUwNWJjOC0xNmZmLTRhOGUtYTEzNi1iYTM3Mjk2YzU3NmYiLCJpZCI6MTYzNzE0LCJpYXQiOjE2OTM0NjkzMDJ9.k80jNxQNVAl9ijau5Swcp1eGqUHY3mTqLScj5gr6bC4";

onMounted(() => {
  viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
  });
  sateArr.value = store.state.sateArr;
  if (sateArr.value.length) {
    visSate();
  }
});

let sate
const createOrbit = (majorAxis, eccentricity, inclination) => {
      const position = new Cesium.SampledPositionProperty();
      const currentTime = Cesium.JulianDate.now();
      const timeStepInSeconds = 600;
      const totalSeconds = 86400;
      for (let i = 0; i <= totalSeconds; i += timeStepInSeconds) {
        const time = Cesium.JulianDate.addSeconds(
          currentTime,
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
        Cesium.Matrix3.multiplyByVector(
          rotation,
          positionVector,
          positionVector
        );
        // if (
        //   isNaN(positionVector.x) ||
        //   isNaN(positionVector.y) ||
        //   isNaN(positionVector.z)
        // ) {
        //   console.log("校验");
        //   continue;
        // }
        position.addSample(time, positionVector);
      }
      return { position };
    };
const visSate = () => {
  viewer.entities.removeAll();
  for (let index = 0; index < sateArr.value.length; index++) {
    const param = sateArr.value[index];
    const { name, majorAxis, eccentricity, inclination, color } = param;
     const orbit = createOrbit(majorAxis, eccentricity, inclination);
      sate = viewer.entities.add({
      name,
      position: orbit.position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString(color),
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
        material: Cesium.Color.fromCssColorString(color),
      },
    });
  }
};
const shotSate=(index)=>{
  const param = sateArr.value[index];
    const { name, majorAxis, eccentricity, inclination, color } = param;
 const orbit =  createOrbit(majorAxis, eccentricity, inclination);
      sate = viewer.entities.add({
      name,
      label:{
        text:'12',
        show:true,
        fillColor:Cesium.Color.RED,        //字体颜色
        backgroundColor:Cesium.Color.AQUA,    //背景颜色
        showBackground:true,                //是否显示背景颜色
        style: Cesium.LabelStyle.FILL,        //label样式
        outlineWidth : 2,                    
        verticalOrigin : Cesium.VerticalOrigin.CENTER,//垂直位置
        horizontalOrigin :Cesium.HorizontalOrigin.LEFT,//水平位置
        pixelOffset:new Cesium.Cartesian2(10,0)            //偏移
      },
      position: orbit.position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString(color),
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
        material:Cesium.Color.fromCssColorString(color),
      },
    });
    viewer.trackedEntity=sate
    viewer.clock.shouldAnimate=true
    viewer.clock.multiplier=200
}

const deleteSate=()=>{
  visSate()
}

const getSatePara = (val) => {
  if (val === 1 || sateArr.value) {
    visSate();
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
