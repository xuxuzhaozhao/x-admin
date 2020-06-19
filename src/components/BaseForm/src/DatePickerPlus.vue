<template>
  <div class="date-picker-plus-box">
    <el-row v-if="type.includes('range')" class="DatePickerPlus">
      <el-col :span="12">
        <el-date-picker
          v-bind="config"
          class="range range1"
          v-model="nowValue"
          :type="realType"
          :picker-options="pickerOptions"
          @change="change"
        ></el-date-picker>
      </el-col>
      <el-col :span="12">
        <el-date-picker
          v-bind="config"
          class="range range2"
          v-model="nowValue2"
          :type="realType"
          :picker-options="pickerOptions2"
          @change="change"
        ></el-date-picker>
      </el-col>
    </el-row>
    <el-date-picker
      v-bind="config"
      :type="realType"
      v-else
      v-model="nowValue"
      align="right"
      :placeholder="this.placeholder"
      :clearable="true"
      @change="change"
    ></el-date-picker>
  </div>
</template>

<script>
function format(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
}
export default {
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: "", // 外界传入的初始值
    type: "",
    placeholder: {
      type: String,
      default: "请选择日期"
    },
    config: {}
  },
  data() {
    let nowValue = "";
    let nowValue2 = "";
    if (this.value) {
      const valAry = this.value.split("|");
      nowValue = this.toTime(valAry[0].trim());
      if (valAry.length > 1) {
        nowValue2 = this.toTime(valAry[1].trim());
      }
    }
    return {
      date: "",
      nowValue: nowValue,
      nowValue2: nowValue2,
      pickerOptions: {},
      pickerOptions2: {}
    };
  },
  watch: {
    nowValue: {
      handler: function(val) {
        this.pickerOptions2 = {
          disabledDate(time) {
            if (!val) return;
            return time.getTime() < new Date(val).getTime();
          }
        };
      },
      immediate: true
    },
    nowValue2: {
      handler: function(val) {
        this.pickerOptions = {
          disabledDate(time) {
            if (!val) return;
            return time.getTime() > new Date(val).getTime();
          }
        };
      },
      immediate: true
    },
    value(val) {
      if (val !== this.date && val !== undefined) {
        const valAry = val.split("|");
        this.nowValue = this.toTime(valAry[0].trim());
        if (valAry.length > 1) {
          this.nowValue2 = this.toTime(valAry[1].trim());
        }
      }
    }
  },
  computed: {
    realType() {
      const index = this.type.indexOf("range");
      if (index !== -1) {
        return this.type.substr(0, index); //把range类型改为原类型 ,防止为element-rang组件
      } else {
        return this.type;
      }
    },
    isTime() {
      const type = (this.config && this.config.dateType) || this.type;
      return type.includes("time");
    }
  },
  created() {
    if (this.value) this.change();
  },
  methods: {
    change(val) {
      const nowValue = this.nowValue
        ? format.call(
            new Date(this.nowValue),
            this.isTime ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd"
          )
        : "";
      const nowValue2 = this.nowValue2
        ? format.call(
            new Date(this.nowValue2),
            this.isTime ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd"
          )
        : "";
      const date = this.type.includes("range")
        ? nowValue + "|" + nowValue2
        : nowValue;
      this.date = date.length !== 1 ? date : "";
      this.$emit("change", this.date); //如果value和value2都为空的话，则返回空值
    },
    toTime(string) {
      // isNaN(Number("2018-3-21") 为 true
      if (!Number.isNaN(Number(string))) {
        const time = Date.now() + Number(string) * 8.64e7;
        console.log(
          format.call(
            new Date(time),
            this.isTime ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd"
          )
        );
        return format.call(
          new Date(time),
          this.isTime ? "yyyy-MM-dd hh:mm:ss" : "yyyy-MM-dd"
        );
      }
      return string;
    }
  }
};
</script>
<style lang="scss">
.DatePickerPlus .range {
  width: 100% !important;
}
.DatePickerPlus .range i {
  width: 16px;
}
.DatePickerPlus .range input {
  padding-right: 0px !important;
  padding-left: 15px !important;
}
.DatePickerPlus .range1 input {
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
}
.DatePickerPlus .range2 {
  margin-left: -1px;
}
.DatePickerPlus .range2 input {
  border-bottom-left-radius: 0px;
  border-top-left-radius: 0px;
}
@media screen and (max-width: 769px) {
  .date-picker-plus-box {
    height: 100%;
    .el-input__inner {
      z-index: 0;
      position: relative;
    }
    .el-input--prefix {
      .el-input__prefix {
        left: 4px;
        z-index: 0;
      }
    }
    .el-input--suffix {
      .el-input__suffix {
        // display: none;
      }
    }
  }
}
</style>


