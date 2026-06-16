// AI 工具预设列表
export const AI_TOOLS_PRESET = [
  { name: '豆包', url: 'https://www.doubao.com', icon: 'https://lf-cdn.doubao.com/obj/static/common/image/logo.b189b5f9.svg' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: 'https://chat.deepseek.com/favicon.ico' },
  { name: '文心一言', url: 'https://yiyan.baidu.com', icon: 'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico' },
  { name: '通义千问', url: 'https://www.qianwen.com', icon: 'https://img.alicdn.com/imgextra/i3/O1CN01dGJZbc1t6P8yGK4Ow_!!6000000005852-55-tps-87-78.svg' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', icon: 'https://statics.moonshot.cn/kimi-chat/favicon.ico' },
  { name: '智谱清言', url: 'https://chatglm.cn', icon: 'https://chatglm.cn/favicon.ico' },
  { name: '讯飞星火', url: 'https://xinghuo.xfyun.cn', icon: 'https://xinghuo.xfyun.cn/resource/img/favicon.ico' },
  { name: '腾讯元宝', url: 'https://yuanbao.tencent.com', icon: 'https://cdn-site.yuanbao.tencent.com/yuanbao-site/yuanbao-favicon.png' },
  { name: '天工AI', url: 'https://www.tiangong.cn', icon: 'https://www.tiangong.cn/favicon.ico' },
  { name: 'Claude', url: 'https://claude.ai', icon: 'https://claude.ai/favicon.ico' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://chat.openai.com/favicon.ico' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg' }
];

// 预设的常用网站列表 - 中国国内常用网站
export const PRESET_WEBSITES = [
  {
    category: '社交媒体',
    items: [
      { name: '微信', url: 'https://wx.qq.com', icon: 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico' },
      { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
      { name: '小红书', url: 'https://www.xiaohongshu.com', icon: 'https://www.xiaohongshu.com/favicon.ico' },
      { name: 'QQ空间', url: 'https://qzone.qq.com', icon: 'https://qzonestyle.gtimg.cn/qzone/qzactstatics/qcloud/img/qzone.ico' },
      { name: '抖音', url: 'https://www.douyin.com', icon: 'https://www.douyin.com/favicon.ico' },
      { name: 'B站', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' }
    ]
  },
  {
    category: '购物平台',
    items: [
      { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
      { name: '京东', url: 'https://www.jd.com', icon: 'https://www.jd.com/favicon.ico' },
      { name: '天猫', url: 'https://www.tmall.com', icon: 'https://www.tmall.com/favicon.ico' },
      { name: '拼多多', url: 'https://www.pinduoduo.com', icon: 'https://commimg.pddpic.com/pdd_daren/favicon.ico' },
      { name: '苏宁易购', url: 'https://www.suning.com', icon: 'https://res.suning.cn/public/v3/images/favicon.ico' }
    ]
  },
  {
    category: '视频娱乐',
    items: [
      { name: '爱奇艺', url: 'https://www.iqiyi.com', icon: 'https://www.iqiyi.com/favicon.ico' },
      { name: '腾讯视频', url: 'https://v.qq.com', icon: 'https://v.qq.com/favicon.ico' },
      { name: '优酷', url: 'https://www.youku.com', icon: 'https://www.youku.com/favicon.ico' },
      { name: '芒果TV', url: 'https://www.mgtv.com', icon: 'https://www.mgtv.com/favicon.ico' }
    ]
  },
  {
    category: '新闻资讯',
    items: [
      { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
      { name: '今日头条', url: 'https://www.toutiao.com', icon: 'https://www.toutiao.com/favicon.ico' },
      { name: '网易新闻', url: 'https://news.163.com', icon: 'https://news.163.com/favicon.ico' },
      { name: '腾讯新闻', url: 'https://news.qq.com', icon: 'https://mat1.gtimg.com/news/news2018/touch/favicon2.ico' },
      { name: '新浪新闻', url: 'https://news.sina.com.cn', icon: 'https://news.sina.com.cn/favicon.ico' }
    ]
  },
  {
    category: '搜索引擎',
    items: [
      { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
      { name: '搜狗', url: 'https://www.sogou.com', icon: 'https://www.sogou.com/images/logo/new/favicon.ico' },
      { name: '360搜索', url: 'https://www.so.com', icon: 'https://www.so.com/favicon.ico' }
    ]
  },
  {
    category: '开发工具',
    items: [
      { name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
      { name: 'Gitee', url: 'https://gitee.com', icon: 'https://gitee.com/favicon.ico' },
      { name: 'CSDN', url: 'https://www.csdn.net', icon: 'https://www.csdn.net/favicon.ico' },
      { name: '掘金', url: 'https://juejin.cn', icon: 'https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/favicon-32x32.png' },
      { name: '博客园', url: 'https://www.cnblogs.com', icon: 'https://www.cnblogs.com/favicon.ico' }
    ]
  },
  {
    category: '其他常用',
    items: [
      { name: '12306', url: 'https://www.12306.cn', icon: 'https://www.12306.cn/index/images/favicon.ico' },
      { name: '美团', url: 'https://www.meituan.com', icon: 'https://www.meituan.com/favicon.ico' },
      { name: '饿了么', url: 'https://www.ele.me', icon: 'https://fuss10.elemecdn.com/8/a6/4039333ac4ef033d7380db8c2dc67png.png' }
    ]
  }
];
