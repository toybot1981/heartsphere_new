// 用户画像全景地图示例数据
import type { UserProfilePanoramaData } from './UserProfilePanoramaMap';

export const exampleUserProfileData: UserProfilePanoramaData = {
  // 关键指标
  tripsLastYear: 83,
  consumptionCountLastYear: 12,
  futureTrips: 2,
  
  // 传统属性
  basicInfo: {
    userId: 'USER123456',
    nickname: '旅行达人',
    gender: '男',
    age: 47,
    occupation: '企业高管',
    frequentFlyerCards: ['国航白金', '东航银卡', '南航金卡'],
    travelTags: ['高频飞行', '商旅用户'],
  },
  
  consumptionRecords: [
    {
      business: '保险',
      product: '年期航意保障',
      consumptionCount: 1,
    },
    {
      business: '免税',
      product: '泸州老窖',
      consumptionCount: 2,
    },
    {
      business: '用车',
      product: '舒适5座-飞享专车',
      consumptionCount: 3,
    },
    {
      business: '辅营',
      product: '付费行李',
      consumptionCount: 2,
    },
    {
      business: '辅营',
      product: '登机口升舱',
      consumptionCount: 4,
    },
  ],
  
  // 相关实体
  aircraftInfo: {
    model: '空客320-232',
    age: 14.2,
    type: '中型机',
  },
  
  airports: [
    {
      name: '北京首都',
      weather: '晴 -4~6度',
      onTimeRate: '91.24%',
      estimatedQueue: '10min',
    },
    {
      name: '三亚凤凰',
      weather: '晴 20~28度',
      onTimeRate: '89.90%',
      estimatedQueue: '12min',
    },
  ],
  
  permanentResidence: '北京',
  
  flightRoutes: [
    { from: '北京', to: '上海', count: 15 },
    { from: '北京', to: '广州', count: 12 },
    { from: '北京', to: '深圳', count: 10 },
    { from: '北京', to: '成都', count: 8 },
    { from: '北京', to: '杭州', count: 6 },
  ],
  
  // 行为认知
  preferenceTags: [
    { category: '时间偏好', value: '早晨' },
    { category: '航班类型', value: '红眼航班' },
    { category: '去机场交通方式', value: '接机' },
  ],
  
  travelIntent: {
    destination: '海滨城市',
    time: '冬季(寒假)',
    cabinClass: '经济舱',
    checkIn: '同行含儿童',
    occupation: '企业高管',
    consumption: '已预订豪华送机',
    summaryLabel: '高端亲子度假',
  },
  
  // 实时行程
  itineraryStages: [
    {
      name: '出票',
      isActive: true,
      details: [
        { label: 'CUSS机', value: 0.03, percentage: 3 },
        { label: '柜台', value: 0.78, percentage: 78 },
      ],
    },
    {
      name: '开放值机',
      isActive: false,
      details: [
        { label: '前排靠过道', value: 0.05, percentage: 5 },
        { label: '前排靠窗', value: 0.06, percentage: 6 },
        { label: '前排其他', value: 0.07, percentage: 7 },
      ],
    },
    {
      name: '行李托运',
      isActive: false,
      details: [
        { label: '前排靠过道', value: 0.36, percentage: 36 },
        { label: '前排靠窗', value: 0.06, percentage: 6 },
        { label: '奶茶专卖', value: 0.22, percentage: 22 },
      ],
    },
    {
      name: '安检',
      isActive: false,
      details: [
        { label: '紧急出口', value: 0.15, percentage: 15 },
      ],
    },
    {
      name: '登机',
      isActive: false,
      details: [
        { label: '后排其他', value: 0.25, percentage: 25 },
      ],
    },
    {
      name: '到达',
      isActive: false,
    },
    {
      name: '行李提取',
      isActive: false,
      details: [
        { label: '经济舱', value: 0.56, percentage: 56 },
        { label: '头等舱', value: 0.26, percentage: 26 },
      ],
    },
  ],
  
  // 需求预测
  demandPredictions: [
    {
      name: '升舱概率',
      probability: 95,
    },
    {
      name: '付费行李概率',
      probability: 87,
    },
    {
      name: '豪华接机概率',
      probability: 97,
    },
    {
      name: '机上wifi概率',
      probability: 65,
    },
  ],
};
