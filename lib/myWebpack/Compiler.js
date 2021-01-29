
const { getAst, getDeps, getCode } = require('./Parser')
const fs = require('fs')
const path = require('path')

class Compiler {
    constructor(options = {}) {
        // webpack 配置
        this.options = options
        // 所有依赖的容器
        this.modules = []
    }
    // 启动webpack打包
    run() {
        // 1. 读取入口文件内容
        const filePath = this.options.entry
        // 第一次构建，得到入口文件信息
        const fileInfo = this.build(filePath)
        this.modules.push(fileInfo)
        // 遍历所有依赖
        this.modules.forEach(fileInfo => {
            /* 
               {
                   './add.js': 'D:\\local_project\\createWebpack\\src\\add.js',
                   './count.js': 'D:\\local_project\\createWebpack\\src\\count.js'
               }
            */
            // 取出当前文件的所有依赖
            const deps = fileInfo.deps
            for (const relativePath in deps) {
                // 依赖文件的绝对路径
                const absolutePath = deps[relativePath]
                // 对内部文件依赖的文件再进行读取信息和处理
                const fileInfo = this.build(absolutePath)
                // 将处理后的结果添加的modules中，后面的遍历就会遍历到index下的所有依赖了
                this.modules.push(fileInfo)
            }
        })
        // 将modules数组，整合成更好的依赖关系对象
        /** 
         * {
         *    'index.js':{
         *          code: 'xxx',
         *          deps: { 'add.js': 'xxx'  }
         *     },
         *     'add.js':{
         *          code: 'xxx',
         *          deps: {}
         *      }
         * }
        */
        const depsGraph = this.modules.reduce((graph, module) => {
            return {
                ...graph,
                [module.filePath]: {
                    code: module.code,
                    deps: module.deps
                }
            }
        }, {})
        this.generate(depsGraph)
    }
    // 开始构建
    build(filePath) {
        // 获取抽象语法树代码：将文件解析成ast语法树
        const ast = getAst(filePath)
        // 获取ast中所有的依赖
        const deps = getDeps(ast, filePath)
        // 将ast解析成code
        const code = getCode(ast)
        return {
            // 文件路径
            filePath,
            // 当前文件所有依赖
            deps,
            // 当前文件解析后代码
            code
        }
    }
    // 生成输出资源
    generate(depsGraph) {
        const bundle = `
            (function(depsGraph) {
                // require目的：为了加载入口文件
                function require(module) {
                    // 定义要暴露的对象
                    var exports = {}
                    // 定义模块内部的require函数
                    function localRequire(relativePath) {
                        // 为了找到要引入模块的绝对路径，通过require加载
                        console.log(relativePath)
                        return require(depsGraph[module].deps[relativePath])
                    }
                    (function (require,exports,code){
                        eval(code)
                    })(localRequire, exports, depsGraph[module].code)

                    // 作为require函数的返回值暴露出去
                    // 后面的require函数能够得到暴露的内容
                    return exports
                }
                require('${this.options.entry}')

            })(${JSON.stringify(depsGraph)})
        `
        // 生成输出文件的绝对路径
        const filePath = path.resolve(this.options.output.path, this.options.output.filename)
        // 写入文件
        fs.writeFileSync(filePath, bundle, 'utf-8')
    }
}

module.exports = Compiler