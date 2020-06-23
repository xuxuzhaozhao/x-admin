<template>
  <div>
    <el-dropdown class="right-menu-item">
      <!-- <i
        class="fa fa-user"
        aria-hidden="true"
        style="width: 50px;
    display: block;
    height: 50px;
    padding-top: 15px;"
      ></i>-->

      <img v-if="header!=null" :src="header" class="header" />
      <i
        v-else
        class="fa fa-user"
        aria-hidden="true"
        style="width: 50px;
    display: block;
    height: 50px;
    padding-top: 15px;"
      ></i>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>{{"账号："+getCookie("UserName")}}</el-dropdown-item>
        <el-dropdown-item divided>{{"所属企业："+enterpriseInfo['企业全称']}}</el-dropdown-item>
        <el-dropdown-item divided>{{"当前角色："+userInfo[0]}}</el-dropdown-item>
        <el-dropdown-item divided @click.native="modifiedPwd">修改密码</el-dropdown-item>
        <el-dropdown-item divided @click.native="out">退出</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog title="修改密码" :visible.sync="modifiedPwdDialog" :modal="false">
      <el-input class="mpwdinput" type="password" v-model="modifiedPwdP.oldPwd">
        <template slot="prepend">请输入旧密码&nbsp;&nbsp;&nbsp;</template>
      </el-input>
      <el-input class="mpwdinput" type="password" v-model="modifiedPwdP.newPwd">
        <template slot="prepend">请输入新密码&nbsp;&nbsp;&nbsp;</template>
      </el-input>
      <el-input class="mpwdinput" type="password" v-model="modifiedPwdP.reNewPwd">
        <template slot="prepend">再次输入新密码</template>
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifiedPwdDialog = false">取 消</el-button>
        <el-button type="primary" @click="executeModifiedPwd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { removeUserMeta } from "@/plugins/auth.js";
export default {
  data() {
    return {
      modifiedPwdP: {},
      modifiedPwdDialog: false,
      enterpriseInfo: {},
      userInfo: {}
    };
  },
  computed: {
    header() {
      return "https://standard.mingmenhui.com/upload/header/4dc631d9d53547d99174b7cd95d6992a..png";
      //return this.$store.state.user.qiye.头像;
    }
  },
  created() {
    //this.getUserInfo();
  },
  methods: {
    getCookie(name) {
      var arr,
        reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

      if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
      else return null;
    },
    getUserInfo() {
      this.$http(`Api/YiCheng/User/GetCurrentUser`).then(res => {
        const data = res.data.Data;
        this.enterpriseInfo = data.enterpriseInfo;
        this.userInfo = data.userInfo;
      });
    },
    modifiedPwd() {
      this.modifiedPwdP = {};
      this.modifiedPwdDialog = true;
    },
    executeModifiedPwd() {
      if (this.modifiedPwdP.oldPwd == "" || this.modifiedPwdP.oldPwd == null) {
        this.$message({
          type: "error",
          message: "请输入旧密码！"
        });
        return;
      }
      if (this.modifiedPwdP.newPwd == "" || this.modifiedPwdP.newPwd == null) {
        this.$message({
          type: "error",
          message: "新密码不可为空！"
        });
        return;
      }
      if (this.modifiedPwdP.reNewPwd != this.modifiedPwdP.newPwd) {
        this.$message({
          type: "error",
          message: "两次输入的密码不一致！"
        });
        return;
      }
      let username = this.$store.state.user.UserName;
      this.modifiedPwdP.UserName = username;
      this.$http
        .post(`/api/yicheng/user/modifiedPwd`, this.modifiedPwdP)
        .then(res => {
          this.$message({
            type: "success",
            message: "密码修改成功"
          });
          this.modifiedPwdP = {};
          this.modifiedPwdDialog = false;
        });
    },
    out() {
      removeUserMeta();
      this.$http.get("/api/signout");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.header {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-top: 7px;
}
</style>
