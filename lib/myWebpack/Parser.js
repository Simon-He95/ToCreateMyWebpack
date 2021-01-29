const fs = require('fs')
const path = require('path')
const babelParser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')


const parser = {
    // 获取抽象语法树代码：将文件解析成ast语法树
    getAst(filePath) {
        // 读取文件
        const file = fs.readFileSync(filePath, 'utf-8')
        // 2. 将其解析成ast抽象语法树，抽象语法树就是为了收集依赖，判读类型type：“importDeclartion”，如果是就去找他的source，用对象的形式来储存信息
        const ast = babelParser.parse(file, {
            sourceType: 'module' // 解析文件的模块化方案是 ES Module，默认是commonjs
        })
        return ast
    },
    // 获取ast中所有的依赖
    getDeps(ast, filePath) {
        // 获取入口文件夹路径
        const dirname = path.dirname(filePath)

        // 定义一个存储依赖的容器
        const deps = {}
        // 收集依赖
        traverse(ast, {
            // 内部会遍历ast中program.body，判断里面语句类型
            // 如果 type：ImportDeclartion 就会触发当前函数，可以在收到的参数的node下的source拿到相对路径
            ImportDeclaration({ node }) {
                // 文件相对路径：'./add.js'
                const relativePath = node.source.value
                // 基于入口文件，生产文件的绝对路径
                const absolutePath = path.resolve(dirname, relativePath)
                // 添加依赖
                /* 
                {
                    './add.js': 'D:\\local_project\\createWebpack\\src\\add.js',
                    './count.js': 'D:\\local_project\\createWebpack\\src\\count.js'
                }
                */
                deps[relativePath] = absolutePath
            }
        })
        return deps
    },
    // 将ast解析成code
    getCode(ast) {
        // 编译代码：将代码中浏览器不能识别的语法进行编译，将抽象语法树代码中的es6转为commonjs
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })
        return code
    }
}

module.exports = parser