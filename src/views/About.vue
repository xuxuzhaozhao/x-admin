<template>
  <div class="about">
    <el-button type="primary" @click="primary">primary</el-button>
    <el-dialog title="编辑用户" :visible="dialogVisible" width="30%">
      <el-alert effect="dark" type="error" title="这是一段错误信息。" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <Test />
  </div>
</template>

<script>
import Test from "./Test";
export default {
  components: {
    Test
  },

  data() {
    return {
      dialogVisible: false
    };
  },

  methods: {
    primary() {
      this.$message("普通模式的操作成功提示。");
      this.$notify({
        type: "success",
        message: "操作成功"
      });
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang='scss'>
</style>