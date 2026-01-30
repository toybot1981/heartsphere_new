/**
 * 图片分辨率选择工具单元测试
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

  describe('没有 variants 参数', () => {
    it('应该返回原图URL', () => {
      const result = selectImageResolution(baseUrl);
      expect(result).toBe(baseUrl);
    });
  });

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

  describe('list 场景', () => {
    it('应该返回缩略图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'list');
      expect(result).toBe(variants.thumbnail);
    });

    it('如果缩略图不存在，应该回退到原图', () => {
      const variantsWithoutThumbnail = { ...variants, thumbnail: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutThumbnail, 'list');
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

    it('如果中等质量图和缩略图都不存在，应该回退到原图', () => {
      const variantsWithoutBoth = { ...variants, medium: undefined, thumbnail: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutBoth, 'detail');
      expect(result).toBe(baseUrl);
    });
  });

  describe('background 场景', () => {
    it('应该返回中等质量图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'background');
      expect(result).toBe(variants.medium);
    });

    it('如果中等质量图不存在，应该回退到缩略图', () => {
      const variantsWithoutMedium = { ...variants, medium: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutMedium, 'background');
      expect(result).toBe(variants.thumbnail);
    });

    it('如果中等质量图和缩略图都不存在，应该回退到原图', () => {
      const variantsWithoutBoth = { ...variants, medium: undefined, thumbnail: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutBoth, 'background');
      expect(result).toBe(baseUrl);
    });
  });

  describe('chatBackground 场景', () => {
    describe('PC端（isMobile=false）', () => {
      it('应该返回高质量图URL', () => {
        const result = selectImageResolution(baseUrl, variants, 'chatBackground', false);
        expect(result).toBe(variants.highQuality);
      });

      it('如果高质量图不存在，应该回退到中等质量图', () => {
        const variantsWithoutHQ = { ...variants, highQuality: undefined };
        const result = selectImageResolution(baseUrl, variantsWithoutHQ, 'chatBackground', false);
        expect(result).toBe(variants.medium);
      });

      it('如果高质量图和中等质量图都不存在，应该回退到缩略图', () => {
        const variantsWithoutHQAndMedium = { ...variants, highQuality: undefined, medium: undefined };
        const result = selectImageResolution(baseUrl, variantsWithoutHQAndMedium, 'chatBackground', false);
        expect(result).toBe(variants.thumbnail);
      });

      it('如果所有分辨率都不存在，应该回退到原图', () => {
        const variantsEmpty = { original: baseUrl };
        const result = selectImageResolution(baseUrl, variantsEmpty, 'chatBackground', false);
        expect(result).toBe(baseUrl);
      });
    });

    describe('移动端（isMobile=true）', () => {
      it('应该返回中等质量图URL', () => {
        const result = selectImageResolution(baseUrl, variants, 'chatBackground', true);
        expect(result).toBe(variants.medium);
      });

      it('如果中等质量图不存在，应该回退到缩略图', () => {
        const variantsWithoutMedium = { ...variants, medium: undefined };
        const result = selectImageResolution(baseUrl, variantsWithoutMedium, 'chatBackground', true);
        expect(result).toBe(variants.thumbnail);
      });

      it('如果中等质量图和缩略图都不存在，应该回退到原图', () => {
        const variantsWithoutBoth = { ...variants, medium: undefined, thumbnail: undefined };
        const result = selectImageResolution(baseUrl, variantsWithoutBoth, 'chatBackground', true);
        expect(result).toBe(baseUrl);
      });
    });
  });

  describe('original 场景', () => {
    it('应该返回原图URL', () => {
      const result = selectImageResolution(baseUrl, variants, 'original');
      expect(result).toBe(variants.original || baseUrl);
    });
  });

  describe('默认场景', () => {
    it('如果没有指定场景，应该使用中等质量图', () => {
      const result = selectImageResolution(baseUrl, variants);
      expect(result).toBe(variants.medium);
    });

    it('如果中等质量图不存在，应该回退到缩略图', () => {
      const variantsWithoutMedium = { ...variants, medium: undefined };
      const result = selectImageResolution(baseUrl, variantsWithoutMedium);
      expect(result).toBe(variants.thumbnail);
    });
  });
});

describe('isMobileDevice', () => {
  // 注意：这些测试可能受到实际运行环境的影响
  // 在实际测试中，可能需要 mock window 对象

  it('应该返回布尔值', () => {
    const result = isMobileDevice();
    expect(typeof result).toBe('boolean');
  });

  // 如果需要测试特定设备类型，可以使用 jest.mock 来模拟
  // 这里只做基本测试
});
