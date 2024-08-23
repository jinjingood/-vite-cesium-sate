<template>
  <div class="form">
    {{ state.text }}
    <div>
      <label for="name">命名</label>
      <input v-model="formState.name" />
    </div>
    <div>
      <label for="name">长半轴</label>
      <input v-model="formState.majorAxis" />
    </div>
    <div>
      <label for="name">偏心率</label>
      <input v-model="formState.eccentricity" />
    </div>
    <div>
      <label for="name">倾角</label>
      <input v-model="formState.inclination" />
    </div>
    <div>
      <label for="color"> 颜色</label>
      <input v-model="formState.color"  type="color"/>
    </div>
    <!-- <a-form-item label="半轴长" name="majorAxis">
        <a-input v-model:value="formState.name"></a-input
      ></a-form-item>
      <a-form-item label="偏心率" name="eccentricity">
        <a-input v-model:value="formState.name"></a-input
      ></a-form-item>
      <a-form-item label="倾角" name="degress">
        <a-input v-model:value="formState.name"></a-input
      ></a-form-item> -->
    <button @click="submit(1)">确认</button>
    <button @click="submit(0)">取消</button>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from "vue";
import { useStore } from "vuex";

// 记住defineProps和defineEmits都不需要导入了，可以直接写
const emit = defineEmits(["setSatePara"]);
const props = defineProps({ editIndex: { type: Number } });
// 引入vuex的store
const store = useStore();

const state = reactive({
  sateArr: store.state.sateArr,
  text: "添加卫星",
});

let number = state.sateArr.length + 1;

onMounted(
  () => {
    if (props.editIndex) {
      formState = state.sateArr[index];
    } else {
      return formState;
    }
  },
  { immediate: true }
);

let formState = reactive({
  //这里必须用let
  name:
    props.editIndex === undefined
      ? `sate${number}`
      : `${state.sateArr[props.editIndex].name}`,
  majorAxis:
    props.editIndex === undefined
      ? 7000
      : state.sateArr[props.editIndex].majorAxis,
  eccentricity:
    props.editIndex === undefined
      ? 0
      : state.sateArr[props.editIndex].eccentricity, //小于1
  inclination:
    props.editIndex === undefined
      ? 0
      : state.sateArr[props.editIndex].inclination, //大于等于0
  color:
    props.editIndex === undefined
      ? "#00bc40"
      : state.sateArr[props.editIndex].color,
});

const submit = (val) => {
  if (val === 1) {
    if (props.editIndex === undefined) {
      state.sateArr.unshift(formState);
    }
    state.sateArr[props.editIndex] = formState;
    store.commit("addSate", state.sateArr);
    localStorage.setItem("sateArr", JSON.stringify(state.sateArr));
  }
  emit("setSatePara", val);
  console.log("submit-state.sateArr", state.sateArr);
};
</script>

<style>
.form {
  position: absolute;
  height: 200px;
  width: 300px;
  border-radius: 4px;
  padding: 8px 16px;
  background: white;
  text-align: left;
}
</style>
