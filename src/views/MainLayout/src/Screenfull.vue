<template>
  <el-tooltip effect="dark"
    :content="isFullscreen?'退出全屏':'全屏'"
    placement="bottom">
    <i :class="{fa:true,'fa-arrows-alt':!isFullscreen,'fa-compress':isFullscreen}"
      @click="click"></i>
  </el-tooltip>
</template>

<script>
import screenfull from "screenfull";

export default {
  name: "screenfull",
  data() {
    return {
      isFullscreen: false
    };
  },
  methods: {
    click() {
      if (!screenfull.enabled) {
        this.$message({
          message: "您的浏览器版本不支持全屏功能",
          type: "warning"
        });
        return false;
      }
      screenfull.toggle();
      this.isFullscreen = !this.isFullscreen;
    }
  }
};
</script>
