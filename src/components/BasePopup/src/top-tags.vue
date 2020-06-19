<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item><span @click="$emit('groupChange')"
        class="all">全部结果</span></el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item,index) in conditions"
      :key="index">
      <span @click="$emit('groupChange',item.field,'')"
        :title="`${item.label}：${item.value.join('、')}`"
        class="border">
        <span class="content">
          <span>{{item.label}}：</span>
          <span class="value">{{item.value.join('、')}}</span>
        </span>
        <span class="close"><i class="el-icon-close"></i></span>
      </span>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-if="query"><strong>"{{query}}"</strong></el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script>
export default {
  props: {
    filterCondition: Array,
    groupBy: Array
  },
  computed: {
    query() {
      const { query, value } = this.$parent.$parent;
      if (query === value) return null;
      return query;
    },
    conditions() {
      const conditions = [];
      this.filterCondition.forEach(it => {
        const con = _.find(this.groupBy, { field: it });
        if (con) conditions.push(con);
      });
      return conditions;
    }
  }
};
</script>
<style lang="scss">
.el-select-dropdown {
  .el-breadcrumb {
    line-height: 30px;
    padding-left: 10px;
    color: #666;
    font-size: 12px;
    .el-icon-arrow-right {
      margin: 0 2px;
    }
    .all {
      cursor: pointer;
      font-weight: 600;
      &:hover {
        color: #e4393c;
      }
    }
    .border {
      cursor: pointer;
      position: relative;
      border: 1px solid #ddd;
      font-size: 12px;
      padding: 3px 28px 3px 4px;
      background: #f3f3f3;
      .content {
        max-width: 150px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        line-height: 12px;
        text-overflow: ellipsis;
        position: relative;
        top: 1px;
      }
      .close {
        position: absolute;
        font-size: 12px;
        top: 0px;
        right: 0px;
        height: 22px;
        width: 25px;
        color: #e4393c;
        i {
          position: relative;
          top: -4px;
          right: -7px;
          font-weight: 600;
        }
      }
      &:hover {
        border-color: #e4393c;
        background: #fff;
        .close {
          background-color: #e4393c;
          color: #fff;
        }
      }
    }
    .value {
      color: #e4393c;
    }
  }
  .list-complete-item {
    transition: all 1s;
    display: inline-block;
    margin-right: 10px;
  }
  .list-complete-enter,
  .list-complete-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  .list-complete-leave-active {
    position: absolute;
  }
}
</style>
