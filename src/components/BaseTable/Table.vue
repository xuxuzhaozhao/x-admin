<template>
  <div class="basePageTable" @mousedown="tableMousedown">
    <el-table
      v-loading="propsLoading || loading"
      element-loading-text="拼命加载中"
      ref="commonTable"
      :data="tableData"
      border
      :stripe="!tableRowClassFun"
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      @header-dragend="headerDragend"
      @sort-change="sortChange"
      @cell-mouse-enter="cellMouseEnter"
      @cell-mouse-leave="cellMouseLeave"
      @cell-dblclick="cellDblclick"
      @expand-change="expand"
      @row-click="rowClick"
      :expand-row-keys="expandRowKeys"
      :row-key="rowKey"
      :row-class-name="tableRowClassName"
    >
      <el-table-column
        v-if="tableConfig.box == '单选' || tableConfig.box == '多选'"
        :reserve-selection="
          tableConfig.box === '多选' && typeof rowKey !== 'undefined'
        "
        type="selection"
        width="55"
      ></el-table-column>
      <!-- <el-table-column  type="index" width="55">
      </el-table-column>-->
      <column-plus
        v-if="tableConfig.box == '序号'"
        label="序号"
        cellType="index"
        :width="40"
        :sortable="false"
      ></column-plus>
      <slot name="otherColumn"></slot>
      <column-plus
        v-for="(col, index) in tableConfig.column"
        v-bind="col"
        :key="index"
        :prop="col.prop"
        :label="col.name"
        :formatter="col.formatter"
        :width="columnWidth(col.name) || col.width"
        :show-overflow-tooltip="
          col['show-overflow-tooltip'] === false ? false : true
        "
      ></column-plus>

      <slot v-if="tableConfig.rightRow" name="right"></slot>
    </el-table>

    <el-pagination
      v-if="show"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[1, 5, 10, 15, 50, 100, 200]"
      :page-size="pageSize"
      layout="total,sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <div
      v-if="draggable"
      v-show="isDrag"
      class="dragTable"
      :style="{ left: clientX + 15 + 'px', top: clientY + 15 + 'px' }"
    >
      <el-table
        :data="dragData"
        border
        style="width: 100%;min-width: 560px;"
        :row-class-name="tableRowClassName"
      >
        <column-plus
          v-for="col in tableConfig.column"
          v-bind="col"
          :key="col.prop"
          :prop="col.prop"
          :label="col.name"
          :formatter="col.formatter"
          :width="columnWidth(col.name) || col.width"
        ></column-plus>
      </el-table>
    </div>
    <textarea ref="copyValueRef" style="position: absolute;top: 0;left: 0;opacity: 0;z-index: -10;"></textarea>
  </div>
</template>
<script>
import ColumnPlus from "./ColumnPlus.vue";
function saveColumnWidth(path, columnName, width) {
  const data = JSON.parse(localStorage.getItem(path)) || {
    table: {
      column: {}
    }
  };
  data.table.column[columnName] = {
    width: width
  };
  localStorage.setItem(path, JSON.stringify(data));
}
export default {
  name: "common-table",
  components: {
    "column-plus": ColumnPlus
  },
  inheritAttrs: false,
  props: {
    data: Array,
    propsLoading: {
      type: Boolean,
      default: false
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false
    },
    tableConfig: {
      tableName: {
        type: String
      },
      api: {
        type: String,
        default: "/Api/BaseTable/GetList"
      },
      column: {
        type: Array
      },
      // 当api存在时默认进行查询，autoQuery为true 时不自动查询
      autoQuery: Boolean,
      QueryFields: "",
      query: {},
      queryOperation: {},
      order: [],
      fun: Function,
      box: "", //单选·多选·序号·隐藏
      rightRow: false,
      pageSize: ""
    },
    // table里面的行是否可以拖动
    draggable: Boolean,
    // 是否显示分页
    isPagination: {
      type: Boolean,
      default: true
    },
    tableRowClassFun: Function,
    expandRowKeys: Array,
    rowKey: [Function, String]
  },
  data: function() {
    return {
      clientX: 0,
      clientY: 0,
      isSlideSelection: false, //是否在进行滑动选择
      slideSelectionList: [], //滑动选择的选中的列表
      hoverCell: {},
      isDrag: false, //是否处于拖动状态
      dragData: [], // 拖动的数据
      oldSort: "",
      oldTableConfig: this.tableConfig,
      loading: false,
      tableData: [],
      pageSize: this.tableConfig.pageSize || 15,
      page: 1,
      total: 0,
      selection: [],
      queryCopy: this.tableConfig.query,
      queryOperationCopy: this.tableConfig.queryOperation
    };
  },
  watch: {
    tableConfig: {
      handler: function(val, oldVal) {
        const def = this.whichKeyChange(this.oldTableConfig, val);
        const ary = [
          "tableName",
          "api",
          "QueryFields",
          "query",
          "queryOperation",
          "MultiCondition"
        ];
        for (let i = 0; i < ary.length; i++) {
          if (def.includes(ary[i])) {
            // 现在不能通过更改 tableConfig 来自动进行更新操作 ，只能主动调用getData方法
            // this.getData();
            break;
          }
        }
        this.oldTableConfig = _.cloneDeep(val);
      },
      deep: true,
      immediate: true
    },
    data() {
      this.getData();
    },
    isDrag(val) {
      if (val) {
        $(document).mousemove(event => {
          var e = event || window.event;
          this.clientX = e.clientX;
          this.clientY = e.clientY;
        });
        $(document).mouseup(ev => {
          if (this.dragData.length) {
            this.isDrag = false;
            const table = $(this.$refs.commonTable.$el);
            table.find("tr.el-table__row").css({ opacity: "1" });

            this.dragData = [];
            this.$emit("drag", []);
          }
        });
      } else {
        $(document).unbind("mousemove");
      }
    },
    tableData(val) {
      // 如果在获取数据前已经选择，并且选择行数据中包含ID字段,获取数据后如果该id存在,则勾选该行
      const selection = JSON.parse(JSON.stringify(this.selection));
      this.$nextTick(() => {
        if (
          this.tableConfig.box === "单选" &&
          selection[0] &&
          selection[0].ID
        ) {
          selection.forEach(item => {
            const index = _.findIndex(val, {
              ID: item.ID
            });
            if (index !== -1) {
              this.$refs.commonTable.toggleRowSelection(val[index]);
            }
          });
        }
      });
    },
    loading(val) {
      this.$emit("isloading", val);
    }
  },
  computed: {
    show: function() {
      //这里调整为一直显示分页，除非isPagination为false
      return this.isPagination;
    },
    tableMeta() {
      let data = {};
      try {
        data = JSON.parse(
          localStorage.getItem(this.$router.history.current.path)
        );
        return data;
      } catch (e) {
        data = JSON.parse(localStorage.getItem(window.location.pathname));
        return data;
      }
    }
  },
  mounted: function() {
    if (this.tableConfig.box === "多选") {
      $(this.$el).mouseup(event => {
        this.isSlideSelection = false;
        this.slideSelectionList = [];
      });
    }
    this.$nextTick(() => {
      if (
        this.tableConfig.autoQuery === undefined ||
        this.tableConfig.autoQuery === true
      ) {
        this.getData();
      }
    });
  },
  methods: {
    // 判断对象中哪个值发生变化哪个
    whichKeyChange(val1, val2) {
      const keys1 = Object.keys(val1);
      const keys2 = Object.keys(val2);

      const def1 = _.difference(keys1, keys2);
      const def2 = _.difference(keys2, keys1);

      let keys = _.uniq(_.concat(keys1, ...keys2));
      let def = _.uniq(_.concat(def1, ...def2));
      keys = _.difference(keys, def);
      keys.forEach(key => {
        if (!_.isEqual(val1[key], val2[key])) {
          def.push(key);
        }
      });
      //console.log(def);
      return def;
    },
    tableRowClassName(row, index) {
      if (this.tableRowClassFun) {
        return this.tableRowClassFun(row);
      } else {
        return "";
      }
    },
    expand(row, expanded) {
      this.$emit("expand", row, expanded);
    },
    headerDragend(newWidth, oldWidth, column) {
      let path = "";
      try {
        path = this.$router.history.current.path;
      } catch (e) {
        path = window.location.pathname;
      }
      saveColumnWidth(path, column.label, newWidth); //把改变的宽度放入localstore内
    },
    columnWidth(name) {
      let width = "";
      try {
        width = this.tableMeta.table.column[name].width;
      } catch (e) {}
      return width;
    },
    handleSelectionChange(val) {
      if (this.tableConfig.box === "单选" && val.length > 1) {
        //单选并且点击已经选择后的点击
        this.$refs.commonTable.toggleRowSelection(val[0], false); //toggle..方法切换选中状态,第二个参数为false表示不选中即把第一个选择的取消选中
      } else {
        this.selection = JSON.parse(JSON.stringify(val));
        this.$emit("select", this.selection);
      }
    },
    // 当单元格被双击时，复制其信息
    cellDblclick(row, column, cell, event) {
      if (cell.innerText) {
        const input = this.$refs.copyValueRef;
        input.value = cell.innerText.trim(); // 修改文本框的内容
        input.select(); // 选中文本
        document.execCommand("copy"); // 执行浏览器复制命令
        this.$message({
          message: `${column.label}:${cell.innerText} 复制成功`,
          type: "success"
        });
      }
    },
    cellMouseEnter(row, column, cell, event) {
      event.preventDefault();
      this.$emit("cell-mouse-enter", row, column, cell, event);
      this.hoverCell = { row, column, cell, event };
      if (
        this.tableConfig.box === "多选" &&
        event.buttons === 1 &&
        column.type === "selection" &&
        this.isSlideSelection &&
        this.isDrag === false
      ) {
        const index = _.findIndex(this.slideSelectionList, row);
        if (index === -1) {
          this.slideSelectionList.push(row);
          this.$refs.commonTable.toggleRowSelection(row);
        } else {
          if (index == this.slideSelectionList.length - 2) {
            // 判断往回滑动的情况下
            this.$refs.commonTable.toggleRowSelection(
              this.slideSelectionList[index + 1]
            );
            this.slideSelectionList.splice(index + 1, 1);
          } else {
            this.slideSelectionList.splice(index, 1);
            this.$refs.commonTable.toggleRowSelection(row);
          }
        }
      }
    },
    cellMouseLeave(row, column, cell, event) {
      this.hoverCell = {};
      event.preventDefault();
      if (
        this.tableConfig.box === "多选" &&
        event.buttons === 1 &&
        column.type === "selection" &&
        !this.isSlideSelection &&
        this.isDrag === false
      ) {
        this.$refs.commonTable.toggleRowSelection(row);
        this.slideSelectionList.push(row);
        this.isSlideSelection = true;
      }
    },
    rowClick(row, event, column) {
      this.$emit("row-click", row, event, column);
    },
    tableMousedown(event) {
      if (this.draggable) {
        //判断是否点击在表格区域
        if (this.hoverCell.column && this.hoverCell.column.type === "default") {
          event.preventDefault();
          const isHasSelcet = this.selection.length;
          this.dragData = isHasSelcet ? this.selection : [this.hoverCell.row];
          this.clientX = event.clientX;
          this.clientY = event.clientY;
          this.isDrag = true;
          if (isHasSelcet) {
            const table = this.$refs.commonTable.$el;
            $(table)
              .find("tr.el-table__row")
              .map((index, item) => {
                if (
                  $(item)
                    .children("td")
                    .first()
                    .find("span.is-checked").length
                ) {
                  $(item).css({ opacity: "0.5" });
                }
              });
          } else {
            $(event.target)
              .parents("tr.el-table__row")
              .css({ opacity: "0.5" });
          }
          this.$emit("drag", this.dragData);
        }
      }
    },
    handleSizeChange(val) {
      //分页每页显示条目改变事件
      this.pageSize = val;
      const allPage = Math.ceil(this.total / this.pageSize);
      if (this.page > allPage) {
        //当前页>所有页即最大页
        this.page = allPage;
      }
      this.getData(false);
    },
    handleCurrentChange(val) {
      //当前页数改变事件
      this.page = val;
      this.getData(false);
    },
    sortChange(column) {
      //排序改变事件
      if (!this.oldSort) {
        this.oldSort = this.tableConfig.sort;
      }
      if (column.prop) {
        this.tableConfig.sort = `${column.prop} ${
          column.order === "ascending" ? "asc" : "desc"
        }`;
      } else {
        this.tableConfig.sort = this.oldSort;
      }
      this.getData();
    },
    // isClearSelection 是否清除选中项
    getData(isClearSelection = false) {
      // 这里必须用setTimeout来放置到下一流程，来保证数据必能获得更新
      setTimeout(() => {
        if (!this.data) {
          if (this.tableConfig.api) {
            this.postAjax(isClearSelection);
          }
        } else {
          let data = this.data;
          if (this.tableConfig.sort) {
            const sort = this.tableConfig.sort.split(" ");
            data = _.orderBy(this.data, sort[0], sort[1]);
          }
          this.total = data.length;
          if (this.isPagination) {
            this.tableData = data.slice(
              this.pageSize * (this.page - 1),
              this.pageSize * this.page
            );
          } else {
            this.tableData = data;
          }
        }
      }, 0);
    },
    postAjax(isClearSelection) {
      this.loading = true;
      const self = this;
      let columnStr = "";
      this.tableConfig.column.forEach(item => {
        columnStr = columnStr + item.prop + ",";
      });
      const api = this.tableConfig.api.toLowerCase();
      let params = {
        TableName: this.tableConfig.tableName,
        QueryFields: this.tableConfig.QueryFields,
        Index: this.page,
        Size: this.pageSize,
        Sort: this.tableConfig.sort || ""
      };
      //console.log(params)
      const queryList = [];
      if (
        !(
          this.tableConfig.MultiCondition &&
          this.tableConfig.MultiCondition.length > 0
        ) //不存在tableConfig.MultiCondition
      ) {
        //下面是组装 Multicondition
        params.MultiCondition = [];
        for (const item in this.tableConfig.query) {
          const con = {
            field: item,
            operation: this.tableConfig.queryOperation[item]
          };
          //介于是以“|”分隔的两个值
          if (con.operation === "日期介于") {
            con.value = this.tableConfig.query[item].split("|")[0];
            con.value2 = this.tableConfig.query[item].split("|")[1];
          } else {
            con.value = this.tableConfig.query[item];
          }
          // console.log(this.tableConfig.query[item]);
          if ("" + this.tableConfig.query[item]) {
            params.MultiCondition.push(con);
          }
          queryList.push(item);
        }
      } else {
        params.MultiCondition = this.tableConfig.MultiCondition; //存在直接放入params
      }

      for (const item in this.queryCopy) {
        if (!queryList.includes(item)) {
          //querycopy内的值没有包含在queryList中
          const con = {
            field: item,
            value: this.queryCopy[item],
            operation: this.queryOperationCopy[item]
          };
          params.MultiCondition.push(con);
        }
      }
      this.$http.post(api, params).then(function(response) {
        if (!response.data.Data) {
          response.data.Data = {
            Count: 0,
            Content: []
          };
        }
        if (self.tableConfig.fun) {
          response.data = self.tableConfig.fun.call(
            self.$parent,
            response.data
          );
        }
        const allPage = Math.ceil(response.data.Data.Count / self.pageSize);
        if (self.page > allPage && response.data.Data.Count > 0) {
          //当前页大于总页
          self.page = allPage;
          self.getData();
        } else {
          let data = [];
          let content = response.data.Data.Content;
          content.forEach(item => {
            let row = item;
            for (let key in item) {
              if (
                (item[key] ||
                  typeof item[key] === "boolean" ||
                  item[key] === 0) &&
                typeof item[key] !== "object"
              ) {
                row[key] = item[key].toString().replace(/(^\s*)|(\s*$)/g, ""); //将获取的空值替换为""
              }
            }
            data.push(row);
          });
          self.tableData = data;
          self.total = response.data.Data.Count;
          self.$emit("getTableData", self.tableData);
          self.loading = false;

          //必须放置于下一个流程在执行
          setTimeout(() => {
            self.setClassNameCss();
          }, 0);

          if (isClearSelection) {
            setTimeout(() => {
              self.clearSelection();
            }, 0);
          }
        }
      });
    },
    clearSelection() {
      this.$refs.commonTable.clearSelection();
      this.$emit("select", []);
    },
    setClassNameCss() {
      return;
      let colorList = localStorage.getItem("guanniu_ordercolor");
      if (colorList == undefined || colorList == null) {
        this.$http(`Api/Query/GetOrderColorList`).then(res => {
          const data = res.data.Data;
          localStorage.setItem("guanniu_ordercolor", JSON.stringify(data));
        });
      }

      const orderColorList = JSON.parse(colorList);
      orderColorList.forEach(item => {
        var x = document.getElementsByClassName(item["类名"]);

        for (let i = 0; i < x.length; i++) {
          x[i].style.background = item["颜色"];
        }
      });
    }
  },

  updated: function() {
    if (this.tableConfig.box === "单选") {
      const self = this;
      this.$nextTick(function() {
        let cell = self.$refs.commonTable.$refs.headerWrapper.getElementsByClassName(
          "cell"
        )[0];
        if (cell.children[0]) {
          cell.removeChild(cell.children[0]);
          $(cell).html("选择");
        }
      });
    }
  }
};
</script>
<style lang="scss">
.basePageTable {
  margin: 10px 20px;
  .dragTable {
    position: fixed;
    opacity: 0.5;
    width: 50%;
    overflow: hidden;
    background-color: #ffffff;
    z-index: 999;
  }
  .el-table {
    font-size: 14px;

    .success-row {
      background: #e2f0e4;
    }

    .forzen-row {
      background: #80deea;
    }

    .el-table__row--striped {
      background: #f5f5f5;
    }
  }

  .el-table th {
    background-color: #5c708d;
  }
  .el-table .el-table__body-wrapper {
    overflow-y: hidden;
  }
  .el-table__footer-wrapper thead div,
  .el-table__header-wrapper thead div {
    background-color: #5c708d;
    color: #ffffff;
  }

  .el-table .cell {
    line-height: unset;
    padding: 7px;
  }

  .el-table .caret-wrapper {
    height: 20px;
  }

  .el-table .sort-caret.ascending {
    top: 4px;
  }

  .el-table .sort-caret.descending {
    bottom: 4px;
  }

  .el-table td,
  .el-table th {
    height: unset;
  }

  .el-table th > .cell {
    line-height: unset;
  }

  .el-date-editor--daterange.el-input {
    width: unset;
    text-indent: 0px;
  }

  .el-pagination {
    padding: 10px 20px;
  }

  .tab-box--content {
    border: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item .el-icon-close {
    padding: 2px;
    height: 16px;
    line-height: 14px;
    top: -2px;
    right: -2px;
    vertical-align: middle;
  }

  .el-table-column--selection .cell {
    text-align: center;
  }
}
@media screen and (max-width: 480px) {
  .basePageTable {
    margin: 0 !important;
    .el-table {
      width: calc(100% - 24px);
      margin: 8px 12px;
    }
    .el-pagination {
      padding: 0 !important;
      text-align: center;
      .el-pagination__sizes {
        margin: 8px 0;
        .el-input {
          background-color: #ffffff;
          margin: 0 10px 0 0;
          .el-input__inner {
            border: none;
          }
        }
      }
      .el-pagination__jump {
        display: none;
      }
      .el-pager {
        li {
          margin: 8px 0;
          padding: 0;
          min-width: 28px;
          font-size: 14px;
          height: 28px;
          line-height: 28px;
          background: none;
          display: none;
        }
        li.active {
          background-color: #ffffff;
          border-radius: 18px;
          display: inline-block;
        }
      }
      .el-pagination__total {
        line-height: 44px;
        height: 44px;
      }
      button {
        width: 44px;
        height: 44px;
        background: none;
        padding: 0;
        .el-icon {
          font-size: 22px;
        }
      }
      button.btn-prev {
        float: left;
      }
      button.btn-next {
        float: right;
      }
    }
  }
}
</style>
