<template>
  <div class="nodelist">
    <div
      class="nodeitem flex-container"
      v-for="(i, index) in state.sateArr"
      :key="index"
    >
      {{ i.name }}
      <div class="nodeitem-meau flex-container">
        <div @click="shotSate(index)">shot</div>
        <div @click="trackSate(index)">track</div>
        <div @click="editSate(index)">edit</div>
        <div @click="deleteSate(index)">X</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
let state = reactive({ sateArr: store.state.sateArr });
const emit = defineEmits(["deleteSate", "edit",'shotSate','trackSate']);

watch(()=>store.state.sateArr,(val)=>{
  state.sateArr=val
})

const deleteSate = (index) => {
  state.sateArr.splice(index, 1); 
  store.commit("deleteSate", state.sateArr);
  localStorage.setItem('sateArr',JSON.stringify(state.sateArr))
  emit("deleteSate", index);
};
const editSate = (index) => {
  emit("edit", index);
};

const shotSate=(index)=>{
  emit('shotSate',index)
}

const trackSate=(index)=>{
  emit('trackSate',index)
}
</script>

<style lang="less">
.nodelist {
  position: absolute;
  top: 80px;
  left: 20px;
  height: 200px;
  min-width: 250px;
  border-radius: 4px;
  padding: 8px 16px;
  background: white;
  text-align: left;
  overflow: hidden;
  overflow-y: auto;
  .nodeitem {
    margin: 8px 0;
    .nodeitem-meau {
      width: 160px;
      > div {
        padding: 0 4px;
        text-align: center;
        border-radius: 4px;
      }
      > div {
        width: 36px;
        &:hover {
          background: #f3f3f3;
        }
      }
      > div:last-child {
        padding: 0;
        width: 24px;
        &:hover {
          background: red;
          color: white;
        }
      }
    }
  }
}
</style>
