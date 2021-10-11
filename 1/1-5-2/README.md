### 调试环境搭建：

- 安装依赖： `npm i`
- 安装rollup：`npm i -g rollup`
- 修改dev脚本，添加sourcemap，package.json

```js
    "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",
```

- 运行开发命令：`npm run dev`
- 引入前面创建的vue.js，samples/commits/index.html

```html
<script src="../../dist/vue.js"></script>
```

> 术语解释：
>
> - runtime：仅包含运行时，不包含编译器
> - common：cjs规范，用于webpack1
> - esm：ES模块，用于webpack2+
> - umd：universal module definition，兼容cjs和amd，用于浏览器

**注意**：在配置环境时的路径不要有中文名称！！！

### 文件结构：

```bash
Vue
	.circleci
	.github
	benchmarks
	dist	发布目录
	examples	范例，里面有测试代码
	flow	试代码
	packages	核心代码之外的独立库
	scripts		构建脚本
	src		源码
	test
	types	ts类型声明，上面flow是针对flow的类型声明
	.babelrc.js
	.editorconfig
	.eslintignore
	.eslintrc.js
	.flowconfig
	.gitignore
	BACKERS.md
	LISCNSE
	package.json
	README.md
	yarn.lock
```

源码目录：

```bash
src
	compiler	编译器相关
	core	核心代码，要常来这里看看
		components 通用组件如：keep-alive
		global-api	全局API
		instance	构造函数等
		observer	响应式相关
		util
		vdom 	虚拟DOM相关
		config.js
		index.js
	platforms
		web
		weex
	server
	sfc
	shared
```



### 入口：

dev脚本中`-c scripts/config.js`指明配置文件所在

参数`TARGET:web-full-dev`指明输出文件配置项，line：123

```js
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
```

