import Vue from 'vue'
import axios from 'axios'
import { MessageBox } from 'element-ui';

// 创建axios实例
axios.interceptors.request.use((config) => {
    config.url = encodeURI(config.url)
    return config
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
})

axios.interceptors.response.use(response => {
    //2019.05.17 直接返回数字403来判断是否授权，采用抛错的形式导致前端页面假死。
    try {
        if (response.data.Result === 403) {
            router.push("/login")
        }
    } catch (err) {
        console.log(err);
    }

    return response
}, error => {
    // 对响应错误做点什么
    if (error.response.status === 403) {
        //router.push("/login")
        if (location.hash.substr(1) == "/login" || location.hash.substr(1) == "/jump" || location.hash.substr(1) == "/MainLayout") return;
        MessageBox.confirm('登陆过期或无权限操作，是否尝试重新登陆?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(res => {
            let redirectUrl = "";
            try {
                redirectUrl = `?redirect=${location.hash.substr(1)}`;
            } catch (error) {
                redirectUrl = "";
            }
            router.push(`/login${redirectUrl}`)
        }).catch(err => {
            console.log(err);
        })
        return Promise.reject(error)
    }

    let msg = error.response.data.ExceptionMessage || error.response.data.Message || error.response.data;

    if (error.response.status === 404) msg = "请求：" + error.response.config.url + "未找到"

    Vue.prototype.$notify.info({
        title: '提示',
        message: msg,
        duration: 0
    })
    return Promise.reject(error)
})

export default axios