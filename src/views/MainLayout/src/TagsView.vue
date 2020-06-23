<template>
  <div class="tags-view-container">
    <scroll-pane class="tags-view-wrapper" ref="scrollPane">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        ref="tag"
        :to="tag"
        @contextmenu.prevent.native="openMenu(tag,$event)"
        :class="isActive(tag)?'tags-view-item active':'tags-view-item'"
      >
        {{tag.meta.名称||tag.name||"未命名"}}
        <span
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        ></span>
      </router-link>
    </scroll-pane>
    <ul class="contextmenu" v-show="visible" :style="{left:left+'px',top:top+'px'}">
      <li @click="closeSelectedTag(selectedTag)">关闭标签页</li>
      <li :class="visitedViews.length===1?'disabled':''" @click="closeOthersTags">关闭其他标签页</li>
      <li :class="hasRight(selectedTag)" @click="closeRightTags">关闭右侧标签页</li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from "./ScrollPane";

export default {
  components: { ScrollPane },
  data() {
    const tag = this.getTag(this.$route);
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      visitedViews: tag ? [tag] : []
    };
  },
  watch: {
    $route(to) {
      const tag = this.getTag(to);
      if (!tag) return;
      const index = _.findIndex(this.visitedViews, { path: tag.path });
      if (index === -1) {
        this.visitedViews.push(tag);
      } else {
        this.$set(this.visitedViews, index, tag);
      }
    },
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
    visitedViews: {
      handler: function(val) {
        this.$emit(
          "change",
          val.map(item => {
            return item.name;
          })
        );
      },
      immediate: true
    }
  },
  methods: {
    getTag(route) {
      if (route.matched.length === 1) return null;
      const { name, path, params, query, meta } = route;
      return {
        name,
        path,
        params,
        query,
        meta
      };
    },
    isActive(route) {
      return route.path === this.$route.path;
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag;
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag.$el);
            break;
          }
        }
      });
    },
    closeSelectedTag(view) {
      const index = _.findIndex(this.visitedViews, { path: view.path });
      this.visitedViews.splice(index, 1);
      if (!this.isActive(view)) return;
      const latestView =
        this.visitedViews[index] ||
        this.visitedViews[index - 1] ||
        this.$route.matched[0].path;
      console.log(this.visitedViews, latestView);

      this.$router.push(latestView);
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag);
      this.moveToCurrentTag();
      this.visitedViews = [this.selectedTag];
    },
    closeRightTags() {
      const index = _.findIndex(this.visitedViews, {
        path: this.selectedTag.path
      });
      this.visitedViews.splice(index + 1);
    },
    openMenu(tag, e) {
      this.visible = true;
      this.selectedTag = tag;
      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      this.left = e.clientX - offsetLeft + 15; // 15: margin right
      this.top = e.clientY - 45;
    },
    hasRight(view) {
      const index = _.findIndex(this.visitedViews, { path: view.path });
      if (index + 1 === this.visitedViews.length) {
        return "disabled";
      }
      return "";
    },
    closeMenu() {
      this.visible = false;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tags-view-container {
  .tags-view-wrapper {
    height: 30px;
    .tags-view-item {
      border-radius: 5px 5px 0 0;
      margin-top: 6px;
      display: inline-block;
      position: relative;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      text-decoration: none;

      &:first-of-type {
        margin-left: 10px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: "";
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 100;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      &:not(.disabled):hover {
        background: #eee;
      }
    }
  }
}
</style>

<style rel="stylesheet/scss" lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    border: none !important;
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.8);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
