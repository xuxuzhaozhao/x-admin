<template>
  <div class="common-page-container">
    <common-header :headerConfig="config.headerConfig">
      <template slot="otherButton" style="display: inline-block;float: left;">
        <slot name="otherButton" :selection="selection" :tableData="tableData"></slot>
        <template v-for="(btn,index) in config.headerConfig.otherButton">
          <div
            v-if="btn.config&&isBtnType(JSON.parse(btn.config).btnType,index)"
            style="display: inline;"
            :key="index"
          >
            <el-button @click="$set(ButtonConfig,index,true)" type="primary">{{btn.name}}</el-button>
            <el-dialog :title="btn.name" :visible.sync="ButtonConfig[index]">
              <base-form
                :form.sync="queryForm[index]"
                labelWidth="80px"
                :formList="JSON.parse(btn.config).column"
                :columnSize="1"
              >
                <div>
                  <el-button
                    type="primary"
                    style="float:right"
                    @click="otherBtnQuery(btn.api,btn.name,queryForm[index],index)"
                  >查询</el-button>
                  <el-button
                    style="float:right;margin-right: 15px;"
                    @click="$set(ButtonConfig,index,false)"
                  >取消</el-button>
                </div>
              </base-form>
            </el-dialog>
          </div>
          <el-button
            v-else
            :key="index"
            @click="otherBtnClick(btn.api,btn.name)"
            type="primary"
          >{{btn.name}}</el-button>
        </template>
      </template>
      <div slot="add" v-if="config.headerConfig.button.add">
        <common-form
          type="add"
          ref="add"
          :tableName="config.tableConfig.tableName"
          :column="config.form.Add.column"
          :api="config.form.Add.api"
        ></common-form>
      </div>
      <div slot="edit" v-if="config.headerConfig.button.edit">
        <common-form
          ref="edit"
          type="edit"
          :tableName="config.tableConfig.tableName"
          :column="config.form.Edit.column"
          :api="config.form.Edit.api"
          :editOneData.sync="editOneData"
          :editOneDataOLD.sync="editOneDataOLD"
          :primaryKey="config.form.Edit.key"
        ></common-form>
      </div>

      <el-card slot="dropSearch" class="box-card">
        <div v-if="config.headerConfig.button.query">
          <slot name="query">
            <common-form
              ref="query"
              type="query"
              :defultQueryForm="defultQueryForm"
              :tableName="config.tableConfig.tableName"
              :column="config.form.Query.column"
              :api="config.form.Query.api"
            ></common-form>
          </slot>
        </div>
      </el-card>
    </common-header>
    <p v-if="config.remark" v-html="config.remark"></p>
    <common-table
      ref="table"
      :tableConfig="config.tableConfig"
      v-on:select="selectRows"
      style="padding-top: 10px;"
    >
      <el-table-column slot="right" fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="editRow(scope.$index, scope.store.states.data)"
            icon="fa-pencil-square-o"
            type="text"
            size="small"
          ></el-button>
          <el-button
            @click.native.prevent="deleteRow(scope.$index, scope.store.states.data)"
            icon="fa-trash-o"
            type="text"
            size="small"
          ></el-button>
        </template>
      </el-table-column>
    </common-table>
    <p v-if="config.remark1" v-html="config.remark1"></p>
  </div>
</template>
<script>
import Table from "./Table.vue";
import Header from "./Header.vue";
import Form from "./Form.vue";

export default {
  name: "common-content",
  props: {
    baseTableMataData: {}
  },
  data() {
    return {
      tableData: [],
      selection: [],
      config: {},
      editOneData: {},
      editOneDataOLD: {},
      queryForm: {},
      defultQueryForm: {},
      ButtonConfig: []
    };
  },
  created() {
    let config = {
      remark: "",
      remark1: "",
      headerConfig: {
        button: {
          add: false,
          edit: false,
          del: false,
          upload: false,
          download: false
        },
        api: {
          delAPI: "",
          importAPI: "",
          exportAPI: ""
        },
        delKey: ""
      },
      tableConfig: {
        tableName: "",
        column: [],
        sort: "",
        order: "",
        query: [],
        box: "单选",
        rightRow: false,
        getAll: true
      },
      form: {}
    };
    const data = this.baseTableMataData;
    config.remark = data.remark;
    config.remark1 = data.remark1;
    config.tableConfig.tableName = data.tableName;
    let column = {};
    data.column.forEach(function(item) {
      column[item.columnName] = item;
    });

    for (let OP in data.tools) {
      let item = data.tools[OP];
      switch (OP) {
        case "list": {
          let List = {};
          List.column = [];
          if (item.content) {
            const array = item.content.split("|");
            array.forEach(it => {
              if (column[it].option) {
                let s = "(function(row) {";
                JSON.parse(JSON.stringify(column[it].option)).forEach(item => {
                  const str = `if(row['${column[it].labelName}']=='${item.value}'){return '${item.label}';}`;
                  s = s + str;
                });
                s = s + `return row['${column[it].labelName}']})`;
                const fn = eval(s);
                //const a=fn;
                //console.log(fn);
                column[it].formatter = fn;
              }
              const push = {
                prop: it,
                name: column[it].labelName,
                formatter: column[it].formatter
              };
              if (column[it].cellType) {
                push.cellType = column[it].cellType;
              }
              if (column[it].renderCell) {
                push.renderCell = column[it].renderCell;
              }
              List.column.push(push);
            });
          }

          config.tableConfig.column = List.column;
          config.tableConfig.sort = item.sort;
          config.tableConfig.order = item.order;
          config.tableConfig.api = item.api.toLowerCase();
          config.tableConfig.box = item.box;
          config.tableConfig.query = item.query;
          config.tableConfig.queryOperation = item.queryOperation;
          break;
        }
        case "rightSide": {
          config.tableConfig.rightRow = true;
          break;
        }
        case "add": {
          let Add = {};
          config.headerConfig.button.add = true;
          Add.column = [];
          Add.api = item.api.toLowerCase();
          if (item.content) {
            const array = item.content.split("|");
            array.forEach(it => {
              Add.column.push(column[it]);
            });
          }
          config.form.Add = Add;
          break;
        }
        case "edit": {
          let Edit = {};
          config.headerConfig.button.edit = true;
          Edit.column = [];
          Edit.api = item.api.toLowerCase();
          Edit.key = item.key;
          if (item.content) {
            const array = item.content.split("|");
            array.forEach(it => {
              Edit.column.push(column[it]);
            });
          }
          config.form.Edit = Edit;
          break;
        }
        case "query": {
          let Query = {};
          config.headerConfig.button.query = true;
          Query.column = [];

          const array = item.content.split("|");
          array.forEach(it => {
            Query.column.push(column[it]);
          });
          config.form.Query = Query;
          break;
        }
        case "delete": {
          config.headerConfig.button.del = true;
          config.headerConfig.api.delAPI = item.api.toLowerCase();
          config.headerConfig.delKey = item.key;
          break;
        }
        case "import": {
          config.headerConfig.button.upload = true;
          config.headerConfig.api.importAPI = item.api.toLowerCase();
          break;
        }
        case "export": {
          config.headerConfig.button.download = true;
          config.headerConfig.api.exportAPI = item.api.toLowerCase();
          config.headerConfig.api.exportOrder = item.sort;
          break;
        }
        case "otherBtn": {
          config.headerConfig.otherButton = item;
        }
        default:
      }
    }
    this.config = config;
    //console.log(config);
  },
  components: {
    "common-table": Table,
    "common-header": Header,
    "common-form": Form
  },
  methods: {
    deleteRow(index, rows) {
      const self = this;
      this.$confirm("是否删除, 请确认?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        self
          .$http({
            method: "delete",
            url: "/api/Module/DelModules",
            data: {
              id: rows[index].ID,
              tableName: self.config.tableConfig.tableName
            }
          })
          .then(function(response) {
            //console.log(response);
          })
          .catch(function(error) {
            //console.log(error);
            rows.splice(index, 1);
            self.$message({
              type: "success",
              message: "删除成功!"
            });
          });
      });
    },
    editRow(index, rows) {
      //this.$children[0].editVisible=true;
      this.$children[0].edit(rows[index]);
    },
    selectRows(value) {
      //console.log(value);
      this.selection = value;
      this.$emit("selectone", value);
    },
    isBtnType(type, index) {
      if (type === "传参返回值并查询") {
        if (!this.queryForm[index]) {
          this.$set(this.queryForm, index, {});
        }
        return true;
      }
      return false;
    },
    otherBtnQuery(api, name, content, index) {
      this.$refs.query.form = content;
      this.$refs.query.submitQuery();
      this.ButtonConfig[index] = false;
    },
    otherBtnClick(api, name) {
      let type = "post";
      // 判断字符串里面的[Get]/[Post]
      api = api.replace(/\[[^\}]+\]/, match => {
        type = match.slice(1, -1).toLowerCase();
        return "";
      });
      // 替换字符串中的{{???}}
      api.replace(/\{{[^\}]+\}}/g, match => {
        console.log(match);
      });
      this.$http[type](api.toLowerCase()).then(res => {
        if (res.data.Result === 0) {
          this.$message({
            type: "success",
            message: name + "操作" + res.data.Message
          });
        } else {
          this.$notify.error({
            title: "错误",
            message: name + "操作" + res.data.Message,
            duration: 0
          });
        }
      });
    }
  }
};
</script>
<style>
.common-page-container {
  padding: 20px 0px !important;
}
.common-page-container p {
  display: inline-block;
  font-size: 14px;
  color: #888888;
  line-height: 1.5em;
  margin-bottom: 0;
  margin-top: 10px;
}
.common-page-container .el-card__body {
  padding: 15px 10px 0 10px;
}
</style>