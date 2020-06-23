<template>
  <div class="menuSearch">
    <el-tooltip v-if="device!=='mobile'"
                effect="dark"
                content="搜索"
                placement="bottom">
      <div @click="toshow"
           style="display: inline-block;position: relative;top: -1px;font-size: 19px;">
        <i class="fa fa-search"></i>
      </div>

    </el-tooltip>
    <i v-else
       class="fa fa-search"
       @click="toshow"></i>

    <el-select v-model="value"
               style="float: right;padding-top: 6px;"
               @click.native="focus"
               ref="search"
               :class="{'active':active}"
               popper-class="search-popper"
               filterable
               remote
               placeholder="搜索"
               no-data-text="无相应菜单模块"
               :remote-method="remoteMethod"
               :loading="loading">
      <el-option v-for="item in options"
                 :key="item.value"
                 :label="item.label"
                 :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: { states: Array, device: "" },
  data () {
    return {
      active: false,
      options: [],
      value: [],
      loading: false
    };
  },
  mounted () {
    const search = $(".menuSearch");
    const popper = $(".search-popper");
    $(document).click(ev => {
      const target = $(ev.target);
      if (!search.find(target).length && !popper.find(target).length) {
        this.active = false;
      }
    });
  },
  computed: {
    list () {
      return this.states.map(item => {
        return { value: item.路径, label: item.名称 };
      });
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.$router.push(val);
      }
    },
    active (val) {
      if (val) {
        this.value = "";
        this.options = [];
      }
    }
  },
  methods: {
    remoteMethod (query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.options = this.list.filter(item => {
            return item.label.indexOf(query) > -1;
          });
        }, 50);
      } else {
        this.options = [];
      }
    },
    toshow () {
      this.active = !this.active;
      //console.log($(this.$refs.search.$el).find("input"));
      this.focus();
    },
    focus () {
      if (this.active)
        $(this.$refs.search.$el)
          .find("input")[0]
          .focus();
    }
  }
};
</script>
<style lang="scss">
.menuSearch {
  .el-icon-search {
    line-height: 50px;
  }
  .el-select {
    line-height: 36px;
    top: -2px;
    width: 0px;
    transition: width 200ms ease-in-out;
    padding: 3px 0px;
    z-index: -1;
    &.active {
      padding-left: 10px;
      width: 150px;
      z-index: 1;
    }
    input {
      border: 0;
      border-bottom: 1px solid #bfcbd9 !important;
      border-radius: 0;
      padding: 3px 0;
      color: #fff;
    }
  }
}
</style>
