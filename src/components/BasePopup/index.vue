<template>
  <popup-select
    v-model="nowValue"
    ref="popup"
    clearable
    filterable
    :disabled="disabled"
    :multiple="multiple"
    :fakeMultiple="fakeMultiple"
    :multiple-limit="limit"
    :collapse-tags="collapseTags"
    :loading="loading"
    class="popup-select"
    :popper-class="className"
    :placeholder="placeholder"
    :no-data-text="noDataText"
    :loading-text="loadingText"
    :allow-create="allowCreate"
    :remote-method="remoteMethod"
    :remote="remote"
    :group="group"
    @change="change"
    @blur="e=>$emit('blur',e)"
    @focus="e=>$emit('focus',e)"
    @visible-change="popupClick"
  >
    <popup-option
      v-for="op in popupOptions"
      :key="op.value"
      :label="op.label"
      :value="op.value"
      :data="op.data"
      :title="op.label"
    >
      <slot :data="op.data" :value="op.value" :label="op.label"></slot>
    </popup-option>

    <div class="popup-footer">
      <slot name="popup-footer"></slot>
    </div>
  </popup-select>
</template>
<script>
import select from "./src/select.vue";
import option from "./src/option.vue";
export default {
  components: {
    "popup-select": select,
    "popup-option": option
  },
  model: {
    prop: "value",
    event: "change" //自定义事件
  },
  props: {
    cache: {
      //是否缓存返回的数据
      type: Boolean,
      default: true
    },
    backendFilter: "", // 后端筛选字段
    remote: {
      // 将自身输入框的输入的内容作为后台模糊查找的条件
      type: Boolean,
      default: false
    },
    selectName: "", // 对应下拉框选项的label
    valueName: "", // 对应下拉框选项的value
    identity: "", //弹出框变量
    initTags: "",
    tagsValNotEmpty: {
      type: Boolean,
      default: false
    },
    popupLabel: Object,
    changeClearTags: "",
    changeRelateTags: String,
    parentModel: "", //用在级联子级（可配合user理解）
    sonModel: "", //用在级联父级清除子集的作用
    inlineBlock: {
      type: Boolean,
      default: true
    },
    disabled: false,
    allowCreate: false,
    url: {
      type: String,
      default: "/Api/BaseTable/OpenDialog"
    },
    value: "",
    data: Array, // 接收从外界来的数据
    multiple: {
      type: Boolean,
      default: false
    },
    fakeMultiple: {
      type: Boolean,
      default: false
    },
    limit: {
      //限制多选时可选项目的个数，为0表示不限制
      type: Number,
      default: 0
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    popperClass: "",
    group: Array
  },
  computed: {
    className() {
      let className = "XPOPUP " + (this.popperClass || "");
      if (this.inlineBlock) {
        className = className + " inline";
      }
      return className;
    },

    isBackendFilter() {
      if (this.backendFilter) return true;
      return false;
    }
  },
  watch: {
    value(val) {
      this.nowValue = this.dataFormat(val);
      if (val === "") this.popupClick(false); //模拟触发下拉框的关闭事件
    },
    data: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.allData = val;
          this.getData();
          this.loading = false;
        }
      },
      immediate: true
    },
    allData: {
      handler: function(val) {
        this.$emit("option-change", val);
      },
      immediate: true
    }
  },
  data() {
    const nowValue = this.dataFormat(this.value);
    return {
      allData: [],
      loading: this.remote ? false : true,
      padding: false,
      popupOptions: [],
      nowValue: nowValue,
      oldVal: "",
      mark: "",
      noDataText: "无数据",
      loadingText: "加载中",
      backendFilterCache: {}
    };
  },
  methods: {
    dataFormat(val) {
      if (this.multiple) {
        if (val) return val.split(",");
        return [];
      }
      return val;
    },
    change(val) {
      if (this.multiple) {
        val = val.join(",");
      }
      this.$emit("change", val);
    },

    // 子弹出框，弹出数据的时候需要这个parentVal
    // 根据init-tags里面的字段 和parentModel里面的值 返回出一个子对象
    // init-tags="洞口类型,门型号" parentModel={ID:1,...,洞口类型:"大洞",门型号:"橡木门",...}
    // 返回  parentVal={洞口类型:"大洞",门型号:"橡木门"}
    parentVal() {
      let val = {};
      let alertMsg = "";
      if (this.initTags && typeof this.parentModel === "object") {
        const initTags = this.initTags.split(",");
        initTags.forEach(item => {
          const value = this.parentModel[item];
          if (value) {
            val[item] = value;
          } else {
            if (this.tagsValNotEmpty === true && value !== undefined) {
              const msg = (this.popupLabel && this.popupLabel[item]) || item;
              alertMsg = alertMsg + "、" + msg;
            }
          }
        });
      }
      return {
        parentVal: val,
        alertMsg: _.trim(alertMsg, "、")
      };
    },
    backendFilterVal() {
      let val = {};
      if (this.backendFilter && typeof this.parentModel === "object") {
        const Filter = this.backendFilter.split(",");
        Filter.forEach(item => {
          if (this.parentModel[item]) {
            val[item] = this.parentModel[item]; //将获取的父对象相对应的子对象放进临时对象
          }
        });
      }
      return val;
    },

    // 如果remote为true，则调用此方法，不会去执行popClick方法
    // query : 输入的数据
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        const mark = this.url.includes("?") ? "&" : "?";
        let Conditions = {};
        if (this.isBackendFilter) {
          Conditions = this.backendFilterVal();
        }
        const remoteQueryApi = `${this.url}${mark}query=${query}`;
        this.$http.post(remoteQueryApi, { Conditions }).then(res => {
          this.allData = res.data;
          this.loading = false;
          this.getData();
        });
      } else {
        this.$emit("change", "");
      }
    },

    popupClick(visible) {
      this.$emit("visible-change", visible);
      this.noDataText = "无数据";
      this.loadingText = "加载中";
      const { alertMsg } = this.parentVal();
      if (this.tagsValNotEmpty === true && alertMsg) {
        const msg = "请先选择：" + alertMsg + "！";
        this.noDataText = msg;
        this.loadingText = msg;
        this.popupOptions = [];
        return;
      }

      if (this.remote) return;

      if (visible) {
        this.oldVal = (this.nowValue || "").toString();
        if (Array.isArray(this.data)) {
          this.loading = false;
          this.getData();
        } else {
          // 从数据库获取
          if (this.loading || this.isBackendFilter || this.cache === false) {
            this.loading = true;
            // 如果开启后端获取数据则填充Conditions
            let Conditions = {};
            let backendString = "";
            if (this.isBackendFilter) {
              Conditions = this.backendFilterVal();
              backendString = JSON.stringify(Conditions);
              const backendCache = this.backendFilterCache[backendString];
              if (backendCache) {
                this.allData = backendCache;
                this.padding = false;
                this.loading = false;
                this.getData();
                return;
              }
            }

            //判断是否是第一个参数
            let mark = this.url.includes("?") ? "&" : "?";
            // 判断是否正在获取数据
            if (this.padding === false) {
              this.padding = true;
              const defaultApi = `${this.url}${mark}identity=${this.identity}`;
              this.$http.post(defaultApi, { Conditions }).then(res => {
                this.allData = res.data;
                //缓存
                if (backendString && this.cache === true)
                  this.backendFilterCache[backendString] = this.allData;

                this.padding = false;
                this.loading = false;
                this.getData();
              });
            }
          } else {
            this.getData();
          }
        }
      } else {
        //visible=false
        setTimeout(() => {
          const nowValue = (this.nowValue || "").toString();
          if (this.oldVal !== nowValue) {
            this.oldVal = nowValue;
            if (this.changeClearTags && this.sonModel) {
              const changeClearTags = this.changeClearTags.split(",");
              changeClearTags.forEach(item => {
                if (this.sonModel[item] !== undefined)
                  this.$set(this.sonModel, item, "");
              });
            }

            if (
              this.changeRelateTags &&
              this.multiple === false &&
              this.sonModel
            ) {
              const options = _.find(this.popupOptions, { value: nowValue });
              const changeRelateTags = this.changeRelateTags.split(",");
              if (options !== undefined) {
                changeRelateTags.forEach(item => {
                  const val = options.data[item];
                  if (val !== undefined) this.$set(this.sonModel, item, val);
                });
              } else {
                changeRelateTags.forEach(item => {
                  if (this.sonModel[item] !== undefined)
                    this.$set(this.sonModel, item, "");
                });
              }
            }
          }
        }, 0);
      }
    },
    getData() {
      let data = [];
      const valAry = [];
      const { parentVal } = this.parentVal();

      const keys = Object.keys(this.allData[0] || {}).sort(function(a, b) {
        return b.length - a.length;
      });

      // var selectName = "订单编号 - 【生产单号】"
      // var data = { 订单编号: '2011032040', 生产单号: '011365'}
      // selectName = selectName.replace(/订单编号|生产单号/g, t => data[t])
      // 返回值："2011032040 - 【011365】"
      const reg = new RegExp(keys.join("|"), "g");
      this.allData.forEach(item => {
        let cond1 = this.itemHasParentVal(item, parentVal);
        let cond2 = !valAry.includes(item[this.valueName]);
        let itemVal = item[this.valueName];
        if (
          cond1 &&
          cond2 &&
          itemVal != undefined &&
          itemVal != null &&
          itemVal !== ""
        ) {
          data.push({
            label: this.selectName.replace(reg, key => item[key] || ""),
            value: item[this.valueName],
            data: item
          });
          valAry.push(item[this.valueName]);
        }
      });
      this.popupOptions = data;
      // 点开弹出框 只有一个选项的话，则自动选中
      // if (data.length === 1) {
      //   setTimeout(() => {
      //     this.$emit("change", data[0].value);
      //   }, 0);
      // }
    },
    // 判断父对象是否包含子对象
    // 在allData中进行筛选，符合父级条件返回true
    itemHasParentVal(item, parentVal) {
      for (let key in parentVal) {
        if (!item[key]) continue;
        if (item[key] !== undefined && item[key] !== parentVal[key]) {
          return false;
        }
      }
      return true;
    },

    focus() {
      this.$refs.popup.focus();
    },
    blur() {
      this.$refs.popup.blur();
    }
  }
};
</script>
<style lang="scss">
.popup-select {
  width: 100%;
}

.XPOPUP {
  width: auto;
}

.XPOPUP.inline .el-select-dropdown__item {
  display: inline-block;
  text-align: center;
}
.XPOPUP.inline.el-select-dropdown {
  width: -webkit-min-content;
  width: -moz-min-content;
  width: min-content;
  .el-select-dropdown__item.selected::after {
    display: none;
  }
}
.XPOPUP.block .el-select-dropdown__item {
  text-align: center;
}
.el-select-dropdown.XPOPUP.inline {
  width: 600px;
}
</style>
