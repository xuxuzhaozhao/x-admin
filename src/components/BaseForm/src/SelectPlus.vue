<template>
  <el-select v-model="_value"
    v-bind="config"
    :clearable="config.clearable===false?false:true"
    :filterable="config.filterable===false?false:true"
    :placeholder="`${config.placeholder||'请选择'}`">
    <el-option v-for="item in _options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
    <slot></slot>
  </el-select>
</template>
<script>
export default {
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: "",
    config: {
      selectOptions: ""
    }
  },
  computed: {
    _options() {
      const options = this.config ? this.config.selectOptions : [];
      if (typeof options === "string") {
        const array = options.split(",").map(item => {
          return {
            value: item,
            label: item
          };
        });
        return array;
      }
      return options;
    },
    _value: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("change", val);
      }
    }
  }
};
</script>

