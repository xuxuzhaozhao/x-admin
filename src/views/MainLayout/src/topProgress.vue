<template>
  <el-progress 
    class="MainLayout-top-progress"
    v-if="false"
    :percentage="percentage"
    :stroke-width="2"
    :show-text="false"></el-progress>
</template>
<script>
export default {
  data() {
    return {
      time: 500, //毫秒
      percentage: 0,
      startTime: 0,
      isEnd: false
    };
  },
  watch: {
    $route() {
      // 如何结束进度条？。。。
      this.isEnd = true;
    }
  },
  methods: {
    start() {
      this.startTime = new Date().getTime();
      this.isEnd = false;
      this.percentage = 0;
      this.interval();
    },
    interval() {
      setTimeout(() => {
        if (!this.isEnd) {
          const nowTime = new Date().getTime();
          this.percentage =
            Math.atan((nowTime - this.startTime) / (this.time / 4)) *
            (2 / Math.PI) *
            100;
          if (!this.isEnd) {
            this.interval();
          }
        }
      }, 1000 / 30); //一秒30帧
    }
  }
};
</script>
<style>
.layout .MainLayout-top-progress.el-progress {
  position: fixed;
  top: 0;
  z-index: 201;
  right: 0;
  left: 0;
}
</style>

