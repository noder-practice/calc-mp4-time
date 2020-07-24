# L0-R1-T000104

项目编号:
  L0-R1-T000104
项目名称:
  视频统计工具
项目说明:
  视频数量与时长统计小工具
项目技术栈说明:
  Node.js「学习 Node 模块机制」
    

## 模块加载机制
Node.js 会从当前目录下，一直向上递归寻找 `node_modules` 下的对应的包

比如我们在 /cjfff/project/zzl/L0-R1-T000104 下获取 race 包。

module 下的 paths 会一直往上递归

```js
paths = [
  "/cjfff/project/zzl/L0-R1-T000104/node_modules",
  "/cjfff/project/zzl/node_modules",
  "/cjfff/project/node_modules",
  "/cjfff/node_modules",
  "/node_modules",
]
```

我们可以打印 module 对象得到它们相关的依赖信息.


我们运行的每个文件，其实就是一个闭包

会被 `require("module").wrapper` 包裹然后运行

`wrapper` 函数长下面这样子

```js
  [
    '(function (exports, require, module, __filename, __dirname) { ',
    '\n});'
  ],
```

相关的变量其实都是这个闭包执行的时候传进来的一些参数。


