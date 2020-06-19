<template>
  <div class="commonHeader">
    <div class="commonHeader-btn" style="float: left">
      <el-button v-if="headerConfig.button.add" @click="addVisible = true" type="info">添加</el-button>
      <el-button v-if="headerConfig.button.del" type="danger" @click="delBtn($parent.selection)">删除</el-button>
      <el-button v-if="headerConfig.button.edit" @click="edit($parent.selection)" type="success">编辑</el-button>
      <el-button v-if="headerConfig.button.download" type="info" @click="download">导出文件</el-button>
      <a id="downloadTRUE" :href="downloadAPI" download></a>
      <el-upload
        style="display: inline-block;float: left;width: 93px;height: 32px;"
        v-if="headerConfig.button.upload"
        class="upload-demo"
        :action="headerConfig.api.importAPI+'?currentPage='+pagePath"
        with-credentials
        :before-upload="beforeAvatarUpload"
        name="fileUpload"
        accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :on-success="upSuccess"
        :on-error="upError"
        :data="uploadFileParams"
        :file-list="fileList"
        :on-change="handleChange"
      >
        <el-button type="info">导入文件</el-button>
      </el-upload>
      <slot name="otherButton"></slot>
      <el-dialog
        custom-class="header-dialog"
        title="添加"
        v-if="headerConfig.button.add"
        :visible.sync="addVisible"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
        @close="dialogClose('add')"
      >
        <slot name="add"></slot>
      </el-dialog>
      <el-dialog
        custom-class="header-dialog"
        title="编辑"
        :visible.sync="editVisible"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
      >
        <slot name="edit"></slot>
      </el-dialog>
    </div>
    <div class="gj-search">
      <el-input
        style="float: left; width: 225px;"
        v-model="search"
        @input="searchChange"
        :placeholder="placeholder.labelName"
      >
        <i slot="suffix" class="el-input__icon el-icon-search" @click="iconSearch"></i>
      </el-input>
      <el-button
        :class="queryShow?'DROPSEARCH show':'DROPSEARCH'"
        @click="showQuery($event)"
        style="padding: 11pxborder-radius: 0 4px 4px 0;"
      >
        高级搜索
        <i class="el-icon-caret-bottom el-icon--right"></i>
      </el-button>
      <div class="dropbox" v-show="queryShow">
        <el-collapse-transition>
          <div class="dropbox-container">
            <div class="droptitle">高级搜索</div>
            <slot name="dropSearch"></slot>
          </div>
        </el-collapse-transition>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Header",
  props: {
    headerConfig: {
      button: {
        add: true,
        edit: true,
        del: true,
        upload: true,
        download: true
      },
      api: {
        delAPI: "",
        importAPI: "",
        exportAPI: "",
        exportOrder: {}
      },
      delKey: ""
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      const dropbox = $(".dropbox");
      const DROPSEARCH = $(".gj-search");
      $(document).click(ev => {
        const target = $(ev.target);
        //console.log(ev)
        if (!DROPSEARCH.find(target).length && !dropbox.find(target).length) {
          this.queryShow = false;
        }
      });
      const query = this.$parent.$refs.query;
      if (query) {
        this.placeholder = query.column[0];
      }
    });
  },
  data() {
    return {
      addVisible: false,
      editVisible: false,
      search: "",
      uploadFileParams: {
        tableName: ""
      },
      downloadAPI: "",
      placeholder: {},
      queryShow: false,
      top: "0px",
      left: "0px",
      lastTIME: "",
      fileList: []
    };
  },
  computed: {
    pagePath() {
      const to = this.$route;
      let path = "";
      if (to.matched.length === 2) {
        path = to.matched[1].path.substr(to.matched[0].path.length);
      } else {
        path = to.path;
      }
      return path;
    }
  },
  methods: {
    dialogClose(type) {
      this.$parent.$refs.add.reset(type);
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1);
    },
    showQuery(event) {
      const btn = document.getElementsByClassName("dropSearch");
      this.left = getLeft(btn);
      this.top = getTop(btn);
      function getTop(e) {
        var offset = e.offsetTop;
        if (e.offsetParent != null) offset += getTop(e.offsetParent);
        return offset;
      }
      function getLeft(e) {
        var offset = e.offsetLeft;
        if (e.offsetParent != null) offset += getLeft(e.offsetParent);
        return offset;
      }
      this.queryShow = !this.queryShow;
    },
    download() {
      //console.log(this.headerConfig.api)
      let order = [];
      if (typeof this.headerConfig.api.exportOrder === "object") {
        order = this.headerConfig.api.exportOrder;
      } else {
        const ary = this.headerConfig.api.exportOrder.split(",");
        ary.forEach(item => {
          let name = item.split(" ");
          order.push({
            Name: name[0],
            Type: name[1] || "ASC"
          });
        });
      }
      this.$http
        .post(this.headerConfig.api.exportAPI, {
          TableName: this.$parent.$refs.table.tableConfig.tableName,
          Order: order
        })
        .then(res => {
          this.downloadAPI = location.origin + res.data.Data;
          console.log(this.downloadAPI);
          setTimeout(function() {
            document.getElementById("downloadTRUE").click();
          }, 0);
        });
    },
    beforeAvatarUpload(file) {
      const reg = /^.*\.(?:xls|xlsx)$/i;
      const isEXCL = reg.test(file.name);
      const isLt2M = file.size / 1024 / 1024 < 20;
      if (!isEXCL) {
        this.$message.error("上传文件应为EXCEL!");
      }
      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 20MB!");
      }
      this.uploadFileParams.tableName = this.$parent.$refs.table.tableConfig.tableName;
      return isEXCL && isLt2M;
    },
    upSuccess() {
      this.$message({
        type: "success",
        message: "上传成功!"
      });
      this.$parent.$refs.table.getData();
    },
    upError(err) {
      this.$message({
        message: err.message,
        type: "warning"
      });
    },
    searchChange: _.debounce(function(val) {
      this.iconSearch();
    }, 500),
    iconSearch() {
      const name = this.placeholder.columnName;
      const form = JSON.parse(JSON.stringify(this.$parent.$refs.query.form));

      form[name] = this.search;
      this.$parent.$refs.query.form = form;
      const operation = {};
      operation[name] = "模糊";
      this.$parent.$refs.query.submitQuery(operation);
      //console.log(this.$parent.$refs.query)
    },
    delBtn(data) {
      if (data.length) {
        const self = this;
        this.$confirm("是否删除, 请确认?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          const delKey = this.headerConfig.delKey.split("|");
          let primaryKey = [];
          delKey.forEach(item => {
            const key = {
              key: item,
              value: this.$parent.selection[0][item]
            };
            primaryKey.push(key);
          });
          let parameter = {};
          let api = this.headerConfig.api.delAPI.toUpperCase();
          if (
            api === "api/YiCheng/BaseTable/Del".toUpperCase() ||
            api === "/api/YiCheng/BaseTable/Del".toUpperCase()
          ) {
            parameter = {
              method: "post",
              url: api.toLowerCase(),
              data: {
                tableName: self.$parent.$refs.table.tableConfig.tableName,
                primaryKey
              }
            };
          } else {
            //                            const reg = /\{(.+?)\}/g;
            //                            const array = api.match(reg)
            //                            array.forEach(item => {
            //                                let reg = '/' + item + '/';
            //                                api = api.replace(eval(reg), this.$parent.selection[0][item.substr(1, item.length - 2)])
            //                            });
            let primaryKey1 = {};
            delKey.forEach(item => {
              primaryKey1[item] = this.$parent.selection[0][item];
            });
            console.log(primaryKey1);
            parameter = {
              method: "get",
              url: api.toLowerCase(),
              params: primaryKey1
            };
          }
          self
            .$http(parameter)
            .then(function(response) {
              //console.log(response);
              self.$parent.$refs.table.getData();
              self.$message({
                type: "success",
                message: "删除成功!"
              });
            })
            .catch(function(error) {
              //console.log(error);
            });
        });
      } else {
        this.$message({
          message: "请选择删除项",
          type: "warning"
        });
      }
      //console.log(this.$parent.selection);
      //console.log(this.$parent.$refs.table.tableConfig.tableName);
    },
    edit(data) {
      if (data.length === 1) {
        const data = JSON.parse(JSON.stringify(this.$parent.selection[0]));
        this.$parent.editOneData = data;
        this.$parent.editOneDataOLD = JSON.parse(JSON.stringify(data));
        this.editVisible = true;
      } else {
        this.$message({
          message: "请选择一个编辑项",
          type: "warning"
        });
      }
    }
  }
};
</script>
<style lang="scss">
.commonHeader {
  margin: 10px 0;
  display: table;
  width: 100%;
  padding: 0 20px;
  .gj-search .el-input .el-input__inner {
    border-radius: 4px 0 0 4px;
  }
  .gj-search .el-select .el-input__inner {
    border-radius: 4px;
  }
  .el-input__inner:focus {
    border-color: #2a344d;
  }
  .el-dialog__footer {
    text-align: center;
  }
  .el-upload-list {
    display: inline-block;
    max-width: 150px;
    padding-left: 10px;
  }
  .header-dialog {
    width: 600px;
  }
  .commonHeader-btn {
    float: left;
  }
  .commonHeader-btn .el-button {
    margin-right: 6px;
    margin-left: 0px;
    float: left;
  }
  .gj-search {
    float: right;
    position: relative;
  }
  .gj-search .el-input__inner {
    height: 34px;
    border: 1px solid #d7d7d7;
  }
  .gj-search .DROPSEARCH {
    border: 1px solid #d7d7d7;
    margin-right: 0px !important;
    border-left: none !important;
    color: #999999;
  }
  .gj-search .DROPSEARCH.show {
    border: 1px solid #5c708d;
    color: #ffffff;
    background-color: #5c708d;
  }
  .DROPSEARCH.el-button:hover {
    color: #2a344d;
    background-color: #ffffff;
  }
  .DROPSEARCH.show.el-button:hover {
    color: #2a344d;
  }
  .gj-search .dropbox {
    width: 333px;
    position: absolute;
    right: 0;
    top: 44px;
    z-index: 999;
    box-shadow: -1px 1px 10px rgba(0, 0, 0, 0.1);
  }
  .gj-search .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  .gj-search .droptitle {
    background-color: #5c708d;
    color: #ffffff;
    text-indent: 20px;
    font-size: 14px;
    height: 50px;
    line-height: 50px;
  }
  .gj-search .el-card {
    border: none;
    border-radius: 4px;
    background-color: #f8f9f8;
    margin: 0 !important;
    max-height: 720px;
    overflow-y: scroll;
  }
  .common-page-container .gj-search .el-card__body {
    padding: 0;
  }
  .gj-search .el-form {
    /* padding: 0 0 50px 0; */
  }
  .gj-search .el-form-item {
    background-color: #ffffff;
    padding: 0 20px 20px 20px;
    margin-bottom: 0;
  }
  .gj-search .el-form .el-form-item:first-child {
    padding-top: 20px;
  }
  .gj-search .el-form .el-form-item:last-child {
    background-color: #f8f9f8;
    padding-top: 30px;
    padding-bottom: 30px;
  }
  .gj-search .el-button.DROPSEARCH {
    padding: 0 15px;
    height: 34px;
    border-radius: 0 4px 4px 0;
  }
}
@media screen and (max-width: 780px) {
  .commonHeader {
    padding: 0 12px;
    .gj-search {
      width: 100%;
      background-color: #ffffff;
      .dropbox {
        width: 100%;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        -webkit-box-shadow: none;
        box-shadow: none;
        .dropbox-container {
          height: 100%;
        }
        .el-card {
          height: calc(100% - 50px);
          overflow-y: scroll;
        }
      }
    }
    .gj-search > .el-input {
      width: calc(100% - 100px) !important;
    }
    .dropbox .el-form-item__label {
      padding-bottom: 0;
    }
  }
}
</style>
