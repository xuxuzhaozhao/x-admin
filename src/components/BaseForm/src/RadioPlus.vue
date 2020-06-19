<template>
  <el-radio-group v-model="_value"
    v-bind="config">
    <el-radio v-for="item in _options"
      :key="item.value"
      :label="item.value">{{item.label}}</el-radio>
  </el-radio-group>
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
      selectOptions: "",
      isDisabled: ""
    }
  },
  computed: {
    _options() {
      const options = (this.config && this.config.selectOptions) || [];
      if (typeof options === "string" && options !== "") {
        const array = options.split(",").map(item => {
          return {
            value: item,
            label: item,
            disabled: this.isDisabled(item)
          };
        });
        return array;
      }
      return options || [];
    },
    _value: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        if (val) this.$emit("change", val);
      }
    }
  },
  methods: {
    isDisabled(val) {
      const type = typeof this.config.disabled;
      switch (type) {
        case "null":
          return false;
        case "boolean":
          return this.config.disabled;
        case "object":
          return this.config.disabled[val];
      }
    }
  }
};
</script>

