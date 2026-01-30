import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './UserProfilePanoramaMap.css';

// 类型定义
export interface UserBasicInfo {
  userId?: string;
  nickname?: string;
  gender: string;
  age: number;
  occupation: string;
  frequentFlyerCards: string[];
  travelTags: string[];
}

export interface ConsumptionRecord {
  business: string;
  product: string;
  consumptionCount: number;
}

export interface AircraftInfo {
  model: string;
  age: number;
  type: string;
}

export interface AirportInfo {
  name: string;
  weather: string;
  onTimeRate: string;
  estimatedQueue: string;
}

export interface PreferenceTag {
  category: string;
  value: string;
}

export interface TravelIntent {
  destination: string;
  time: string;
  cabinClass: string;
  checkIn: string;
  occupation: string;
  consumption: string;
  summaryLabel: string;
}

export interface ItineraryStage {
  name: string;
  isActive: boolean;
  details?: Array<{ label: string; value: number; percentage: number }>;
}

export interface DemandPrediction {
  name: string;
  probability: number;
}

export interface UserProfilePanoramaData {
  // 关键指标
  tripsLastYear: number;
  consumptionCountLastYear: number;
  futureTrips: number;
  
  // 传统属性
  basicInfo: UserBasicInfo;
  consumptionRecords: ConsumptionRecord[];
  
  // 相关实体
  aircraftInfo: AircraftInfo;
  airports: AirportInfo[];
  permanentResidence: string;
  flightRoutes: Array<{ from: string; to: string; count: number }>;
  
  // 行为认知
  preferenceTags: PreferenceTag[];
  travelIntent: TravelIntent;
  
  // 实时行程
  itineraryStages: ItineraryStage[];
  
  // 需求预测
  demandPredictions: DemandPrediction[];
}

interface UserProfilePanoramaMapProps {
  data: UserProfilePanoramaData;
  title?: string;
}

export const UserProfilePanoramaMap: React.FC<UserProfilePanoramaMapProps> = ({ 
  data, 
  title = "用户画像全景地图" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 计算饼图路径
  const getPiePath = (percentage: number, index: number, total: number) => {
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    const startAngle = (index / total) * 360 - 90;
    const endAngle = ((index + percentage / 100) / total) * 360 - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="user-profile-panorama">
      {/* 背景网格和粒子效果 */}
      <div className="panorama-background">
        <div className="grid-overlay"></div>
        <div className="particles"></div>
      </div>

      {/* 主容器 */}
      <div className="panorama-container">
        {/* 顶部标题和时间 */}
        <div className="panorama-header">
          <motion.h1 
            className="panorama-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          <motion.div 
            className="panorama-time"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {formatTime(currentTime)}
          </motion.div>
        </div>

        {/* 关键指标横幅 */}
        <motion.div 
          className="key-metrics-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="metric-card">
            <div className="metric-label">近一年行程量</div>
            <div className="metric-value">{data.tripsLastYear}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">近一年消费次数</div>
            <div className="metric-value">{data.consumptionCountLastYear}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">未来行程量</div>
            <div className="metric-value">{data.futureTrips}</div>
          </div>
        </motion.div>

        {/* 主要内容区域 */}
        <div className="panorama-content">
          {/* 左侧：传统属性信息 */}
          <motion.div 
            className="panorama-section left-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="section-header">
              <div className="section-icon">📊</div>
              <h2 className="section-title">传统属性信息</h2>
            </div>

            {/* 旅客基础信息 */}
            <div className="info-card">
              <h3 className="card-title">旅客基础信息</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">性别</span>
                  <span className="info-value">{data.basicInfo.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">年龄</span>
                  <span className="info-value">{data.basicInfo.age}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">职业</span>
                  <span className="info-value">{data.basicInfo.occupation}</span>
                </div>
              </div>
              
              {/* 常客卡 */}
              <div className="tags-container">
                <span className="tags-label">常客卡：</span>
                <div className="tags-list">
                  {data.basicInfo.frequentFlyerCards.map((card, idx) => (
                    <span key={idx} className="tag tag-primary">{card}</span>
                  ))}
                </div>
              </div>

              {/* 行程标签 */}
              <div className="tags-container">
                <span className="tags-label">行程标签：</span>
                <div className="tags-list">
                  {data.basicInfo.travelTags.map((tag, idx) => (
                    <span key={idx} className="tag tag-secondary">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 历史消费记录 */}
            <div className="info-card">
              <h3 className="card-title">历史消费记录</h3>
              <div className="consumption-table">
                <div className="table-header">
                  <div className="table-cell">业务</div>
                  <div className="table-cell">商品</div>
                  <div className="table-cell">消费次数</div>
                </div>
                {data.consumptionRecords.map((record, idx) => (
                  <div key={idx} className="table-row">
                    <div className="table-cell">{record.business}</div>
                    <div className="table-cell">{record.product}</div>
                    <div className="table-cell">{record.consumptionCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 中间：相关实体信息 */}
          <motion.div 
            className="panorama-section middle-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="section-header">
              <div className="section-icon">🌐</div>
              <h2 className="section-title">相关实体信息</h2>
            </div>

            {/* 飞机信息 */}
            <div className="info-card">
              <h3 className="card-title">飞机信息</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">型号</span>
                  <span className="info-value">{data.aircraftInfo.model}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">机龄</span>
                  <span className="info-value">{data.aircraftInfo.age}年</span>
                </div>
                <div className="info-item">
                  <span className="info-label">机型</span>
                  <span className="info-value">{data.aircraftInfo.type}</span>
                </div>
              </div>
            </div>

            {/* 机场信息 */}
            {data.airports.map((airport, idx) => (
              <div key={idx} className="info-card">
                <h3 className="card-title">{airport.name}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">天气</span>
                    <span className="info-value">{airport.weather}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">准点率</span>
                    <span className="info-value">{airport.onTimeRate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">预计排队</span>
                    <span className="info-value">{airport.estimatedQueue}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* 地图可视化 */}
            <div className="info-card map-card">
              <h3 className="card-title">常住地: {data.permanentResidence}</h3>
              <div className="map-container">
                <svg viewBox="0 0 400 300" className="china-map">
                  {/* 中国地图轮廓（简化版） */}
                  <path
                    d="M 100 50 L 150 60 L 200 55 L 250 70 L 300 65 L 350 80 L 320 120 L 280 140 L 250 160 L 200 180 L 150 170 L 100 150 L 80 120 Z"
                    fill="rgba(30, 58, 138, 0.3)"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="2"
                    className="map-outline"
                  />
                  
                  {/* 飞行路线 */}
                  {data.flightRoutes.map((route, idx) => (
                    <motion.path
                      key={idx}
                      d={`M ${100 + idx * 50} ${80 + idx * 30} Q ${150 + idx * 30} ${100 + idx * 20} ${200 + idx * 40} ${120 + idx * 40}`}
                      fill="none"
                      stroke="rgba(34, 211, 238, 0.8)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                      className="flight-route"
                    />
                  ))}
                  
                  {/* 城市节点 */}
                  <motion.circle
                    cx="200"
                    cy="120"
                    r="8"
                    fill="rgba(34, 211, 238, 1)"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="city-node main-city"
                  />
                  {data.flightRoutes.map((route, idx) => (
                    <motion.circle
                      key={idx}
                      cx={200 + idx * 40}
                      cy={120 + idx * 40}
                      r="4"
                      fill="rgba(59, 130, 246, 0.8)"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.9 + idx * 0.1, duration: 0.4 }}
                      className="city-node"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </motion.div>

          {/* 右上：行为认知计算结果 */}
          <motion.div 
            className="panorama-section right-top-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="section-header">
              <div className="section-icon">🧠</div>
              <h2 className="section-title">行为认知计算结果</h2>
            </div>

            {/* 其他偏好标签 */}
            <div className="info-card">
              <h3 className="card-title">其他偏好标签</h3>
              <div className="preference-tags">
                {data.preferenceTags.map((tag, idx) => (
                  <div key={idx} className="preference-tag-item">
                    <span className="preference-category">{tag.category}：</span>
                    <span className="preference-value">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 出行意图识别 */}
            <div className="info-card">
              <h3 className="card-title">出行意图识别</h3>
              <div className="intent-grid">
                <div className="intent-item">
                  <span className="intent-label">目的地</span>
                  <span className="intent-value">{data.travelIntent.destination}</span>
                </div>
                <div className="intent-item">
                  <span className="intent-label">时间</span>
                  <span className="intent-value">{data.travelIntent.time}</span>
                </div>
                <div className="intent-item">
                  <span className="intent-label">舱位</span>
                  <span className="intent-value">{data.travelIntent.cabinClass}</span>
                </div>
                <div className="intent-item">
                  <span className="intent-label">值机</span>
                  <span className="intent-value">{data.travelIntent.checkIn}</span>
                </div>
                <div className="intent-item">
                  <span className="intent-label">职业</span>
                  <span className="intent-value">{data.travelIntent.occupation}</span>
                </div>
                <div className="intent-item">
                  <span className="intent-label">消费</span>
                  <span className="intent-value">{data.travelIntent.consumption}</span>
                </div>
              </div>
              <div className="summary-label">
                <span className="summary-text">{data.travelIntent.summaryLabel}</span>
              </div>
            </div>
          </motion.div>

          {/* 中下：实时行程阶段识别 */}
          <motion.div 
            className="panorama-section bottom-middle-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="section-header">
              <div className="section-icon">📍</div>
              <h2 className="section-title">实时行程阶段识别</h2>
            </div>

            <div className="info-card">
              <h3 className="card-title">本次行程阶段</h3>
              <div className="itinerary-progress">
                {data.itineraryStages.map((stage, idx) => (
                  <div key={idx} className="stage-item">
                    <div className={`stage-dot ${stage.isActive ? 'active' : ''}`}></div>
                    <div className="stage-name">{stage.name}</div>
                    {stage.isActive && <div className="stage-indicator"></div>}
                  </div>
                ))}
              </div>

              {/* 阶段详情饼图 */}
              <div className="stage-details">
                {data.itineraryStages.map((stage, stageIdx) => (
                  stage.details && stage.details.length > 0 && (
                    <div key={stageIdx} className="stage-detail-card">
                      <h4 className="detail-title">{stage.name}</h4>
                      <div className="pie-charts-container">
                        {stage.details.map((detail, detailIdx) => {
                          const total = stage.details!.reduce((sum, d) => sum + d.percentage, 0);
                          return (
                            <div key={detailIdx} className="pie-chart-item">
                              <svg viewBox="0 0 100 100" className="pie-chart">
                                <path
                                  d={getPiePath(detail.percentage, detailIdx, total)}
                                  fill={`hsl(${200 + detailIdx * 30}, 70%, 50%)`}
                                  className="pie-segment"
                                />
                              </svg>
                              <div className="pie-label">
                                <span className="pie-text">{detail.label}</span>
                                <span className="pie-percentage">{detail.percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </motion.div>

          {/* 右下：出行需求及场景预测 */}
          <motion.div 
            className="panorama-section bottom-right-section"
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="section-header">
              <div className="section-icon">🔮</div>
              <h2 className="section-title">出行需求及场景预测</h2>
            </div>

            <div className="info-card">
              <h3 className="card-title">需求预测</h3>
              <div className="prediction-gauges">
                {data.demandPredictions.map((prediction, idx) => (
                  <div key={idx} className="gauge-container">
                    <div className="gauge-label">{prediction.name}</div>
                    <div className="gauge-wrapper">
                      <svg viewBox="0 0 120 120" className="gauge">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="rgba(30, 58, 138, 0.3)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={`hsl(${200 + idx * 40}, 70%, 50%)`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - prediction.probability / 100) }}
                          transition={{ delay: 1 + idx * 0.1, duration: 1 }}
                          transform="rotate(-90 60 60)"
                          className="gauge-progress"
                        />
                        <text
                          x="60"
                          y="65"
                          textAnchor="middle"
                          className="gauge-text"
                          fill="rgba(34, 211, 238, 1)"
                        >
                          {prediction.probability}%
                        </text>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePanoramaMap;
