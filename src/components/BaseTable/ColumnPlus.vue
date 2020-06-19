<script>
import { TableColumn } from "element-ui";
// renderCell 函数，类型可扩展
const renderCell = {
  slots: function(h, data) {
    // 接受传入的renderCell函数
    let renderCell = () => {
      return this.renderCell ? this.renderCell(data, h) : "";
    };
    const vnode = renderCell(h, data);
    return <div class="cell">{vnode}</div>;
  },
  index: function(h, data) {
    return (
      <div class="cell" style="text-align: center;">
        {data.$index + 1}
      </div>
    );
  },
  input: function(h, data) {
    return (
      <div class="cell">
        <el-input
          value={data.row[this.prop]}
          on-input={value => (data.row[this.prop] = value)}
        />
      </div>
    );
  }
};
export default {
  extends: TableColumn, // 继承el-table-column
  props: {
    prop: {
      type: [String, Number]
    },
    cellType: {
      type: String,
      validator: function(value) {
        let valid = ["text", "input", "slots", "index"].includes(value);
        !valid && console.error(`columnPlus组件不适配 ${value} 类型`);
        return valid;
      }
    },
    renderCell: {
      type: Function
    },
    sortable: {
      type: Boolean,
      default: false
    }
  },
  // el-table-column 先调用在调用本身的
  created() {
    if (renderCell[this.cellType]) {
      this.columnConfig.renderCell = renderCell[this.cellType].bind(this);
    } else if (this.renderCell) {
      this.columnConfig.renderCell = (h, data) => {
        return this.renderCell(data);
      };
    }
  }
};
</script>
