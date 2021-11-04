const buf1 = Buffer.alloc(10)
console.log('buf1===>', buf1);
// buf1===> <Buffer 00 00 00 00 00 00 00 00 00 00> 十个字节的位置

const buf2 = Buffer.from('a')
console.log('buf2===>', buf2);
// buf2===> <Buffer 61> a 阿斯克码的值是 61


const buf3 = Buffer.from('中文')
console.log('buf3===>', buf3);
// buf3===> <Buffer e4 b8 ad e6 96 87> 一个中文一般占两到三个字节


const buf4 = Buffer.concat([buf2, buf3])
console.log('buf4===>', buf4);