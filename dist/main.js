
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
                require('./src/index.js')

            })({"./src/index.js":{"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\n\nvar _count = _interopRequireDefault(require(\"./count.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log((0, _add[\"default\"])(1, 2));\nconsole.log((0, _count[\"default\"])(3, 2));","deps":{"./add.js":"D:\\local_project\\createWebpack\\src\\add.js","./count.js":"D:\\local_project\\createWebpack\\src\\count.js"}},"D:\\local_project\\createWebpack\\src\\add.js":{"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = add;\n\nfunction add(x, y) {\n  var result = x + y;\n  console.log(x, y, result);\n  return result;\n}","deps":{}},"D:\\local_project\\createWebpack\\src\\count.js":{"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = count;\n\nfunction count(x, y) {\n  return x - y;\n}","deps":{}}})
        