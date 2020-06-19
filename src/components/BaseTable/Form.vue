<template>
  <div class="conmmonForm">
    <base-form
      v-if="type=='add'"
      ref="ruleForm1"
      :form.sync="form"
      labelWidth="80px"
      :formList="_column"
      :columnSize="1"
    >
      <div>
        <el-button type="primary" style="float:right" @click="submitForm('ruleForm1')">保存</el-button>
        <el-button style="float:right;margin-right: 15px;" @click="reset('add')">取消</el-button>
      </div>
    </base-form>
    <base-form
      v-else-if="type=='edit'"
      ref="ruleForm2"
      :form.sync="editData"
      labelWidth="80px"
      :formList="_column"
      :columnSize="1"
    >
      <div>
        <el-button type="primary" style="float:right" @click="submitForm('ruleForm2')">保存</el-button>
        <el-button style="float:right;margin-right: 15px;" @click="reset('edit')">重置</el-button>
      </div>
    </base-form>

    <el-form
      v-else-if="type=='query'"
      ref="ruleForm3"
      :model="form"
      label-width="80px"
      label-position="top"
    >
      <el-form-item
        v-for="item in column"
        :key="item.columnName"
        :label="item.labelName"
        :prop="item.columnName"
      >
        <el-input
          v-if="item.type === 'input'"
          @keyup.enter.native="submitQuery()"
          v-model.trim="form[item.columnName]"
        >
          <el-select v-model="operation[item.columnName]" slot="append" style="width: 90px">
            <el-option
              v-for="type in operationType"
              :key="type.value"
              :label="type.text"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-input>
        <el-select
          v-if="item.type === 'select'"
          v-model="form[item.columnName]"
          clearable
          style="width: 100%"
        >
          <el-option v-for="op in item.option" :key="op.value" :label="op.label" :value="op.value"></el-option>
        </el-select>
        <common-popup
          v-if="item.type === 'popup'"
          size="small"
          v-model="form[item.columnName]"
          :selectName="item.selectName"
          :valueName="item.valueName"
          :identity="item.identity"
          :url="item.url"
        ></common-popup>
        <date-picker-plus
          style="width:100%"
          class="date-picker-plus"
          v-if="item.type.includes('date')"
          :type="item.type"
          placeholder="选择日期"
          v-model="form[item.columnName]"
        ></date-picker-plus>
        <el-input
          v-if="item.type === 'textarea'"
          type="textarea"
          autosize
          v-model="form[item.columnName]"
        ></el-input>
      </el-form-item>
      <el-form-item style="text-align: center;">
        <el-button type="primary" @click="submitQuery()">查询</el-button>
        <el-button @click="reset('query')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import DatePickerPlus from "@/components/DatePickerPlus/index.vue";
export default {
  components: {
    "date-picker-plus": DatePickerPlus
  },
  props: {
    refstable: "",
    tableName: "",
    column: {},
    api: "",
    type: "",
    updateFun: Function,
    primaryKey: "",
    editOneData: {},
    editOneDataOLD: {}
  },
  data() {
    const operationType = this.$store.state.K_Operation.map(item => {
      return {
        text: item,
        value: item
      };
    });
    let operation = {};
    let popupLoding = {};
    this.column.forEach(item => {
      //下拉框和弹出框为等于
      if (item.type === "select" || item.type === "popup") {
        operation[item.columnName] = "等于";
        if (item.type === "popup") {
          popupLoding[item.columnName] = true;
        }
      } else if (item.type === "daterange") {
        //日期范围的查询条件为介于
        operation[item.columnName] = "日期介于";
      } else {
        //模糊
        operation[item.columnName] = "模糊";
      }
    });
    return {
      popupOptions: {},
      popupLoding: popupLoding,
      form: {},
      editData: this.editOneData,
      operation: operation,
      operationType: operationType
    };
  },
  watch: {
    editOneData(val) {
      this.editData = JSON.parse(JSON.stringify(val));
    }
  },
  computed: {
    _column() {
      return this.column.map(item => {
        if (item.url) item.url = item.url.toLocaleLowerCase();
        if (item.rule) item.rules = item.rule;
        let { type, labelName, columnName, ...config } = item;
        try {
          if (config.disabled === true && this.type === "add") {
            config.disabled = false;
          }

          if (type.includes("date")) {
            config.dateType = type;
            type = "date";
          }

          if (type === "select") {
            config.selectOptions = config.option;
            delete config.option;
          }

          if (type === "popup") {
            if (config.initTags) config.initTags = config.initTags.join();
            if (config.changeClearTags)
              config.changeClearTags = config.changeClearTags.join();
          }
        } catch (err) {
          console.error(labelName + "配置数据出错");
        }

        return {
          type,
          prop: columnName,
          label: labelName,
          config
        };
      });
    }
  },
  methods: {
    rule(rule) {
      if (rule) {
        rule.forEach(item => {
          for (const key in item) {
            //console.log(it)
            if (key === "pattern") {
              //如果自定义验证
              item[key] = eval(item[key]); //计算字符串为可执行js代码
            }
          }
        });
      }
      return rule;
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        const type = this.type;
        let api = this.api;
        if (valid) {
          let data = {};
          let message = "";
          if (type === "add") {
            message = "添加成功";
            let formData = JSON.parse(JSON.stringify(this.form));
            this.column.forEach(item => {
              if (typeof formData[item.columnName] === "undefined") {
                //如果绑定的form的列没有数据（即没有定义）
                formData[item.columnName] = "";
              }
            });
            if (
              api.toUpperCase() === "/api/YiCheng/BaseTable/add".toUpperCase()
            ) {
              data = JSON.parse(
                JSON.stringify({
                  tableName: this.tableName,
                  column: formData
                })
              );
            } else {
              data = formData;
            }
          } else if (type === "edit") {
            message = "修改成功";
            const postData = {};
            this.column.forEach(item => {
              //注意必须用column循环每一列，找出有数据和无数据的依次赋值
              postData[item.columnName] = this.editData[item.columnName] || "";
            });
            if (
              api.toUpperCase() ===
              "/api/YiCheng/BaseTable/update".toUpperCase()
            ) {
              const key = this.primaryKey.split(","); //可能有多个
              let primaryKey = {};
              key.forEach(item => {
                primaryKey[item] = this.editOneDataOLD[item];
                // console.log(this.editOneDataOLD)
              });
              // console.log(this.column);
              data = JSON.parse(
                JSON.stringify({
                  tableName: this.tableName,
                  primaryKey,
                  column: postData
                })
              );
            } else {
              postData.ID = this.editData.ID;
              data = postData;
            }
          }
          this.$http.post(api, data).then(response => {
            if (!response.data.Result) {
              if (type === "add") {
                this.$parent.$parent.addVisible = false;
              } else if (type === "edit") {
                this.$parent.$parent.editVisible = false;
              }
              this.$refs[formName].$refs.form.resetFields();
              if (this.updateFun) {
                this.updateFun();
              } else {
                this.$parent.$parent.$parent.$refs.table.getData();
              }
              this.$message({
                message: message,
                type: "success"
              });
            } else {
              this.$message({
                message: response.data.Message,
                type: "warning"
              });
            }
          });
        } else {
          // console.log("error submit!!");
          return false;
        }
      });
    },
    submitQuery(operation) {
      let data = JSON.parse(JSON.stringify(this.form));
      for (let key in data) {
        if (data[key] === "") {
          delete data[key];
        }
      }
      let table = this.refstable || this.$parent.$parent.$parent.$refs.table;
      table.tableConfig.query = data;
      table.tableConfig.queryOperation = JSON.parse(
        JSON.stringify(this.operation)
      );
      if (operation) {
        for (let key in operation) {
          table.tableConfig.queryOperation[key] = operation[key];
        }
      }
      console.log(table.tableConfig, operation);
      table.getData();
      const header = this.$parent.$parent;
      // alert(header.placeholder.columnName)
      header.search = data[header.placeholder.columnName];
      this.$parent.$parent.queryShow = false;
    },
    reset(type) {
      if (type === "add") {
        let form = JSON.parse(JSON.stringify(this.form));
        for (let i in form) {
          form[i] = ""; //赋空值
        }
        this.$refs["ruleForm1"].$refs.form.resetFields(); //清除验证
        this.form = form;
        this.$parent.$parent.addVisible = false;
      } else if (type === "edit") {
        this.editData = JSON.parse(JSON.stringify(this.editOneDataOLD));
        this.$refs["ruleForm2"].$refs.form.resetFields();
      } else if (type === "query") {
        this.form = {};
        this.submitQuery(); //重新执行查询赋为空的方法
        this.$parent.$parent.queryShow = false;
      }
    }
  }
};
</script>
<style scoped>
.YCPOPUP {
  width: 560px;
}
.YCPOPUP .el-select-dropdown__item {
  width: auto;
  display: inline-block;
  min-width: 100px;
  text-align: center;
  margin: 0 6px 0 6px;
}
.YCPOPUP-small {
  width: 100%;
}
.YCPOPUP-small .el-select-dropdown__item {
  width: auto;
  display: inline-block;
  min-width: 100px;
  text-align: center;
  margin: 0 6px 0 6px;
}
.el-form-item__label {
  color: #999999;
  line-height: 1;
}
.el-dialog__wrapper .el-form-item__content .el-button {
  float: right;
  margin-left: 10px;
  padding: 12px 15px;
  border-radius: 4px;
}
.el-card .el-form-item__content .el-button {
  float: right;
  margin-left: 10px;
  padding: 12px 15px;
  border-radius: 4px;
}
.el-form--label-top .el-form-item__label {
  padding: 0 0 5px;
}
</style>