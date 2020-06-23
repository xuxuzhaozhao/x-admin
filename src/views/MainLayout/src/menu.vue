<template>
  <el-submenu :index="model.层级"
              v-if="haveChild">
    <template slot="title">
      <!-- <i v-if="model.图标"
        :class="model.图标"></i> -->
      <span slot="title"
            v-show="!isCollapse">
        <img v-if="model.图标"
             :src="model.图标"
             style="width: 20px;height: 20px;">
        {{model.名称}}
      </span>
    </template>
    <div v-show="!isCollapse">
      <common-menu v-for="model in model.children"
                   :key="model.层级"
                   :model="model">
      </common-menu>
    </div>
  </el-submenu>
  <el-menu-item v-else
                :key="model.层级"
                :index="model.层级">
    <!-- <i v-if="model.图标"
      :class="model.图标"></i> -->
    <span slot="title"
          v-show="!isCollapse">
      <img v-if="model.图标"
           :src="model.图标"
           style="width: 20px;height: 20px;">
      {{model.名称}}
    </span>
  </el-menu-item>
</template>
<script>
export default {
  props: {
    model: Object,
    isCollapse: Boolean
  },
  name: "common-menu", //通过命名实现递归组件
  data: function () {
    return {};
  },
  computed: {
    haveChild: function () {
      return this.model.children && this.model.children.length;
    }
  },
  methods: {}
};
</script>
<style>
.MainLayout .el-submenu__title i {
  vertical-align: middle;
  margin-right: 5px;
  width: 15px;
  text-align: center;
  font-size: 12px;
  transform: scale(0.8);
}

.MainLayout .el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(180deg) scale(0.8);
}

.MainLayout.isCollapse .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}
.MainLayout .el-submenu__icon-arrow {
  right: 10px;
}
</style>
