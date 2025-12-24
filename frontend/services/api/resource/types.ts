// 资源API类型定义

/**
 * 资源信息
 */
export interface Resource {
  id: number;
  name: string;
  url: string;
  category: string;
  description?: string;
  prompt?: string;
  tags?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

