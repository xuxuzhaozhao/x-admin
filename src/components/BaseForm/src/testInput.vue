<script>
export default {
  model: {
    prop: "value",
    event: "change"
  },
  props:{
    value:"",
    placeholder: {
      type: String,
      default: "请输入"
    }
  },
  render(h) {
    return (
      <el-input
        value={this.value}
        on-input={this.change}
        placeholder={this.placeholder}
      />
    );
  },
  methods:{
    change(val){
      this.$emit("change",val)
    }
  }
};
</script>
