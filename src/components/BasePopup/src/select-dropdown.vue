<template>
  <div
    class="el-select-dropdown el-popper"
    :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
    :style="{ minWidth: minWidth }"
  >
    <div class="el-select-dropdown-bj" @click="closePopover"></div>
    <div class="el-select-dropdown-box">
      <template v-if="$parent.group&&$parent.group[0]&&optionsData.length>0">
        <top-tags
          :filterCondition="filterCondition"
          :groupBy="$parent.groupBy"
          @groupChange="groupChange"
        ></top-tags>

        <div class="group-bar">
          <template v-for="(it,index) in $parent.groupBy">
            <select-top-group
              ref="group"
              :key="index"
              v-if="$parent.groupBy[index].value===''"
              :groupBy="$parent.groupBy"
              :options="$parent.options"
              :index="index"
              @groupChange="groupChange"
            />
          </template>
        </div>
      </template>

      <slot></slot>
    </div>
  </div>
</template>

<script type="text/babel">
import SelectTopGroup from "./group.vue";
import TopTags from "./top-tags.vue";
import Popper from "element-ui/src/utils/vue-popper";

export default {
  name: "ElSelectDropdown",

  componentName: "ElSelectDropdown",

  components: {
    SelectTopGroup,
    TopTags
  },

  mixins: [Popper],

  props: {
    placement: {
      default: "bottom-start"
    },

    boundariesPadding: {
      default: 0
    },

    popperOptions: {
      default() {
        return {
          gpuAcceleration: false
        };
      }
    },

    visibleArrow: {
      default: true
    },

    appendToBody: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      minWidth: "",
      filterCondition: []
    };
  },

  computed: {
    popperClass() {
      return this.$parent.popperClass;
    },
    optionsData() {
      return this.$parent.$parent.allData || [];
    }
  },

  watch: {
    "$parent.inputWidth"() {
      this.minWidth = this.$parent.$el.getBoundingClientRect().width + "px";
    },
    optionsData: {
      handler(val) {
        if (this.$refs.group) this.$refs.group.forEach(it => it.getGroup());
      },
      deep: true
    }
  },

  mounted() {
    this.referenceElm = this.$parent.$refs.reference.$el;
    this.$parent.popperElm = this.popperElm = this.$el;
    this.$on("updatePopper", () => {
      if (this.$parent.visible) this.updatePopper();
    });
    this.$on("destroyPopper", this.destroyPopper);
  },

  methods: {
    groupChange(field, value) {
      if (field === undefined) {
        this.filterCondition = [];
      } else {
        const index = this.filterCondition.findIndex(it => it === field);
        if (index === -1) {
          this.filterCondition.push(field);
        } else {
          this.filterCondition.splice(index, 1);
        }
      }
      this.$emit("groupChange", field, value);
    },
    closePopover() {
      this.$emit("close-popover", false);
    }
  }
};
</script>
<style lang="scss">
.el-select-dropdown {
  z-index: 3000 !important;
}
.el-select-dropdown .crumbsBar {
  line-height: 34px;
}
@media screen and (max-width: 769px) {
  .el-select-dropdown.el-popper.YCPOPUP {
    width: 100% !important;
    height: 100%;
    position: fixed;
    top: 0 !important;
    left: 0 !important;
    margin-top: 0;
    background: none;
    border-radius: 0;
    border: none;
    box-shadow: none;
    z-index: 10001;
    .el-select-dropdown-bj {
      position: absolute;
      width: 100% ;
      height: 100%;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.35);
      z-index: 10002;
    }
    .el-select-dropdown-box {
      width: 75%;
      height: calc(100% - 44px);
      background-color: #ffffff;
      overflow-y: scroll;
      position: absolute;
      top: 44px;
      left: 25%;
      z-index: 10003;
    }
    .el-scrollbar {
      width: 100%;
      .el-select-dropdown__wrap {
        margin-right: 0;
        margin-bottom: 0;
        max-height: unset !important;
      }
      .el-select-dropdown__list {
        padding: 4px;
        margin: 0;
        .el-select-dropdown__item {
          overflow: unset;
          width: calc(25% - 8px);
          margin: 4px !important;
          font-size: 14px;
          padding: 12px 20px;
          color: #333333;
          height: auto;
          line-height: 16px;
          display: inline-block;
          background-color: #f5f5f5;
          border-radius: 4px;
          border: 1px solid #f5f5f5;
          text-align: center;
          white-space: normal;
        }
        .el-select-dropdown__item.selected {
          border: 1px solid #409eff;
          background-color: #ffffff;
          color: #409eff;
        }
      }
    }
    .popper__arrow {
      display: none;
    }
  }
}
@media screen and (max-width: 481px) {
  .el-select-dropdown.el-popper.YCPOPUP {
    .el-scrollbar {
      .el-select-dropdown__list {
        .el-select-dropdown__item {
          width: calc(50% - 8px);
        }
      }
    }
  }
}
</style>

