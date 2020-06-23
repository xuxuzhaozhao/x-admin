<template>
  <div class="layout">
    <!-- <top-progress ref="progress"></top-progress> -->
    <div
      class="sidebar-container"
      v-if="device === 'desktop'"
      @mouseover="mouseover"
      @mouseout="mouseout"
      :style="{ width: isCollapse ? '64px' : '200px' }"
    >
      <div class="top-logo">
        <div
          :class="isCollapse ? 'logo-small' : 'logo'"
          style="transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <img :src="logosrc" alt="logo" />
        </div>
      </div>
      <el-scrollbar
        :style="{ width: isCollapse ? '64px' : '200px' }"
        wrap-class="scrollbar-wrapper"
        tag="ul"
      >
        <el-menu
          :default-active="leftIndex"
          @select="leftSelect"
          unique-opened
          :class="{ layoutMenu: true, isCollapse: isCollapse }"
        >
          <template v-if="menuData[topIndex] && menuData[topIndex].children">
            <left-menu
              v-for="(model, index) in menuData[topIndex].children"
              :key="index"
              :model="model"
              :isCollapse="isCollapse"
            ></left-menu>
          </template>
        </el-menu>
      </el-scrollbar>
      <el-tooltip effect="dark" :content="isFixed ? '解锁菜单' : '锁定菜单'" placement="top">
        <div class="bars" @click="isFixed = !isFixed">
          <i :class="isFixed ? 'fa fa-lock' : 'fa fa-unlock'"></i>
        </div>
      </el-tooltip>
    </div>

    <transition name="el-fade-in-linear">
      <div v-if="device !== 'desktop' && allMenuVisable" class="allMenu-wrapper">
        <div
          class="sidebar-container"
          @mouseover="mouseover"
          @mouseout="mouseout"
          :style="{ width: allMenuWidth }"
        >
          <el-scrollbar :style="{ width: allMenuWidth }" wrap-class="scrollbar-wrapper" tag="ul">
            <el-menu
              :default-active="leftIndex"
              @select="
                index => {
                  leftSelect(index);
                  closeMenu();
                }
              "
              unique-opened
              class="layoutMenu"
            >
              <left-menu v-for="(model, index) in menuData" :key="index" :model="model"></left-menu>
            </el-menu>
          </el-scrollbar>
        </div>
        <div class="right" @click="closeMenu"></div>
      </div>
    </transition>

    <div
      class="main-container"
      :style="{
        marginLeft:
          device === 'desktop' ? (!isCollapse ? '200px' : '64px') : '0',
        zIndex: isFixed ? '' : isCollapse ? '' : '-1'
      }"
    >
      <div class="topbar">
        <i v-if="device !== 'desktop'" class="fa fa-bars menu-bars" @click="openMenu"></i>
        <el-menu
          v-if="device === 'desktop'"
          :default-active="topIndex"
          @select="topSelect"
          class="el-menu-top"
          mode="horizontal"
        >
          <template v-if="menuData.length <= 9">
            <el-menu-item v-for="(item, index) in menuData" :index="index + ''" :key="index">
              <img v-if="item.图标" :src="item.图标" style="width: 20px;height: 20px;" />
              {{ item.名称 }}
            </el-menu-item>
          </template>
          <template v-else>
            <el-menu-item
              v-for="(item, index) in menuData.slice(0, 9)"
              :index="index + ''"
              :key="index"
            >
              <img v-if="item.图标" :src="item.图标" style="width: 20px;height: 20px;" />
              {{ item.名称 }}
            </el-menu-item>
            <el-submenu class="el-menu-more" index="more">
              <template slot="title">更多</template>
              <el-menu-item
                v-for="(item, index) in menuData.slice(9)"
                :key="index"
                :index="index + 9 + ''"
              >
                <img v-if="item.图标" :src="item.图标" style="width: 20px;height: 20px;" />
                {{ item.名称 }}
              </el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
        <div class="right-menu-box">
          <div class="right-menu">
            <menuSearch class="right-menu-item" :device="device" :states="allPath"></menuSearch>
            <screenfull class="right-menu-item"></screenfull>
            <i
              class="fa fa-calculator calculatorImg right-menu-item"
              aria-hidden="true"
              @click="caculator"
            ></i>
            <menu-user class="right-menu-item" style="height:44px"></menu-user>
          </div>
          <!-- <span style="float: right;margin-right: 10px;margin-top: 10px;">
            <img src="@/assets/logo.png" style="height: 28px;float: left;" alt="logo" />
            <img
              src="@/assets/logo.png"
              style="height: 24px;margin-left: 5px;float: left;margin-top: 4px;"
              alt="logo"
            />
          </span> -->
        </div>
      </div>
      <el-scrollbar
        style="height: calc(100vh - 50px);border-left: 1px solid rgba(209, 209, 209, 0.5);"
        wrap-class="scrollbar-wrapper"
        tag="div"
      >
        <div>
          <tags-view v-if="device !== 'mobile'" @change="val => (cachedViews = val)"></tags-view>
          <!-- 在手机显示时，将tagsview隐藏 -->
          <section :class="{ 'app-main': true, [device]: true }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="cachedViews">
                <router-view />
              </keep-alive>
            </transition>
          </section>
          <div class="footer">
            © 2005 - {{ new Date().getFullYear() }} &nbsp;
            <a
              style="color:inherit"
              href="https://www.menerp.com"
              target="_blank"
            >微山软件 - 可靠且值得信赖的合作伙伴</a>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <el-dialog class="caculatorDialog" title="计算器" :visible.sync="caculatorDialog">
      <calculator />
    </el-dialog>
  </div>
</template>
<script>
import Calculator from "./src/Calculator";
import ResizeMixin from "./src/ResizeHandler";
// import TopProgress from "./src/topProgress.vue";
import leftMenu from "./src/menu.vue";
import Screenfull from "./src/Screenfull";
import MenuSearch from "./src/menuSearch";
import TagsView from "./src/TagsView";
import MenuUser from "./src/menuUser";
export default {
  mixins: [ResizeMixin],
  data() {
    return {
      caculatorDialog: false,
      allMenuWidth: "0px",
      allMenuVisable: false,
      cachedViews: [],
      isCollapse: true,
      isFixed: localStorage.getItem(`MenuFixed`) === "false" ? false : true,
      menuData: [],
      allPath: [],
      activeRouter: this.$route.fullPath,
      topIndex: "-1",
      leftIndex: "-1",
      isFirst: true,
      maxMenuDataLength: "6",
      logosrc: "@/assets/logo.png"
    };
  },
  components: {
    "left-menu": leftMenu,
    Screenfull,
    TagsView,
    MenuSearch,
    MenuUser,
    Calculator
  },
  created() {
    this.getMenu();
  },
  watch: {
    $route(to) {
      this.activeRouter = to.path;
      if (this.isFirst) this.findNode();
      this.isFirst = true;
    },
    isFixed: {
      handler: function(val) {
        if (val) this.isCollapse = false;
        localStorage.setItem(`MenuFixed`, val.toString());
      },
      immediate: true
    },
    topIndex(index) {
      if (this.menuData[index] && this.menuData[index].children) {
        if (this.isFixed) this.isCollapse = false;
      } else {
        this.isCollapse = true;
      }
    }
  },
  methods: {
    caculator() {
      this.caculatorDialog = true;
    },
    getMenu() {
      this.$http("/api/GetAuthorizedMenu").then(res => {
        // console.log(res);
        if (res.data.Result === 403) {
          this.$router.push("/login");
        }
        const allData = res.data.map(it => {
          return {
            名称: it.模块名称,
            图标: it.图标路径,
            层级: it.层级,
            布局: it.菜单显示 ? "layoutMenu" : "",
            路径: it.请求url
          };
        });
        let data = [];
        allData.forEach(item => {
          item.层级 = item.层级
            .split(",")
            .map(it => {
              return _.padStart(it, 4, "0");
            })
            .join("");
          if (item.路径 && item.布局) {
            item.路径 = "/" + item.布局 + item.路径;
          }

          // 使存在路径 但布局不为layoutMenu项不显示在菜单中
          if (!(item.路径 && item.布局 === "")) {
            data.push(item);
          }
        });
        data = this.menuGroup(_.sortBy(data, "层级"));

        const allPath = [];
        data.forEach((item, index) => {
          this.node(item, [index], allPath);
        });
        this.allPath = allPath;
        this.menuData = data;
        if (this.activeRouter === "/layoutMenu")
          this.$router.push(this.allPath[0].路径);
        this.$nextTick(() => {
          this.findNode();
        });
      });
    },
    menuGroup(data) {
      //将导航栏分组（一级二级n级...）
      const routes = JSON.parse(JSON.stringify(data));
      let i = routes.length - 1;
      let tempArray = [];
      for (i; i > 0; i--) {
        if (routes[i]["层级"].length === routes[i - 1]["层级"].length) {
          //如果前后元素长度相同则合并
          tempArray.unshift(routes[i]); //添加进临时数组
        } else if (routes[i]["层级"].length > routes[i - 1]["层级"].length) {
          //如果前面元素长度大于后面元素
          tempArray.unshift(routes[i]); //当前元素添加到临时数组
          // if (routes[i - 1].children) {
          //   //后面元素是否有子节点
          //   routes[i - 1].children = routes[i - 1].children.concat(tempArray); //用concat不用直接赋值是为了防止覆盖
          // } else {
          //   routes[i - 1].children = tempArray; //把子节点直接放入children内
          // }
          this.concatData(routes[i - 1], tempArray);
          routes.splice(i, tempArray.length); //截取前面合并的并且成功放入父节点的元素（作用：1.减少每次循环的条目，2.排除掉已经放到子节点的元素3.根据是否截取判断是否为根节点
          tempArray = [];
        } else if (routes[i]["层级"].length < routes[i - 1]["层级"].length) {
          //没有找到子模块，下一个为同级的子模块如（001003,001002---->>001001002,001001001,000001)
          tempArray = []; //清空临时数组
        }
      }
      if (JSON.stringify(routes) !== JSON.stringify(data)) {
        //判断当前数据是否还有子节点
        return this.menuGroup(routes); //迭代这个函数
      } else {
        return routes; //返回处理好的数据
      }
    },
    concatData(node, data) {
      if (node == undefined) {
        console.log(node, data);
        return;
      }
      if (node.children) {
        const length1 = node.children[0]["层级"].length;
        const length2 = data[0]["层级"].length;
        if (length1 < length2) {
          const index = _.findIndex(node.children, [
            "层级",
            data[0]["层级"].slice(0, length1)
          ]);

          this.concatData(node.children[index], data);
        } else {
          node.children = node.children.concat(data);
        }
      } else {
        node.children = data;
      }
    },
    node(data, indexList, allPath) {
      data.层级 = indexList.join("-");
      if (data.路径)
        allPath.push({ 层级: data.层级, 路径: data.路径, 名称: data.名称 });
      if (data.children && data.children.length) {
        data.children.forEach((child, index) => {
          this.node(child, [...indexList, index], allPath);
        });
      }
    },
    findNode() {
      const i = _.findIndex(this.allPath, { 路径: this.activeRouter });
      const node = this.allPath[i];
      if (node) {
        this.topIndex = node.层级.split("-")[0];
        this.$nextTick(() => {
          this.leftIndex = node.层级;
          this.changeSelectColor();
        });
      } else {
        this.leftIndex = "-1";
      }
      return i;
    },
    topSelect(index) {
      this.startProgress();
      this.topIndex = index;
      const node = _.find(this.allPath, function(node) {
        return node.层级[0] === index;
      });
      if (node) {
        this.isFirst = false;
        this.$router.push(node.路径);
        this.$nextTick(() => {
          this.leftIndex = node.层级;
          this.changeSelectColor();
        });
      }
    },
    leftSelect(index) {
      this.startProgress();
      const node = _.find(this.allPath, { 层级: index });
      if (node) {
        this.isFirst = false;
        this.$router.push(node.路径);
        this.$nextTick(() => {
          this.leftIndex = node.层级;
        });
      }
      this.changeSelectColor();
    },
    changeSelectColor() {
      this.$nextTick(() => {
        $(".layoutMenu .el-submenu .el-menu-item").css(
          "backgroundColor",
          "#f5f5f5"
        );
        $(".layoutMenu .el-submenu.is-opened .el-menu-item.is-active")
          .parent()
          .children(".el-menu-item")
          .css("backgroundColor", "#eee");
      });
    },
    mouseover() {
      if (this.isFixed === false) this.isCollapse = false;
    },
    mouseout() {
      if (this.isFixed === false) this.isCollapse = true;
    },
    openMenu() {
      this.allMenuVisable = true;
      setTimeout(() => {
        this.allMenuWidth = "200px";
      }, 5);
    },
    closeMenu() {
      this.allMenuWidth = "0px";
      setTimeout(() => {
        this.allMenuVisable = false;
      }, 5);
    },
    startProgress() {
      //this.$refs.progress.start();
    }
  }
};
</script>
<style lang="scss">
$backcolor: #eee;
$backcolor1: #f5f5f5;
$activecolor: #4285f4;
$top-activecolor: #ffffff;
$transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

.qq-help {
  cursor: pointer;
  position: absolute;
  right: 0px;
  bottom: 45%;
  background: #5c708d;
  width: 20px;
  height: 100px;
  color: white;
  text-align: center;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  z-index: 999;
}

$top-background: linear-gradient(
  180deg,
  #41546f,
  #41546f 0,
  #3b4c65 100%,
  #3b4c65 0
);

.layout {
  .calculatorImg {
    color: #b0bed2;
    font-size: 17px;
  }
  .calculatorImg:hover {
    cursor: pointer;
    color: #f5f5f5 !important;
  }
  a {
    text-decoration: none;
  }
  .sidebar-container {
    transition: $transition;
    width: 200px;
    height: 100%;
    position: fixed;
    font-size: 0;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 200;
    overflow: hidden;
    background-color: $backcolor1;
    .top-logo {
      height: 50px;
      // background: $top-background;
      background-color: #f5f5f5;
      border-right: 1px solid hsla(0, 0%, 100%, 0.05);
    }
    .el-scrollbar {
      transition: $transition;
      height: calc(100vh - 80px);
      position: fixed;
      font-size: 0;
      top: 50px;
      bottom: 0;
      left: 0;
      overflow: hidden;
    }
  }
  .scrollbar-wrapper {
    height: 100%;
    overflow-x: hidden !important;
    .el-scrollbar__view {
      padding: 0;
    }
  }
  .allMenu-wrapper {
    position: fixed;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 2500;
    .right {
      background: #000;
      opacity: 0.3;
      height: 100%;
      width: 100%;
    }
    .sidebar-container .el-scrollbar {
      top: 0px;
      height: 100vh;
    }
  }
  .el-scrollbar__bar {
    right: 0;
  }
  .topbar {
    margin: 0;
    padding: 0;
    line-height: 50px;
    // height: 50px;
    z-index: 100;
    background: $top-background;
    position: relative;
    padding-right: 270px;
    .menu-bars {
      line-height: 50px;
      height: 50px;
      font-size: 19px;
      cursor: pointer;
      min-width: 45px;
      text-align: center;
      color: #b0bed2;
      margin-left: 5px;
      transition: all 0.38s ease-out;
      &:hover {
        color: #ffffff;
      }
    }
  }
  .footer {
    text-align: center;
    color: rgba(0, 0, 0, 0.87);
    height: 30px;
    line-height: 30px;
    z-index: 1000;
  }
  .logo {
    overflow: hidden;
    padding-top: 5px;
    padding-left: 55px;
    img {
      height: 36px;
      margin-top: 0px;
    }
  }
  .logo-small {
    height: 45px;
    width: 45px;
    padding-top: 5px;
    padding-left: 20px;
    overflow: hidden;
    img {
      height: 36px;
    }
  }
  .bars {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 32px;
    background-color: $backcolor1 !important;
    opacity: 0.5;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
    i {
      color: #696969;
      display: block;
      line-height: 32px;
      margin: 0 auto;
      font-size: 20px;
      width: 15px;
    }
  }
  .main-container {
    min-height: 100%;
    transition: margin-left $transition;
    margin-left: 200px;
    position: relative;
    background-color: $backcolor;
    .el-menu-top {
      background-color: inherit;
      float: left;
      border: 0;
    }
    .right-menu-box {
      float: right;
      position: absolute;
      top: 0;
      right: 0;
    }
    .right-menu {
      float: right;
      height: 100%;
      border-left: 1px solid hsla(0, 0%, 100%, 0.05);
      .right-menu-item {
        float: left;
        line-height: 50px;
        height: 50px;
        font-size: 19px;
        cursor: pointer;
        min-width: 45px;
        text-align: center;
        color: #b0bed2;
        transition: all 0.38s ease-out;
        &:hover {
          color: #ffffff;
        }
      }
    }
  }
  .app-main {
    padding: 0 10px;
    min-height: calc(100vh - 110px);
    position: relative;
    overflow: hidden;
    > :first-child {
      background: #ffffff;
      border-bottom-right-radius: 5px;
      border-bottom-left-radius: 5px;
      margin-top: 0px;
    }
    &:not(.desktop) {
      padding: 0;
      min-height: calc(100vh - 50px);
    }
  }
  .caculatorDialog {
    .el-dialog__body {
      padding: 0px 20px 30px !important;
    }
  }
  .layoutMenu {
    border: none;
    .el-submenu {
      background-color: $backcolor1;
    }
    .el-menu-item div {
      outline: 0 !important;
    }
    .el-menu {
      background-color: $backcolor1;
    }
    .el-menu-item {
      background-color: $backcolor1;
      &.is-active {
        background-color: $backcolor;
      }
    }
    & > .el-menu-item,
    & > .el-submenu .el-submenu__title {
      height: 38px;
      line-height: 38px;
      font-size: 13px;
      color: #696969;
    }
    .el-submenu .el-menu-item {
      height: 38px;
      line-height: 38px;
      font-size: 12px;
      color: #696969;
    }
    .el-menu-item:focus,
    .el-menu-item:hover {
      outline: 0;
      background-color: #e7e7e7 !important;
    }
    .el-submenu .el-menu-item:hover,
    .el-submenu__title:hover {
      background-color: #e7e7e7 !important;
    }
  }
  .el-menu--horizontal > .el-menu-item {
    height: 50px;
    line-height: 50px;
  }
  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 2px solid #4285f4;
    color: #303133;
  }
  .el-menu-more {
    & > .el-submenu__title {
      height: 50px;
      line-height: 50px;
      border-bottom-width: 2px !important;
    }
    .el-menu {
      top: 50px;
      .el-menu-item {
        border: 0 !important;
        min-width: 85px;
      }
    }
  }
  .topbar {
    .el-menu-item:focus,
    .el-menu-item:hover,
    .el-submenu__title:hover {
      outline: 0;
      background-color: #ecf5ff;
      background-color: hsla(0, 0%, 100%, 0);
      color: #ffffff;
    }
    .el-submenu .el-menu-item:hover {
      background-color: #ecf5ff;
    }
    &:after {
      clear: both;
      content: ".";
      display: block;
      width: 0;
      height: 0;
      visibility: hidden;
    }
  }
  // 取消菜单的下边栏
  // .topbar .el-menu-item {
  // border-bottom: 2px solid transparent;
  // &:hover,
  // &:focus {
  // border-bottom: 2px solid #409eff;
  // }
  // }
  .topbar .el-menu-item,
  .topbar .el-menu-more .el-submenu__title {
    border-bottom: 0 !important;
    color: #b0bed2;
  }
  .el-menu-more .el-menu > .el-menu-item {
    color: #48576a;
  }
}
.topbar {
  .el-menu-item,
  .el-submenu__title {
    padding: 0 12px;
    transition: all 0.38s ease-out;
  }
  // .el-submenu.is-active > .el-submenu__title {
  //   color: $top-activecolor !important ;
  //   background-color: rgba(0,0,0,.1);
  //   font-weight: 500;
  //   [class^="el-icon-"] {
  //     color: inherit;
  //   }
  // }
  // .el-submenu .el-menu-item.is-active,
  .el-menu-item.is-active {
    color: $top-activecolor !important;
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: 400;
  }
}
.el-submenu.is-active > .el-submenu__title {
  color: $activecolor !important ;
  font-weight: 500;
  [class^="el-icon-"] {
    color: inherit;
  }
}
// .el-menu-item.is-active,
.el-submenu .el-menu-item.is-active {
  color: $activecolor !important;
  font-weight: 400;
}
@media screen and (max-width: 769px) {
  .allMenu-wrapper {
    .sidebar-container {
      width: 50% !important;
      .el-scrollbar {
        width: 50% !important;
        .layoutMenu {
          .el-submenu {
            .el-submenu__title,
            .el-submenu__title span {
              height: 44px;
              line-height: 44px;
              color: #333333;
              font-size: 15px;
            }
            .el-submenu__title .el-submenu__icon-arrow {
              font-size: 15px;
            }
            .el-menu-item,
            .el-menu-item * {
              height: 44px;
              line-height: 44px;
              color: #333333;
              font-size: 15px;
            }
          }
        }
      }
    }
    .right {
      opacity: 0.6;
    }
  }
}
@media screen and (max-width: 481px) {
  .allMenu-wrapper {
    .sidebar-container {
      width: 75% !important;
      .el-scrollbar {
        width: 75% !important;
      }
    }
  }
}
</style>
