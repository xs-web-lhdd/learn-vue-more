const router = require('koa-router')()

router.prefix('/users')

router.get('/', function (ctx, next) {
    ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
    ctx.body = 'this is a users/bar response'
})


// 动态路由---由params得到动态参数
router.get('/:username', function (ctx, next) {
    const { username } = ctx.params
    ctx.body = {
        title: 'this is a user page',
        username
    }
})

// 加载更多
router.get('/:username/:pagesindex', function (ctx, next) {
    const { username, pagesindex } = ctx.params
    ctx.body = {
        title: '这是加载更多页面',
        username: '我是' + username ,
        pagesindex: '这是第' + pagesindex + '页'
    }
})

// 登录
router.post('/login', async (ctx, next) => {
    const { username, password } = ctx.request.body
    ctx.body = {
        username,
        password,
        message: '登录成功呦'
    }
})

module.exports = router
