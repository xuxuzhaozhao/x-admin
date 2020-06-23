module.exports = {
    assetsDir: 'static',
    devServer: {
        proxy: 'http://localhost:7700'
    },
    pages:{
        index: {
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html',
            title:'微山软件'
          }
    }
}