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
const emit = defineEmits(["deleteSate", "edit",'shotSate']);

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
</script>

<style lang="less">
.nodelist {
  position: absolute;
  top: 80px;
  left: 20px;
  height: 200px;
  min-width: 200px;
  border-radius: 4px;
  padding: 8px 16px;
  background: white;
  text-align: left;
  overflow: hidden;
  overflow-y: auto;
  .nodeitem {
    margin: 8px 0;
    .nodeitem-meau {
      width: 110px;
      > div {
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
        margin-left: 8px;
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
