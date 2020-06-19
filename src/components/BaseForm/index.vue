<template>
  <el-form
    ref="form"
    :class="border ? 'BaseForm border' : 'BaseForm'"
    :model="form"
    :label-position="columnSize === 1 ? labelPosition : 'right'"
    :label-width="labelWidth"
  >
    <template v-for="(it, index) in formList">
      <template v-if="it.config === undefined || it.config.isHidden !== true">
        <template v-if="type === 'grid'">
          <el-col
            :key="index"
            :style="{ backgroundPositionX: labelWidth }"
            :class="{ border: border, notLabel: !it.label }"
            :span="it.config.span || 24"
          >
            <div class="border-before" :style="{ width: labelWidth }" />
            <el-form-item
              :class="columnSize !== 1 ? 'label' : ''"
              :label="it.label"
              :prop="it.prop"
              :required="it.config && it.config.required"
              :rules="it.config && it.config.rules"
              :style="{
                marginBottom: columnSize === 1 ? '15px' : ''
              }"
            >
              <form-item-plus
                :value="form[it.prop]"
                :model="form"
                :type="it.type"
                :label="it.label"
                :prop="it.prop"
                :operation="operation && operation[it.prop]"
                :config="it.config"
                @change="val => change(val, it.prop)"
                @operationChange="operationChange"
                @update:model="val => updateModel(val)"
              />
            </el-form-item>
          </el-col>
        </template>
        <template v-if="type !== 'grid'">
          <div
            :key="index"
            :style="{
              backgroundPositionX: labelWidth,
              width: columnSize !== 0 ? (100 / columnSize) + '%' : ''
            }"
            :class="{ cols: true, border: border, notLabel: !it.label }"
          >
            <!-- <div class="border-before" :style="{ width: labelWidth }" /> -->
            <el-form-item
              :class="{'label':columnSize !== 1, 'el-form-item__textarea':it.type === 'textarea'}"
              :label="it.label"
              :prop="it.prop"
              :required="it.config && it.config.required"
              :rules="it.config && it.config.rules"
              :style="{
                marginBottom: columnSize === 1 ? '15px' : ''
              }"
            >
              <form-item-plus
                :value="form[it.prop]"
                :model="form"
                :type="it.type"
                :label="it.label"
                :prop="it.prop"
                :operation="operation && operation[it.prop]"
                :config="it.config"
                @change="val => change(val, it.prop)"
                @operationChange="operationChange"
                @update:model="val => updateModel(val)"
              />
            </el-form-item>
          </div>
        </template>
      </template>
    </template>
    <slot></slot>
  </el-form>
</template>
<script>
import FormItemPlus from "./src/FormItemPlus.vue";
export default {
  name: "BaseForm",
  components: {
    FormItemPlus
  },
  props: {
    form: {},
    operation: {},
    // 定义列数 为0时表示为自动响应
    columnSize: {
      type: Number,
      default: 0
    },
    formList: Array,
    type: {
      type: String,
      default: "width",
      validator: value => {
        let valid = ["width", "grid"].includes(value);
        if (!valid) console.error(`baseForm组件不适配 ${value} 类型`);
        return valid;
      }
    },
    labelPosition: {
      type: String,
      default: "top"
    },
    border: Boolean,
    labelWidth: {
      type: String,
      default: "100px"
    }
  },
  created() {},

  methods: {
    change(val, prop) {
      this.$set(this.form, prop, val);
      this.$emit("change", this.form, prop, val);
    },

    operationChange(val, prop) {
      const operation = JSON.parse(JSON.stringify(this.operation));
      operation[prop] = val;
      this.$set(this.operation, prop, val);
      this.$emit("operationChange", operation, prop);
    },

    updateModel(val) {
      Object.keys(val).forEach(key => {
        if (val[key] === "") {
          this.$delete(this.form, key);
        }
      });
    },

    validate(fun) {
      if (fun) {
        this.$refs["form"].validate(valid => {
          fun(valid);
        });
      } else {
        return new Promise((resolve, reject) => {
          this.$refs["form"].validate(valid => {
            if (valid) {
              resolve(true);
            } else {
              reject(false);
            }
          });
        });
      }
    },
    resetFields() {
      this.$refs["form"].resetFields();
    }
  }
};
</script>
<style lang="scss">
$height: 30px;
.BaseForm {
  width: 100%;
  overflow: hidden;
  &.border {
    border-bottom: 1px solid #bfcbd9;
    border-right: 1px solid #bfcbd9;
    border-radius: 4px;
    .el-row {
      display: flex;
      flex-wrap: wrap;
      & > .el-col:first-child {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
      & > .el-col:last-child {
        border-bottom-left-radius: 4px;
      }
      .border {
        position: relative;
        .border-before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 100px;
          border-right: 1px solid #d8dce5;
          background-color: #f7f8fa;
          z-index: -1;
        }
      }
    }
  }
  .border {
    border-top: 1px solid #bfcbd9;
    border-left: 1px solid #bfcbd9;
    padding-right: 10px;
    .el-form-item__content {
      padding-left: 10px;
    }
  }
  .border.notLabel {
    background: #ffffff;
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  .el-form-item {
    position: relative;
    // margin-top: 4px;
    // margin-bottom: 4px;

    &.label {
      .el-form-item__label {
        word-break: keep-all;
        padding: 0;
        padding-right: 12px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .el-form-item__content {
      // line-height: 35px;
      // min-height: 36px;
      align-items: center;
    }
    .el-input-group__append {
      padding: 0 15px;
      background-color: #ffffff;
      .el-select.inputAppend {
        width: 30px;
        overflow: hidden;
        .el-input {
          i {
            width: 30px;
            position: absolute;
            right: -10px;
            font-size: 12px;
          }
          input {
            border: 0;
            padding: 0;
            width: 0;
          }
        }
      }
    }
  }
  .el-input__inner {
    font-size: 13px;
  }
  .el-textarea__inner {
    height: 75px;
    &:focus {
      border-color: #2a344d;
    }
  }
  .DatePickerPlus {
    height: 100%;
    .el-col {
      height: 100%;
    }
  }
  .el-select {
    display: block;
    width: 100%;
  }
  .el-date-editor,
  .el-input-number {
    width: 100%;
  }
  .cols {
    width: 16.66666666666667%;
    height: auto;
  }
  .el-row {
    width: 100%;
  }

  @media (max-width: 1680px) {
    .cols {
      width: 20%;
    }
  }
  @media (max-width: 1440px) {
    .cols {
      width: 25%;
    }
  }
  @media (max-width: 1024px) {
    .cols {
      width: 33.33333333333333%;
    }
  }
  @media (max-width: 700px) {
    .cols {
      width: 50%;
    }
  }
  @media (max-width: 480px) {
    .cols {
      width: 100%;
    }
  }
}
</style>
