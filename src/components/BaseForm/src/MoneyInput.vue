<template>
  <div class="money-input">
    <el-input ref="input" v-model="inputVal" v-bind="config" :placeholder="config.placeholder">
      <i slot="prefix" v-if="config.showChineseNum!==false" class="el-input__icon fa fa-jpy" />
      <i
        slot="suffix"
        v-if="config.showChineseNum!==false"
        style="color: #F56C6C;font-size:12px;line-height: 32px"
      >{{chineseNum}}</i>
    </el-input>
  </div>
</template>
<script>
export default {
  model: {
    prop: "value",
    event: "change" //自定义事件
  },
  props: {
    value: "",
    config: {
      type: Object,
      default: function() {
        return {
          showChineseNum: true,
          isThousand: true,
          placeholder: "请输入"
        };
      }
    }
  },
  data() {
    return {
      inputel: null,
      inputVal: ""
    };
  },
  mounted() {
    this.inputel = $(this.$el).find("input");
    this.inputel
      .focus(this.focus)
      .blur(() => {
        this.getValue();
        this.$emit("blur");
      })
      .keyup(event => {
        if (event.keyCode == 13) {
          this.getValue();
          this.$emit("keyup");
        }
      });
  },
  computed: {
    chineseNum() {
      return this.toChineseNum(this.value);
    }
  },
  watch: {
    value: {
      handler() {
        this.initInputVal();
      },
      immediate: true
    }
  },
  methods: {
    toChineseNum(num) {
      num = Number(num) || 0;
      let tag = "";
      if (num === 0) {
        return "零元";
      } else if (num < 0) {
        tag = "负";
        num = -num;
      } else {
        tag = "";
      }

      var unit = "千百拾亿千百拾万千百拾元角分",
        str = "";
      num += "00";

      var indexpoint = num.indexOf("."); // 如果是小数，截取小数点前面的位数

      if (indexpoint >= 0) {
        num = num.substring(0, indexpoint) + num.substr(indexpoint + 1, 2); // 若为小数，截取需要使用的unit单位
      }

      unit = unit.substr(unit.length - num.length); // 若为整数，截取需要使用的unit单位
      for (var i = 0; i < num.length; i++) {
        str += "零壹贰叁肆伍陆柒捌玖".charAt(num.charAt(i)) + unit.charAt(i); //遍历转化为大写的数字
      }

      return (
        tag +
        str
          .replace(/零(千|百|拾|角)/g, "零")
          .replace(/(零)+/g, "零")
          .replace(/零(万|亿|元)/g, "$1")
          .replace(/(亿)万|壹(拾)/g, "$1$2")
          .replace(/^元零?|零分/g, "")
          .replace(/元$/g, "元整")
      ); // 替换掉数字里面的零字符，得到结果
    },
    getValue() {
      if (this.inputVal === "") {
        if (this.value !== null && this.value !== undefined)
          this.$emit("change", "");
        return;
      }

      let old = Number(this.value);
      let value = Number((this.inputVal + "").split(",").join(""));

      if (!isNaN(value)) {
        if (value !== old) this.$emit("change", value);
      } else {
        if (!isNaN(old)) {
          this.inputVal = old;
        } else {
          this.inputVal = "";
        }
      }
      this.thousand();
    },
    focus() {
      if (
        this.inputel[0].readOnly === true ||
        this.inputel[0].disabled === true
      )
        return;
      this.initInputVal();
      this.$emit("focus");
    },
    initInputVal() {
      if (
        this.value === "" ||
        this.value === null ||
        this.value === undefined
      ) {
        this.inputVal = "";
      } else {
        this.inputVal = Number(this.value);
      }
      this.thousand();
    },
    thousand() {
      this.$nextTick(() => {
        if (
          !this.inputel.is(":focus") &&
          this.inputVal !== "" &&
          this.config.isThousand !== false
        ) {
          //console.log(this.inputVal, 123);
          this.inputVal = Number(
            (this.inputVal + "").split(",").join("")
          ).toLocaleString();
        }
      });
    }
  },
  beforeDestroy() {
    if (this.inputel) this.inputel.off("focus blur keyup");
  }
};
</script>
<style lang="scss">
@media screen and (max-width: 769px) {
  .money-input {
    height: 100%;
    .el-input {
      height: 100%;
    }
    .el-input__inner {
      height: 100% !important;
      z-index: 2;
      position: relative;
    }
    .el-input--prefix {
      .el-input__prefix {
        right: 4px;
        z-index: 0;
      }
    }
    .el-input--suffix {
      .el-input__suffix {
        display: none;
      }
    }
  }
}
</style>
