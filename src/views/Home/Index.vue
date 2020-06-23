<template>
  <el-row :gutter="30">
    <el-col :span="12">
      <common-popup
        v-model="val1"
        placeholder="通过identity获取数据"
        identity="K_Dealer"
        select-name="summary-temperatureC"
        value-name="summary"
      ></common-popup>
    </el-col>

    <el-col :span="12">
      <common-popup
        v-model="val2"
        placeholder="绑定data设置数据"
        :data="data2"
        :multiple="true"
        :limit="2"
        select-name="username"
        value-name="username"
        :inline-block="false"
        @visible-change="visibleChange"
      ></common-popup>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      val1: "",
      val2: "",
      data2: []
    };
  },
  methods: {
    visibleChange(visible) {
      if (this.data2.length > 0) return;
      if (visible === true) {
        setTimeout(() => {
          this.data2 = [
            { username: "张三" },
            { username: "李四" },
            { username: "王麻子" }
          ];
        }, 500);
      }
    }
  }
};
</script>