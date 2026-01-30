/**
 * 图片分辨率选择工具单元测试（Admin项目）
 * 验证映射规则和回退策略
 */

import { selectImageResolution, isMobileDevice, type ImageDisplayPurpose, type ImageVariants } from '../imageResolution';

describe('selectImageResolution', () => {
  const baseUrl = 'https://example.com/image.jpg';
  
  const variants: ImageVariants = {
    original: 'https://example.com/image.jpg',
    thumbnail: 'https://example.com/image_200*200.jpg',
    medium: 'https://example.com/image_800*600.jpg',
    highQuality: 'https://example.com/image_1920*1080.jpg',
  };

  describe('thumbnail 场景', () => {
    it('应该返回缩略图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'thumbnail');
      expect(result).toBe(variants.thumbnail);
    });

    it('如果缩略图不存在，应该回退到原图', () => {
      const variantsWithoutThumbnail = { ...variants, thumbnail: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutThumbnail, 'thumbnail');
      expect(result).toBe(baseUrl);
    });
  });

  describe('detail 场景', () => {
    it('应该返回中等质量图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'detail');
      expect(result).toBe(variants.medium);
    });

    it('如果中等质量图不存在，应该回退到缩略图', () => {
      const variantsWithoutMedium = { ...variants, medium: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutMedium, 'detail');
      expect(result).toBe(variants.thumbnail);
    });
  });

  describe('chatBackground 场景', () => {
    it('PC端应该返回高质量图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'chatBackground', false);
      expect(result).toBe(variants.highQuality);
    });

    it('移动端应该返回中等质量图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'chatBackground', true);
      expect(result).toBe(variants.medium);
    });
  });
});
