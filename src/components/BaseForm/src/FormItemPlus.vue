<script>
const renderItem = function(h, data) {
  let item = "";
  switch (this.type) {
    case "text": {
      item = (
        <span>
          <span>{data.model[this._prop]}</span>
        </span>
      );
      break;
    }
    case "input": {
      item = (
        <el-input
          value={data.model[this._prop]}
          on-input={this.change}
          placeholder="请输入"
          {...{
            props: { ...this.config }
          }}
        >
          {this.operation ? (
            <select-plus
              value={this.operation}
              config={{ clearable: false }}
              class="inputAppend"
              on-change={val => this.$emit("operationChange", val, this._prop)}
              slot="append"
            >
              {this.options}
            </select-plus>
          ) : (
            ""
          )}
        </el-input>
      );
      break;
    }
    case "textarea":
      item = (
        <el-input
          type="textarea"
          value={data.model[this._prop]}
          on-input={this.change}
          placeholder="请输入"
          autosize={{ minRows: 3, maxRows: 3 }}
          {...{
            props: { ...this.config }
          }}
        />
      );
      break;
    case "moneyInput": {
      item = (
        <money-input
          value={data.model[this._prop]}
          config={this.config}
          on-change={this.change}
        />
      );
      break;
    }
    case "number":
      item = (
        <el-input-number
          value={data.model[this._prop]}
          on-change={this.change}
          {...{
            props: { ...this.config }
          }}
        />
      );
      break;
    case "select":
    case "radio":
    case "checkbox": {
      const Tag = this.type + "-plus";
      item = (
        <Tag
          value={data.model[this._prop]}
          config={this.config}
          {...{
            on: {
              change: val => this.change(val, this.config.change)
            }
          }}
        />
      );
      break;
    }
    case "date":
      item = (
        <date-picker-plus
          value={data.model[this._prop]}
          config={this.config}
          on-change={this.change}
          type={this.config.dateType}
        />
      );
      break;
    case "popup":
      item = (
        <common-popup
          value={data.model[this._prop]}
          parentModel={data.model}
          sonModel={data.model}
          {...{
            on: {
              "update:sonModel": model => this.$emit("update:model", model),
              change: this.change
            },
            props: { ...this.config }
          }}
        />
      );
      break;
    case "slots":
      item = this.config.renderCell(data);
      break;
  }
  return item;
};
import DatePickerPlus from "./DatePickerPlus.vue";
import SelectPlus from "./SelectPlus.vue";
import RadioPlus from "./RadioPlus.vue";
import CheckboxPlus from "./CheckboxPlus.vue";
import MoneyInput from "./MoneyInput.vue";
const K_Operation = [
  "等于",
  "不等于",
  "模糊",
  "不模糊",
  "开头是",
  "开头不是",
  "结尾是",
  "结尾不是",
  "包含",
  "不包含",
  "介于",
  "日期介于",
  "包含逗号模糊"
];
export default {
  name: "FormItemPlus",

  model: {
    prop: "value",
    event: "change"
  },

  render(h) {
    const context = this.context;
    let item = this.getVNode(h, context);
    if ((item && item.length && item.length >= 2) || Array.isArray(item)) {
      item = <div>{item}</div>;
    }
    return item;
  },

  props: {
    model: {},
    value: "",
    type: {
      type: String,
      validator: function(value) {
        let valid = [
          "text",
          "input",
          "textarea",
          "moneyInput",
          "number",
          "select",
          "radio",
          "checkbox",
          "date",
          "popup",
          "address",
          "slots"
        ].includes(value);
        if (!valid) console.error(`baseForm组件不适配 ${value} 类型`);
        return valid;
      }
    },
    // placeholder: {
    //   type: String,
    //   default: "请输入"
    // },
    label: String,
    prop: String,
    operation: String,
    config: {
      // select配置
      selectOptions: [Array, String],
      placeholder: String,
      // date配置
      dateType: "", // 用于判断具体date下的类型 例如: daterange
      renderCell: Function
    }
  },

  data() {
    const options = K_Operation.map(item => {
      return <el-option label={item} value={item} />;
    });
    return { options };
  },
  computed: {
    _prop: function() {
      return this.prop || this.label;
    },

    context() {
      const parent = this.$parent.$parent.$parent;
      return parent.$parent.$options.name === "BaseQueryForm"
        ? parent.$parent
        : parent;
    }
  },
  components: {
    DatePickerPlus,
    SelectPlus,
    RadioPlus,
    CheckboxPlus,
    MoneyInput
  },
  methods: {
    change(val, changeFun) {
      if (changeFun === undefined && this.config && this.config.change) {
        changeFun = this.config.change;
      }
      if (typeof val === "string") {
        //val = val.trim();
        //将中文逗号转换为英文逗号
        val = val.replace(/，/g, ",");
      }
      this.$emit("change", val);

      if (changeFun) changeFun(val);
    },

    getVNode(h, context) {
      return renderItem.apply(this, [h, { model: this.model }]);
    }
  }
};
</script>
