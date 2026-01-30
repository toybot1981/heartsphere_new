/**
 * 角色头像图片组件（使用缩略图）
 */

import React from 'react';
import { LazyImage } from '../LazyImage';
import { generateVariantUrl, type ImageVariants } from '../../utils/imageResolution';

interface CharacterAvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CharacterAvatarImage: React.FC<CharacterAvatarImageProps> = ({ src, alt, className }) => {
  const imageVariants: ImageVariants | undefined = React.useMemo(() => {
    if (!src || !src.trim()) return undefined;
    
    return {
      original: src,
      thumbnail: generateVariantUrl(src, 200, 200),
      medium: generateVariantUrl(src, 800, 600),
      highQuality: generateVariantUrl(src, 1920, 1080),
    };
  }, [src]);

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className || ''}
      variants={imageVariants}
      purpose="thumbnail"
    />
  );
};
