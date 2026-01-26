import React, { memo, useMemo } from 'react';
import { WorldScene } from '../../types';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { generateVariantUrl, type ImageVariants } from '../../utils/imageResolution';

interface MobileSceneSelectionProps {
    scenes: WorldScene[];
    onSelectScene: (sceneId: string) => void;
    onCreateScene: () => void;
}

/**
 * Mobile版本场景选择页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileSceneSelection: React.FC<MobileSceneSelectionProps> = memo(({ scenes, onSelectScene, onCreateScene }) => {
    // 去重：如果同一个场景在多个数组中存在，只保留一个
    const uniqueScenes = React.useMemo(() => {
        const seen = new Set<string>();
        return scenes.filter(scene => {
            if (seen.has(scene.id)) {
                return false;
            }
            seen.add(scene.id);
            return true;
        });
    }, [scenes]);

    return (
        <div 
          className="h-full flex flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div 
              className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] shrink-0 backdrop-blur-md z-10 border-b flex justify-between items-center"
              style={{
                backgroundColor: 'var(--tabbar-bg)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
                <h1 
                  className="text-xl font-bold"
                  style={{
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  选择场景
                </h1>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  共 {uniqueScenes.length} 个场景
                </span>
            </div>

            <MobileSmoothScroll className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">
                <div className="flex flex-col gap-6 p-4">
                    {uniqueScenes.length === 0 ? (
                        <MobileEmptyState
                            icon="🌍"
                            title="暂无场景"
                            description="创建你的第一个心域场景，开始你的故事之旅"
                            action={{
                                label: "创造新场景",
                                onClick: onCreateScene
                            }}
                        />
                    ) : (
                        uniqueScenes.map(scene => (
                        <div 
                            key={scene.id} 
                            onClick={() => onSelectScene(scene.id)}
                            className="relative h-48 w-full rounded-xl overflow-hidden group border active:scale-[0.97] transition-transform duration-150 touch-manipulation cursor-pointer"
                            style={{
                              borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                              boxShadow: 'var(--shadow-primary-light, 0 10px 15px -3px rgba(168, 85, 247, 0.1))',
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onSelectScene(scene.id);
                                }
                            }}
                        >
                            <SceneCardImage scene={scene} />
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(to top, var(--bg-overlay-alpha), transparent)',
                              }}
                            />
                            
                            <div className="absolute bottom-0 left-0 w-full p-5">
                                <h3 className="text-2xl font-black text-white mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                                    style={{ 
                                      textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 15px rgba(0,0,0,0.7)',
                                      WebkitTextStroke: '0.5px rgba(0,0,0,0.3)',
                                      letterSpacing: '0.02em'
                                    }}>
                                    {scene.name}
                                </h3>
                                <p className="text-xs font-semibold text-white line-clamp-2 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                                   style={{ 
                                     textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.6)'
                                   }}>
                                    {scene.description}
                                </p>
                            </div>
                            
                            <div 
                              className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full border text-[10px] font-medium"
                              style={{
                                backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
                                borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-primary-light, 0 10px 15px -3px rgba(168, 85, 247, 0.2))',
                              }}
                            >
                                进入 &rarr;
                            </div>
                        </div>
                        ))
                    )}

                    {/* Create New Scene Card */}
                    {uniqueScenes.length > 0 && (
                        <MobileTouchableButton
                            onClick={onCreateScene}
                            variant="outline"
                            size="lg"
                            fullWidth
                            className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all duration-200"
                            style={{
                              borderColor: 'var(--bg-secondary)',
                              color: 'var(--text-tertiary)',
                            }}
                            onMouseDown={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                              e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                            onMouseUp={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-secondary)';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                        >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold"
                              style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                              +
                            </div>
                            <span className="text-sm font-bold">创造新场景</span>
                        </MobileTouchableButton>
                    )}
                </div>
            </MobileSmoothScroll>
        </div>
    );
});

MobileSceneSelection.displayName = 'MobileSceneSelection';

/**
 * 场景卡片图片组件（内部组件，用于生成图片变体）
 */
const SceneCardImage: React.FC<{ scene: WorldScene }> = memo(({ scene }) => {
    // 从 imageUrl 生成多分辨率版本（根据命名规则）
    const imageVariants: ImageVariants | undefined = useMemo(() => {
        if (!scene.imageUrl || !scene.imageUrl.trim()) return undefined;
        
        return {
            original: scene.imageUrl,
            thumbnail: generateVariantUrl(scene.imageUrl, 200, 200),
            medium: generateVariantUrl(scene.imageUrl, 800, 600),
            highQuality: generateVariantUrl(scene.imageUrl, 1920, 1080),
        };
    }, [scene.imageUrl]);

    return (
        <MobileLazyImage 
            src={scene.imageUrl} 
            alt={scene.name} 
            className="w-full h-full object-cover" 
            variants={imageVariants}
            displayPurpose="list"
        />
    );
});

SceneCardImage.displayName = 'SceneCardImage';