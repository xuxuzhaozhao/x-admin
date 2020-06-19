<template>
  <div class="test">
    <common-table :table-config="tableConfig"></common-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableConfig: {
        box: "单选",
        tableName: "安装位置表",
        //api: "/api/yicheng/basetable/getlist",
        column: [
          { prop: "安装位置", name: "安装位置" },
          { prop: "状态", name: "状态" },
          { prop: "序号", name: "序号" }
        ],
        pageSize: 10,
        MultiCondition: [{ field: "状态", operation: "等于", value: "正常" }],
        sort: "序号 asc,状态 desc",
        fun: res => {
          console.log(res.Data.Content);
          return res;
        }
      }
    };
  }
};
</script>

<style lang='scss'>
</style>