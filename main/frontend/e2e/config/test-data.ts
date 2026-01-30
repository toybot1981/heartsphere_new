/**
 * 测试数据配置
 * 包含测试账号、测试数据等信息
 */

// 测试环境配置
export const TEST_ENV = {
  PC_URL: 'http://localhost:3000',
  MOBILE_URL: 'http://localhost:3000/mobile.html',
  API_BASE_URL: 'http://localhost:8081',
};

// 测试账号
export const TEST_ACCOUNT = {
  username: 'tongyexin',
  password: '123456',
};

// 测试数据
export const TEST_DATA = {
  // 测试场景数据
  scenario: {
    name: '测试场景',
    description: '这是一个测试场景',
    eraName: '测试时代',
  },
  // 测试角色数据
  character: {
    name: '测试角色',
    description: '这是一个测试角色',
    personality: '友好、幽默',
    background: '测试角色背景',
  },
  // 测试剧本数据
  script: {
    title: '测试剧本',
    description: '这是一个测试剧本',
  },
  // 测试消息数据
  message: {
    text: '这是一条测试消息',
  },
};

// 测试超时配置（毫秒）
export const TEST_TIMEOUT = {
  DEFAULT: 30000, // 30秒
  LOGIN: 10000, // 10秒
  API: 15000, // 15秒
  PAGE_LOAD: 10000, // 10秒
};
