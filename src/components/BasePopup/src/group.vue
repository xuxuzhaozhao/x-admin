<template>
  <div :class="{bar:true,multiple:isDuoXuan,more:isDuoXuan===false&&isMore}">
    <div class="name">{{label}}：</div>
    <div v-if="isDuoXuan===false"
         class="selector-content"
         :style="{maxHeight:isMore?'none':''}"
         ref="content">
      <ul class="selector"
          ref="selector">
        <li v-for="tag in tags"
            :key="tag"
            class="tag"
            :style="{width:width}">
          <span @click="change([tag])"
                :title="tag">{{tag}}</span>
        </li>
      </ul>
    </div>
    <el-checkbox-group v-else
                       class="selector"
                       v-model="checkList">
      <el-checkbox v-for="tag in tags"
                   :key="tag"
                   :label="tag"
                   class="tag"
                   :title="tag"
                   :style="{width: `calc(${width} - 20px)`,marginRight: '20px'}">{{tag}}</el-checkbox>
    </el-checkbox-group>
    <div class="duoxuan-btn-group"
         v-if="isDuoXuan===true">
      <el-button size="mini"
                 :disabled="checkList.length===0"
                 @click="change(checkList)"
                 type="danger"
                 plain>确定</el-button>
      <el-button @click="isDuoXuan=false"
                 size="mini"
                 plain>取消</el-button>
    </div>
    <el-button v-if="tags.length>1&&isDuoXuan===false"
               icon="el-icon-plus"
               size="mini"
               class="duoxuan-btn"
               @click="start">多选</el-button>
    <el-button v-if="tags.length>1&&isShowMore===true&&isDuoXuan===false"
               :icon="isMore?'el-icon-arrow-up':'el-icon-arrow-down'"
               size="mini"
               class="duoxuan-btn"
               style="top:30px"
               @click="isMore=!isMore">{{isMore?'收起':'更多'}}</el-button>
  </div>
</template>
<script>
export default {
  name: "SelectTopGroup",

  props: {
    groupBy: Array,
    index: {
      type: Number,
      default: 0
    },
    options: ""
  },

  data () {
    return {
      tags: [],
      isDuoXuan: false,
      isShowMore: false,
      isMore: false,
      checkList: []
    };
  },

  computed: {
    field () {
      return this.groupBy[this.index].field;
    },
    value () {
      return this.groupBy[this.index].value;
    },
    label () {
      return this.groupBy[this.index].label;
    },
    width () {
      return this.groupBy[this.index].width || "20%";
    },
    visible () {
      return this.$parent.$parent.visible;
    }
  },

  watch: {
    groupBy: {
      handler () {
        this.getGroup();
      },
      immediate: true,
      deep: true
    },
    isDuoXuan () {
      this.checkList = [];
    },
    tags: {
      handler () {
        this.judgeShowMore();
      },
      deep: true
    },
    visible () {
      this.judgeShowMore();
    },
    "$parent.$parent.query" () {
      if (this.$parent.$parent.remote !== true) this.getGroup();
    }
  },

  methods: {
    change (val) {
      this.$emit("groupChange", this.field, val);
    },
    getGroup () {
      this.$nextTick(() => {
        const field = this.field;
        //const value = this.value;

        let options = this.options;

        const set = new Set();
        options.forEach(op => {
          if (op.visible) set.add(op.data[field]);
        });
        this.tags = [...set];
      });
    },
    start () {
      this.isDuoXuan = true;
      this.isMore = false;
      this.$parent.$refs.group.forEach(it => {
        if (it.index !== this.index) it.isDuoXuan = false;
      });
    },
    judgeShowMore () {
      if (this.visible === false) return;
      this.$nextTick(() => {
        const content = this.$refs.content.getBoundingClientRect().height;
        const selector = this.$refs.selector.getBoundingClientRect().height;
        if (selector - content >= 5) this.isShowMore = true;
      });
    }
  }
};
</script>
<style lang="scss">
.el-select-dropdown {
  .bar {
    border-bottom: 1px solid #ddd;
    background: #f3f3f3;
    position: relative;
    width: 100%;
    min-height: 28px;
    &.multiple {
      margin-top: -1px;
      border: 2px solid #edd28b;
      background: #fffdee;
      .selector {
        padding-bottom: 35px;
        margin-left: 78px;
      }
    }
    &.more {
      margin-top: -1px;
      border: 1px solid #aaa;
      background: #f9f9f9;
      .selector {
        margin-left: 79px;
      }
    }
    .name {
      font-size: 12px;
      float: left;
      padding-left: 10px;
      width: 80px;
      color: #666;
      font-weight: 600;
      text-align: left;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .selector-content {
      max-height: 80px;
      overflow: hidden;
    }
    .selector {
      margin: 0;
      margin-left: 80px;
      padding-left: 10px;
      background: #fff;
      padding-right: 60px;
    }
    .tag {
      color: #005aa0;
      text-overflow: ellipsis;
      overflow: hidden;
      display: inline-block;
      line-height: 25px;
      padding-right: 10px;
      position: relative;
      top: 1px;
      white-space: nowrap;
      & span {
        cursor: pointer;
        &:hover {
          color: #e4393c;
        }
      }
    }
    .el-checkbox + .el-checkbox {
      margin-left: 0;
    }
    .el-checkbox__label {
      padding-left: 3px;
      font-size: 12px;
    }
    .el-checkbox__inner {
      width: 12px;
      height: 12px;
      &::after {
        left: 3px;
        top: 0px;
      }
    }
    .duoxuan-btn {
      position: absolute;
      top: 4px;
      right: 5px;
      padding: 2px;
      &:hover,
      &:focus {
        color: #e4393c;
        border-color: #e4393c;
        background-color: #fff;
      }
      span {
        margin-left: 2px;
      }
    }
    .duoxuan-btn-group {
      position: absolute;
      position: absolute;
      bottom: 7px;
      left: 50%;
      transform: translateX(-50%);
      button {
        padding: 4px 6px;
      }
    }
  }
  .group-bar {
    border-top: 1px solid #ddd;
  }

  .red {
    color: red;
  }
}
</style>
