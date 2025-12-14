export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export const DP_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '美食',
    children: [
      {
        id: 'food-chinese', name: '中餐', children: [
          { id: 'food-sichuan', name: '川菜' },
          { id: 'food-cantonese', name: '粤菜' },
          { id: 'food-hunan', name: '湘菜' },
          { id: 'food-shandong', name: '鲁菜' },
          { id: 'food-jiangsu', name: '苏菜' },
          { id: 'food-zhejiang', name: '浙菜' },
          { id: 'food-fujian', name: '闽菜' },
          { id: 'food-anhui', name: '徽菜' },
          { id: 'food-northeast', name: '东北菜' },
          { id: 'food-shanghai', name: '本帮菜' },
          { id: 'food-jiangxi', name: '赣菜' },
          { id: 'food-shaanxi', name: '陕西菜' },
          { id: 'food-shanxi', name: '山西菜' },
          { id: 'food-yunnan', name: '云南菜' },
          { id: 'food-guizhou', name: '贵州菜' },
          { id: 'food-chaoshan', name: '潮汕菜' },
          { id: 'food-hakka', name: '客家菜' },
          { id: 'food-muslim', name: '清真/西北菜' }
        ]
      },
      { id: 'food-hotpot', name: '火锅' },
      { id: 'food-barbecue', name: '烧烤' },
      { id: 'food-japanese', name: '日本料理' },
      { id: 'food-western', name: '西餐' },
      { id: 'food-fast', name: '快餐简餐' },
      { id: 'food-snack', name: '小吃' },
      { id: 'food-dessert', name: '甜点饮品' }
    ]
  },
  {
    id: 'entertainment',
    name: '休闲娱乐',
    children: [
      { id: 'ent-ktv', name: 'KTV' },
      { id: 'ent-cinema', name: '电影院' },
      { id: 'ent-boardgame', name: '桌游/棋牌' },
      { id: 'ent-internet', name: '网吧/电竞馆' },
      { id: 'ent-escape', name: '密室逃脱' },
      { id: 'ent-billiards', name: '台球/保龄球' }
    ]
  },
  {
    id: 'beauty',
    name: '丽人/美业',
    children: [
      { id: 'beauty-hair', name: '美发' },
      { id: 'beauty-nail', name: '美甲美睫' },
      { id: 'beauty-spa', name: '美容/SPA' },
      { id: 'beauty-makeup', name: '化妆品' }
    ]
  },
  {
    id: 'parenting',
    name: '亲子',
    children: [
      { id: 'parenting-kidsplay', name: '亲子乐园' },
      { id: 'parenting-education', name: '早教/幼教' },
      { id: 'parenting-photography', name: '亲子摄影' }
    ]
  },
  {
    id: 'fitness',
    name: '运动健身',
    children: [
      { id: 'fitness-gym', name: '健身房' },
      { id: 'fitness-swim', name: '游泳馆' },
      { id: 'fitness-yoga', name: '瑜伽/普拉提' }
    ]
  },
  {
    id: 'service',
    name: '生活服务',
    children: [
      { id: 'service-housekeeping', name: '家政' },
      { id: 'service-laundry', name: '干洗/洗衣' },
      { id: 'service-relocation', name: '搬家' },
      { id: 'service-repair', name: '家电维修' }
    ]
  },
  {
    id: 'shopping',
    name: '购物',
    children: [
      { id: 'shopping-mall', name: '商场' },
      { id: 'shopping-supermarket', name: '超市' },
      { id: 'shopping-3c', name: '数码电器' },
      { id: 'shopping-fashion', name: '服饰鞋包' }
    ]
  },
  {
    id: 'home',
    name: '家装家居',
    children: [
      { id: 'home-decoration', name: '装修设计' },
      { id: 'home-furniture', name: '家具建材' },
      { id: 'home-soft', name: '家居家纺' }
    ]
  },
  {
    id: 'wedding',
    name: '结婚',
    children: [
      { id: 'wedding-photography', name: '婚纱摄影' },
      { id: 'wedding-planning', name: '婚礼策划' },
      { id: 'wedding-hotel', name: '婚宴酒店' }
    ]
  },
  {
    id: 'travel',
    name: '旅游出行',
    children: [
      { id: 'travel-scenic', name: '景点/乐园' },
      { id: 'travel-hotel', name: '酒店/民宿' },
      { id: 'travel-transport', name: '交通服务' }
    ]
  },
  {
    id: 'education',
    name: '教育培训',
    children: [
      { id: 'edu-language', name: '语言培训' },
      { id: 'edu-art', name: '艺术培训' },
      { id: 'edu-k12', name: 'K12辅导' }
    ]
  },
  {
    id: 'auto',
    name: '爱车',
    children: [
      { id: 'auto-wash', name: '洗车' },
      { id: 'auto-repair', name: '维修保养' },
      { id: 'auto-beauty', name: '汽车美容' }
    ]
  },
  {
    id: 'medical',
    name: '医疗健康',
    children: [
      { id: 'med-clinic', name: '诊所' },
      { id: 'med-dental', name: '口腔' },
      { id: 'med-checkup', name: '体检/医学检验' }
    ]
  }
];