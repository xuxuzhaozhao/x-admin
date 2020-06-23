import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const layout = {
  Main: {
    path: '/Main',
    name: 'MainLayout',
    component: function () {
      return import(/* webpackChunkName: "about" */ '@/views/MainLayout/Index.vue')
    },
    children: []
  }
}

const routes = [
  { path: '/', redirect: '/Main/Home' },
  {
    name: '页面未找到',
    path: '*',
    component: function () {
      return import(/* webpackChunkName: "about" */ '@/views/MainLayout/Index.vue')
    }
  }
]

// 动态加载路由
// importPages(require.context('../views', true, /\Index.vue$/, 'lazy'))
// // 引入views文件夹下的所有Index.vue作为页面
// function importPages(r) {
//   r.keys().forEach(key => {
//     const path = (key.split('.'))[1];
//     routes.push({
//       path: path.substring(0, path.length - 6), // 不需要再路径中展示'/Index'
//       component: () => r(key)
//     })
//   })
// }

const router = new VueRouter({
  routes
})

const routersData = {}
const routesName = []
router.beforeEach((to, from, next) => {
  if (routersData[to.path]) {
    next()
    return
  }
  const { layoutName, routePath } = getPath(to.path)
  // 如果路由包含前往的页面，则直接next
  if (routesName.indexOf(`${layoutName}${routePath}`) > -1) {
    next()
    return
  }
  addRoute(to, {}, next, layoutName, routePath)
})

export default router

// 以此来判断是否加入layout
function getPath(toPath) {
  let layoutName = ''
  let routePath = toPath
  const paths = _.compact(toPath.split('/'))
  if (Object.keys(layout).includes(paths[0])) {
    layoutName = paths.shift()
    routePath = '/' + paths.join('/')
  }
  return {
    layoutName,
    routePath
  }
}

// 动态将对应的文件加入router中
function addRoute(to, response, next, layoutName, routePath) {
  const filePath = routePath
  import(`@/views${filePath}/Index.vue`).then(component => {
    routesName.push(`${layoutName}${routePath}`)
    toAdd(layoutName, filePath, component.default, routersData[to.path], routePath);
    next({
      path: to.path,
      query: to.query
    })
  }).catch(err => {
    console.error(err);
    next(false)
  })
}

function toAdd(layoutName, filePath, component, meta, routePath) {
  component.name = _.trim(routePath.replace(/\//g, '-'), '-')
  if (layoutName === '') {  //直接在浏览器打开
    router.addRoutes([{
      path: routePath,
      name: component.name,
      component: component,
      meta: meta
    }])
  } else { // 采用layout嵌套页面
    router.addRoutes([{
      path: `/${layoutName}`,
      component: layout[layoutName].component,
      children: [{
        path: _.trim(routePath, '/'),
        name: component.name,
        component: _.cloneDeep(component),
        meta: meta
      }]
    }])
  }
}