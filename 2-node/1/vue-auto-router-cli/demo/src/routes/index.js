const router = require('koa-router')()

router.get('/', async (ctx, next) => {
    await ctx.render('index', {

        title: '前端开发者',
        isMe: true,
        blogList: [
            { id: 1, title: 'aaa' },
            { id: 2, title: 'bbb' },
            { id: 3, title: 'ccc' },
            { id: 4, title: 'ddd' }
        ]
    })
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    // const session = ctx.session
    // if (session.viewNum === null) {
    //   session.viewNum = 0
    // }
    // session.viewNum++

    ctx.body = {
        title: 'koa2 json'
    // viewNum: session.viewNum
    }
})

module.exports = router
