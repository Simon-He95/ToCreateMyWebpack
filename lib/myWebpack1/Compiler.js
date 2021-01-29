
const { getAst, getDeps, getCode } = require('./Parser')

class Compiler {
    constructor(options = {}) {
        this.options = options
    }

    // 启动webpack打包
    run() {
        // 1. 读取入口文件内容
        const filePath = this.options.entry
        // 获取抽象语法树代码：将文件解析成ast语法树
        const ast = getAst(filePath)
        // 获取ast中所有的依赖
        const deps = getDeps(ast, filePath)
        // 将ast解析成code
        const code = getCode(ast)

        console.log(ast,deps,code)
    }
}

module.exports = Compiler