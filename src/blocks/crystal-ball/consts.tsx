export interface TopIP {
  name: string;
  image: string;
}

export const mockData = [
  {
    name: '内容偏好\n长视频',
    topIPs: [
      { name: '许我鹤眼', image: 'https://placehold.co/64x64/5289f6/fff?text=1' },
      { name: '塞遇永安', image: 'https://placehold.co/64x64/5289f6/fff?text=2' },
      { name: '斗破苍穹年番', image: 'https://placehold.co/64x64/5289f6/fff?text=3' },
    ] as TopIP[],
    children: [
      {
        name: '生活',
        percent: 10,
        children: [
          {
            name: '古装',
            percent: 5,
          },
          {
            name: '科幻',
            percent: 5,
          },
          {
            name: '爱情',
            percent: 5,
          },
          {
            name: '悬疑',
            percent: 5,
          },
          {
            name: '动作',
            percent: 5,
          },
          {
            name: '喜剧',
            percent: 5,
          },
          {
            name: '恐怖',
            percent: 5,
          },
          {
            name: '动画',
            percent: 5,
          },
          {
            name: '纪录片',
            percent: 5,
          },
          {
            name: '音乐剧',
            percent: 5,
          },
        ],
      },
      {
        name: '社会',
        percent: 35.6,
        children: [
          {
            name: '社会新闻',
            percent: 66.28,
          },
          {
            name: '社会现象',
            percent: 20.02,
          },
          {
            name: '社会热点',
            percent: 15.4,
          },
          {
            name: '社会评论',
            percent: 11.66,
          },
          {
            name: '社会调查',
            percent: 8.37,
          },
          {
            name: '社会问题',
            percent: 7.32,
          },
          {
            name: '社会事件',
            percent: 2.09,
          },
          {
            name: '社会趋势',
            percent: 1.38,
          },
          {
            name: '社会分析',
            percent: 0.65,
          },
        ],
      },
      {
        name: '美食',
        percent: 54.1,
        children: [
          {
            name: '中餐',
            percent: 16.5,
          },
          {
            name: '甜品',
            percent: 11.9,
          },
          {
            name: '西餐',
            percent: 9.1,
          },
          {
            name: '日料',
            percent: 7.5,
          },
          {
            name: '小吃',
            percent: 5.0,
          },
          {
            name: '韩料',
            percent: 2.3,
          },
          {
            name: '泰餐',
            percent: 1.8,
          },
        ],
      },
      {
        name: '汽车',
        percent: 34.0,
        children: [
          {
            name: 'SUV',
            percent: 19.2,
          },
          {
            name: '轿车',
            percent: 14.8,
          },
        ],
      },
      {
        name: '情感',
        percent: 54.2,
        children: [
          {
            name: '恋爱',
            percent: 24.5,
          },
          {
            name: '婚姻',
            percent: 13.2,
          },
          {
            name: '友情',
            percent: 8.4,
          },
          {
            name: '亲情',
            percent: 3.9,
          },
          {
            name: '暗恋',
            percent: 1.2,
          },
          {
            name: '失恋',
            percent: 0.8,
          },
          {
            name: '单恋',
            percent: 0.5,
          },
          {
            name: '初恋',
            percent: 0.4,
          },
          {
            name: '热恋',
            percent: 0.3,
          },
        ],
      },
      {
        name: '影视综',
        percent: 54.3,
        children: [
          {
            name: '电影',
            percent: 22.1,
          },
          {
            name: '电视剧',
            percent: 14.3,
          },
          {
            name: '综艺',
            percent: 9.8,
          },
          {
            name: '纪录片',
            percent: 3.8,
          },
          {
            name: '网剧',
            percent: 2.1,
          },
          {
            name: '微电影',
            percent: 1.3,
          },
          {
            name: '短视频',
            percent: 0.9,
          },
        ],
      },
      {
        name: '搞笑',
        percent: 61.0,
        children: [
          {
            name: '段子',
            percent: 18.9,
          },
          {
            name: '搞笑视频',
            percent: 13.1,
          },
          {
            name: '幽默故事',
            percent: 10.2,
          },
          {
            name: '喜剧片段',
            percent: 7.8,
          },
          {
            name: '表情包',
            percent: 4.2,
          },
          {
            name: '恶搞',
            percent: 2.8,
          },
          {
            name: '冷幽默',
            percent: 1.5,
          },
          {
            name: '笑话',
            percent: 1.0,
          },
          {
            name: '段子手',
            percent: 0.8,
          },
          {
            name: '搞笑图片',
            percent: 0.7,
          },
        ],
      },
      {
        name: '剧情',
        percent: 30.4,
        children: [
          {
            name: '悬疑',
            percent: 17.6,
          },
          {
            name: '推理',
            percent: 12.8,
          },
        ],
      },
      {
        name: '亲子',
        percent: 54.1,
        children: [
          {
            name: '育儿',
            percent: 20.7,
          },
          {
            name: '教育',
            percent: 13.5,
          },
          {
            name: '儿童用品',
            percent: 10.1,
          },
          {
            name: '亲子活动',
            percent: 5.7,
          },
          {
            name: '早教',
            percent: 2.3,
          },
          {
            name: '童书',
            percent: 1.8,
          },
        ],
      },
    ],
  },
  {
    name: '行业\n推荐人群',
    children: [
      {
        name: '社会',
        percent: 59.3,
        children: [
          {
            name: '社会新闻',
            percent: 22.8,
          },
          {
            name: '社会现象',
            percent: 13.4,
          },
          {
            name: '社会热点',
            percent: 8.7,
          },
          {
            name: '社会评论',
            percent: 5.1,
          },
          {
            name: '社会调查',
            percent: 3.2,
          },
          {
            name: '社会问题',
            percent: 2.1,
          },
          {
            name: '社会事件',
            percent: 1.7,
          },
          {
            name: '社会趋势',
            percent: 1.4,
          },
          {
            name: '社会分析',
            percent: 0.9,
          },
        ],
      },
      {
        name: '体育',
        percent: 19.4,
        children: [
          {
            name: '足球',
            percent: 19.4,
          },
        ],
      },
      {
        name: '娱乐',
        percent: 54.3,
        children: [
          {
            name: '明星',
            percent: 25.3,
          },
          {
            name: '八卦',
            percent: 12.1,
          },
          {
            name: '音乐',
            percent: 8.9,
          },
          {
            name: '舞蹈',
            percent: 3.7,
          },
          {
            name: '演唱会',
            percent: 2.5,
          },
          {
            name: '偶像',
            percent: 1.8,
          },
        ],
      },
      {
        name: '国际',
        percent: 37.0,
        children: [
          {
            name: '国际新闻',
            percent: 23.2,
          },
          {
            name: '国际关系',
            percent: 13.8,
          },
        ],
      },
      {
        name: '军事',
        percent: 56.9,
        children: [
          {
            name: '军事实事',
            percent: 18.9,
          },
          {
            name: '武器装备',
            percent: 14.3,
          },
          {
            name: '军事历史',
            percent: 11.5,
          },
          {
            name: '军事科技',
            percent: 5.3,
          },
          {
            name: '军事理论',
            percent: 3.1,
          },
          {
            name: '军事演习',
            percent: 2.2,
          },
          {
            name: '军事教育',
            percent: 1.6,
          },
        ],
      },
      {
        name: '科技',
        percent: 58.5,
        children: [
          {
            name: '人工智能',
            percent: 20.9,
          },
          {
            name: '互联网',
            percent: 13.2,
          },
          {
            name: '手机',
            percent: 10.1,
          },
          {
            name: '电脑',
            percent: 5.8,
          },
          {
            name: '区块链',
            percent: 2.4,
          },
          {
            name: '大数据',
            percent: 1.8,
          },
          {
            name: '云计算',
            percent: 1.5,
          },
          {
            name: '物联网',
            percent: 1.2,
          },
          {
            name: '虚拟现实',
            percent: 0.9,
          },
          {
            name: '5G',
            percent: 0.7,
          },
        ],
      },
      {
        name: '健康',
        percent: 31.4,
        children: [
          {
            name: '养生',
            percent: 17.8,
          },
          {
            name: '健身',
            percent: 13.6,
          },
        ],
      },
      {
        name: '财经',
        percent: 21.7,
        children: [
          {
            name: '股票',
            percent: 21.7,
          },
        ],
      },
      {
        name: '动物',
        percent: 52.5,
        children: [
          {
            name: '宠物',
            percent: 17.1,
          },
          {
            name: '野生动物',
            percent: 13.9,
          },
          {
            name: '动物保护',
            percent: 10.8,
          },
          {
            name: '动物趣事',
            percent: 8.2,
          },
          {
            name: '动物科普',
            percent: 2.5,
          },
        ],
      },
    ],
  },
  {
    name: '品牌\n共鸣人群',
    children: [
      {
        name: '性别-女',
        percent: 52.7,
        children: [
          {
            name: '时尚',
            percent: 23.6,
          },
          {
            name: '美妆',
            percent: 16.2,
          },
          {
            name: '穿搭',
            percent: 8.7,
          },
          {
            name: '护肤',
            percent: 1.5,
          },
          {
            name: '配饰',
            percent: 1.2,
          },
          {
            name: '发型',
            percent: 0.9,
          },
          {
            name: '美甲',
            percent: 0.6,
          },
        ],
      },
      {
        name: '婚恋育儿-已婚',
        percent: 19.3,
        children: [
          {
            name: '婚姻生活',
            percent: 19.3,
          },
        ],
      },
      {
        name: '消费水平-低',
        percent: 54.6,
        children: [
          {
            name: '平价商品',
            percent: 22.4,
          },
          {
            name: '折扣',
            percent: 14.6,
          },
          {
            name: '性价比',
            percent: 10.2,
          },
          {
            name: '省钱技巧',
            percent: 2.8,
          },
          {
            name: '优惠券',
            percent: 1.9,
          },
          {
            name: '团购',
            percent: 1.4,
          },
          {
            name: '二手',
            percent: 1.1,
          },
        ],
      },
      {
        name: '消费水平-中',
        percent: 20.5,
        children: [
          {
            name: '中档商品',
            percent: 20.5,
          },
        ],
      },
      {
        name: '学历-初中',
        percent: 60.0,
        children: [
          {
            name: '学习',
            percent: 17.8,
          },
          {
            name: '教育',
            percent: 13.2,
          },
          {
            name: '技能',
            percent: 10.6,
          },
          {
            name: '知识',
            percent: 8.4,
          },
          {
            name: '考试',
            percent: 3.5,
          },
          {
            name: '作业',
            percent: 2.1,
          },
          {
            name: '课外',
            percent: 1.8,
          },
          {
            name: '辅导',
            percent: 1.5,
          },
          {
            name: '补习',
            percent: 1.1,
          },
        ],
      },
      {
        name: '年龄-30-39',
        percent: 24.1,
        children: [
          {
            name: '职场',
            percent: 24.1,
          },
        ],
      },
      {
        name: '学历-高中',
        percent: 31.0,
        children: [
          {
            name: '高考',
            percent: 18.6,
          },
          {
            name: '大学',
            percent: 12.4,
          },
        ],
      },
      {
        name: '年龄-40-49',
        percent: 63.0,
        children: [
          {
            name: '中年生活',
            percent: 16.3,
          },
          {
            name: '健康',
            percent: 13.7,
          },
          {
            name: '理财',
            percent: 11.2,
          },
          {
            name: '养老',
            percent: 8.8,
          },
          {
            name: '退休',
            percent: 4.2,
          },
          {
            name: '保险',
            percent: 3.1,
          },
          {
            name: '规划',
            percent: 2.5,
          },
          {
            name: '投资',
            percent: 1.9,
          },
          {
            name: '储蓄',
            percent: 1.3,
          },
        ],
      },
      {
        name: '婚恋育儿-育儿（孩子6-12周岁）婚恋育儿-育儿（孩子6-12周岁）',
        percent: 36.4,
        children: [
          {
            name: '小学生',
            percent: 21.9,
          },
          {
            name: '教育',
            percent: 14.5,
          },
        ],
      },
    ],
  },
  {
    name: '达人偏好\n视频号',
    children: [
      {
        name: '运动户外商品兴趣人群',
        percent: 60.4,
        children: [
          {
            name: '跑步',
            percent: 20.8,
          },
          {
            name: '徒步',
            percent: 13.4,
          },
          {
            name: '登山',
            percent: 9.6,
          },
          {
            name: '骑行',
            percent: 6.2,
          },
          {
            name: '健身',
            percent: 4.8,
          },
          {
            name: '瑜伽',
            percent: 3.5,
          },
          {
            name: '游泳',
            percent: 2.1,
          },
        ],
      },
      {
        name: '母婴兴趣人群',
        percent: 34.6,
        children: [
          {
            name: '奶粉',
            percent: 19.5,
          },
          {
            name: '玩具',
            percent: 15.1,
          },
        ],
      },
      {
        name: '跑步周边兴趣人群',
        percent: 55.9,
        children: [
          {
            name: '跑鞋',
            percent: 22.7,
          },
          {
            name: '运动服',
            percent: 14.2,
          },
          {
            name: '运动装备',
            percent: 10.8,
          },
          {
            name: '训练',
            percent: 2.3,
          },
          {
            name: '跑步机',
            percent: 1.8,
          },
          {
            name: '运动耳机',
            percent: 1.4,
          },
          {
            name: '智能手环',
            percent: 1.2,
          },
          {
            name: '运动水壶',
            percent: 0.9,
          },
          {
            name: '运动袜',
            percent: 0.6,
          },
        ],
      },
      {
        name: '婴童用品潜客',
        percent: 18.4,
        children: [
          {
            name: '安全座椅',
            percent: 18.4,
          },
        ],
      },
      {
        name: '奢美意向人群',
        percent: 57.0,
        children: [
          {
            name: '奢侈品',
            percent: 17.6,
          },
          {
            name: '高端',
            percent: 13.8,
          },
          {
            name: '品牌',
            percent: 11.4,
          },
          {
            name: '精致',
            percent: 7.2,
          },
          {
            name: '设计师',
            percent: 3.1,
          },
          {
            name: '限量',
            percent: 2.2,
          },
          {
            name: '定制',
            percent: 1.7,
          },
        ],
      },
      {
        name: '潮流运动品牌人群',
        percent: 34.0,
        children: [
          {
            name: '潮牌',
            percent: 21.3,
          },
          {
            name: '运动',
            percent: 12.7,
          },
        ],
      },
      {
        name: '汽车意向人群',
        percent: 60.1,
        children: [
          {
            name: '购车',
            percent: 25.4,
          },
          {
            name: '车型',
            percent: 11.2,
          },
          {
            name: '品牌',
            percent: 8.6,
          },
          {
            name: '配置',
            percent: 4.8,
          },
          {
            name: '价格',
            percent: 3.2,
          },
          {
            name: '性能',
            percent: 2.5,
          },
          {
            name: '外观',
            percent: 1.9,
          },
          {
            name: '内饰',
            percent: 1.4,
          },
          {
            name: '油耗',
            percent: 1.1,
          },
        ],
      },
      {
        name: '母婴核心人群',
        percent: 57.7,
        children: [
          {
            name: '育儿',
            percent: 23.1,
          },
          {
            name: '教育',
            percent: 13.9,
          },
          {
            name: '健康',
            percent: 9.2,
          },
          {
            name: '成长',
            percent: 3.8,
          },
          {
            name: '营养',
            percent: 2.5,
          },
          {
            name: '睡眠',
            percent: 1.9,
          },
          {
            name: '安全',
            percent: 1.4,
          },
          {
            name: '护理',
            percent: 1.1,
          },
          {
            name: '辅食',
            percent: 0.8,
          },
        ],
      },
      {
        name: '篮球周边兴趣人群',
        percent: 19.7,
        children: [
          {
            name: '篮球',
            percent: 19.7,
          },
        ],
      },
    ],
  },
  {
    name: '高端属性\n人群策略',
    children: [
      {
        name: '生活',
        percent: 50.0,
        children: [
          {
            name: '日常',
            percent: 20.3,
          },
          {
            name: '家居',
            percent: 14.7,
          },
          {
            name: '购物',
            percent: 10.2,
          },
          {
            name: '服务',
            percent: 4.8,
          },
        ],
      },
      {
        name: '社会',
        percent: 50.0,
        children: [
          {
            name: '社会新闻',
            percent: 22.5,
          },
          {
            name: '社会现象',
            percent: 13.1,
          },
          {
            name: '社会热点',
            percent: 9.4,
          },
          {
            name: '社会评论',
            percent: 5.0,
          },
        ],
      },
      {
        name: '美食',
        percent: 50.2,
        children: [
          {
            name: '中餐',
            percent: 17.9,
          },
          {
            name: '甜品',
            percent: 11.6,
          },
          {
            name: '西餐',
            percent: 8.7,
          },
          {
            name: '日料',
            percent: 6.8,
          },
          {
            name: '小吃',
            percent: 5.2,
          },
        ],
      },
      {
        name: '汽车',
        percent: 50.0,
        children: [
          {
            name: 'SUV',
            percent: 18.4,
          },
          {
            name: '轿车',
            percent: 13.6,
          },
          {
            name: '新能源',
            percent: 10.2,
          },
          {
            name: '跑车',
            percent: 7.8,
          },
        ],
      },
      {
        name: '情感',
        percent: 50.0,
        children: [
          {
            name: '恋爱',
            percent: 23.7,
          },
          {
            name: '婚姻',
            percent: 12.3,
          },
          {
            name: '友情',
            percent: 9.5,
          },
          {
            name: '亲情',
            percent: 4.5,
          },
        ],
      },
      {
        name: '影视综',
        percent: 50.0,
        children: [
          {
            name: '电影',
            percent: 21.8,
          },
          {
            name: '电视剧',
            percent: 13.4,
          },
          {
            name: '综艺',
            percent: 9.2,
          },
          {
            name: '纪录片',
            percent: 5.6,
          },
        ],
      },
      {
        name: '搞笑',
        percent: 50.0,
        children: [
          {
            name: '段子',
            percent: 19.1,
          },
          {
            name: '搞笑视频',
            percent: 12.5,
          },
          {
            name: '幽默故事',
            percent: 9.7,
          },
          {
            name: '喜剧片段',
            percent: 8.7,
          },
        ],
      },
      {
        name: '剧情',
        percent: 50.0,
        children: [
          {
            name: '悬疑',
            percent: 16.8,
          },
          {
            name: '推理',
            percent: 12.4,
          },
          {
            name: '犯罪',
            percent: 10.6,
          },
          {
            name: '谍战',
            percent: 7.2,
          },
          {
            name: '历史',
            percent: 3.0,
          },
        ],
      },
      {
        name: '亲子',
        percent: 50.0,
        children: [
          {
            name: '育儿',
            percent: 21.3,
          },
          {
            name: '教育',
            percent: 12.7,
          },
          {
            name: '儿童用品',
            percent: 9.8,
          },
          {
            name: '亲子活动',
            percent: 6.2,
          },
        ],
      },
    ],
  },
  {
    name: '达人偏好\n公众号',
    children: [
      {
        name: '社会',
        percent: 50.0,
        children: [
          {
            name: '社会新闻',
            percent: 23.9,
          },
          {
            name: '社会现象',
            percent: 14.5,
          },
          {
            name: '社会热点',
            percent: 8.2,
          },
          {
            name: '社会评论',
            percent: 3.4,
          },
        ],
      },
      {
        name: '体育',
        percent: 50.0,
        children: [
          {
            name: '足球',
            percent: 20.6,
          },
          {
            name: '篮球',
            percent: 14.8,
          },
          {
            name: '网球',
            percent: 9.1,
          },
          {
            name: '游泳',
            percent: 5.5,
          },
        ],
      },
      {
        name: '娱乐',
        percent: 50.0,
        children: [
          {
            name: '明星',
            percent: 26.2,
          },
          {
            name: '八卦',
            percent: 11.4,
          },
          {
            name: '音乐',
            percent: 8.6,
          },
          {
            name: '舞蹈',
            percent: 3.8,
          },
        ],
      },
      {
        name: '国际',
        percent: 50.0,
        children: [
          {
            name: '国际新闻',
            percent: 24.7,
          },
          {
            name: '国际关系',
            percent: 12.6,
          },
          {
            name: '国际财经',
            percent: 9.1,
          },
          {
            name: '国际文化',
            percent: 3.6,
          },
        ],
      },
      {
        name: '军事',
        percent: 50.0,
        children: [
          {
            name: '军事实事',
            percent: 19.8,
          },
          {
            name: '武器装备',
            percent: 13.7,
          },
          {
            name: '军事历史',
            percent: 10.9,
          },
          {
            name: '军事科技',
            percent: 5.6,
          },
        ],
      },
      {
        name: '科技',
        percent: 50.0,
        children: [
          {
            name: '人工智能',
            percent: 21.3,
          },
          {
            name: '互联网',
            percent: 12.9,
          },
          {
            name: '手机',
            percent: 9.8,
          },
          {
            name: '电脑',
            percent: 6.0,
          },
        ],
      },
      {
        name: '健康',
        percent: 50.0,
        children: [
          {
            name: '养生',
            percent: 18.4,
          },
          {
            name: '健身',
            percent: 13.2,
          },
          {
            name: '医疗',
            percent: 10.7,
          },
          {
            name: '心理',
            percent: 7.7,
          },
        ],
      },
      {
        name: '财经',
        percent: 50.0,
        children: [
          {
            name: '股票',
            percent: 22.3,
          },
          {
            name: '投资',
            percent: 13.9,
          },
          {
            name: '理财',
            percent: 10.2,
          },
          {
            name: '经济',
            percent: 3.6,
          },
        ],
      },
      {
        name: '动物',
        percent: 50.0,
        children: [
          {
            name: '宠物',
            percent: 16.7,
          },
          {
            name: '野生动物',
            percent: 14.1,
          },
          {
            name: '动物保护',
            percent: 11.2,
          },
          {
            name: '动物趣事',
            percent: 8.0,
          },
        ],
      },
    ],
  },
];

export const bubbleChartMock = [
  {
    name: '古装',
    percent: 18.5,
  },
  {
    name: '科幻',
    percent: 12.3,
  },
  {
    name: '爱情',
    percent: 8.2,
  },
  {
    name: '悬疑',
    percent: 6.7,
  },
  {
    name: '动作',
    percent: 2.8,
  },
  {
    name: '喜剧',
    percent: 1.5,
  },
];

export const tagStyles = {
  6: [
    {
      x: 303,
      y: 165,
    },
    {
      x: 392,
      y: 165,
    },
    {
      x: 261,
      y: 92,
    },
    {
      x: 348,
      y: 74,
    },
    {
      x: 434,
      y: 92,
    },
    {
      x: 222,
      y: 24,
    },
    {
      x: 302,
      y: 4,
    },
    {
      x: 393,
      y: 4,
    },
    {
      x: 474,
      y: 24,
    },
  ],
  5: [
    {
      x: 290,
      y: 166,
    },
    {
      x: 406,
      y: 166,
    },
    {
      x: 240,
      y: 100,
    },
    {
      x: 348,
      y: 79,
    },
    {
      x: 456,
      y: 100,
    },
    {
      x: 192,
      y: 40,
    },
    {
      x: 295,
      y: 7,
    },
    {
      x: 402,
      y: 7,
    },
    {
      x: 505,
      y: 40,
    },
  ],
  4: [
    {
      x: 276,
      y: 176,
    },
    {
      x: 421,
      y: 176,
    },
    {
      x: 221,
      y: 110,
    },
    {
      x: 348,
      y: 79,
    },
    {
      x: 476,
      y: 110,
    },
    {
      x: 173,
      y: 50,
    },
    {
      x: 280,
      y: 11,
    },
    {
      x: 417,
      y: 11,
    },
    {
      x: 523,
      y: 50,
    },
  ],
  3: [
    {
      x: 245,
      y: 196,
    },
    {
      x: 450,
      y: 196,
    },
    {
      x: 175,
      y: 145,
    },
    {
      x: 348,
      y: 79,
    },
    {
      x: 521,
      y: 145,
    },
    {
      x: 110,
      y: 98,
    },
    {
      x: 249,
      y: 19,
    },
    {
      x: 447,
      y: 19,
    },
    {
      x: 598,
      y: 98,
    },
  ],
};

export const layer1 = (
  <img
    src="https://wxa.wxs.qq.com/wxad-design/yijie/cb-layer-1.webp"
    className="size-[321px]"
  />
);

export const layer1Current = (
  <img
    src="https://wxa.wxs.qq.com/wxad-design/yijie/cb-layer-1-current.webp"
    className="size-[321px]"
  />
);

export const layer2 = (
  <img
    src="https://wxa.wxs.qq.com/wxad-design/yijie/cb-layer-2.webp"
    className="size-[480px]"
  />
);

export const layer3 = (
  <img
    src="https://wxa.wxs.qq.com/wxad-design/yijie/cb-layer-3.webp"
    className="size-[640px]"
  />
);

export const layer4 = (
  <img
    src="https://wxa.wxs.qq.com/wxad-design/yijie/cb-layer-4.webp"
    className="size-[800px]"
  />
);
