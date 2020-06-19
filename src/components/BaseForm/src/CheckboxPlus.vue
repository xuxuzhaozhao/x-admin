<template>
  <el-checkbox-group v-model="_value"
    v-bind="config">
    <el-checkbox v-for="item in _options"
      :key="item.value"
      :label="item.value"
      :disabled="item.disabled">{{item.label}}</el-checkbox>
  </el-checkbox-group>
</template>
<script>
export default {
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: {
      type: String,
      default: ""
    },
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
        if (this.value) {
          return this.value.split(",");
        }
        return [];
      },
      set: function(val) {
        this.$emit("change", val.join());
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

