import React, { memo, useMemo } from 'react';
import { WorldScene, Character, CustomScenario } from '../../types';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { MobileBackButton } from '../components/MobileBackButton';
import { MobileColors, MobileCardStyles } from '../components/MobileStyleGuide';
import { generateVariantUrl, type ImageVariants } from '../../utils/imageResolution';

interface MobileCharacterSelectionProps {
    scene: WorldScene;
    characters: Character[];
    scenarios: CustomScenario[];
    onBack: () => void;
    onSelectCharacter: (char: Character) => void;
    onPlayScenario: (scenario: CustomScenario) => void;
    onAddCharacter: () => void;
    onAddScenario: () => void;
}

/**
 * Mobile版本角色选择页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileCharacterSelection: React.FC<MobileCharacterSelectionProps> = memo(({ 
    scene, characters, scenarios, onBack, onSelectCharacter, onPlayScenario, onAddCharacter, onAddScenario 
}) => {
    // 从场景 imageUrl 生成多分辨率版本
    const sceneImageVariants: ImageVariants | undefined = useMemo(() => {
        if (!scene.imageUrl || !scene.imageUrl.trim()) return undefined;
        
        return {
            original: scene.imageUrl,
            thumbnail: generateVariantUrl(scene.imageUrl, 200, 200),
            medium: generateVariantUrl(scene.imageUrl, 800, 600),
            highQuality: generateVariantUrl(scene.imageUrl, 1920, 1080),
        };
    }, [scene.imageUrl]);

    return (
        <div className="h-full bg-black flex flex-col">
            {/* Header / Hero */}
            <div className="relative h-64 shrink-0">
                <MobileLazyImage 
                    src={scene.imageUrl} 
                    alt="Scene Cover" 
                    className="w-full h-full object-cover opacity-80" 
                    variants={sceneImageVariants}
                    displayPurpose="detail"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
                
                <MobileBackButton
                    onClick={onBack}
                    className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-20"
                    aria-label="返回场景选择"
                />

                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h1 className="text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">{scene.name}</h1>
                    <p className="text-sm text-gray-300 line-clamp-2">{scene.description}</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <MobileSmoothScroll className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] p-4 space-y-8">
                
                {/* Main Story Section - 主线故事显示在角色上方 */}
                {scene.mainStory && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className={`text-lg font-bold ${MobileColors.text.primary} border-l-4 ${MobileColors.border.accent} pl-3`}>主线剧情</h3>
                        </div>
                        <div 
                            onClick={() => onSelectCharacter(scene.mainStory!)}
                            className={`${MobileCardStyles.default} ${MobileCardStyles.interactive} min-h-[80px]`}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectCharacter(scene.mainStory!);
                                }
                            }}
                            aria-label={`选择主线角色: ${scene.mainStory!.name}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <span className={`text-[10px] ${MobileColors.primary.gradient} text-white px-2 py-0.5 rounded-full font-bold`}>Main Story</span>
                                    <h4 className={`${MobileColors.text.primary} font-bold mt-2`}>{scene.mainStory.name}</h4>
                                    <p className={`text-xs ${MobileColors.text.muted} mt-2 line-clamp-2`}>{scene.mainStory.bio}</p>
                                </div>
                                <div className={`w-16 h-16 ml-3 rounded-lg overflow-hidden ${MobileColors.border.default} shrink-0`}>
                                    <MainStoryAvatarImage avatarUrl={scene.mainStory.avatarUrl} name={scene.mainStory.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Characters Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 className={`text-lg font-bold ${MobileColors.text.primary} border-l-4 ${MobileColors.border.accent} pl-3`}>登场人物</h3>
                         <MobileTouchableButton
                            onClick={onAddCharacter}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            aria-label="新增角色"
                        >
                            + 新增角色
                         </MobileTouchableButton>
                    </div>
                    
                    {characters.length === 0 ? (
                        <MobileEmptyState
                            icon="👤"
                            title="暂无角色"
                            description="为这个场景添加角色，开始你的故事"
                            action={{
                                label: "新增角色",
                                onClick: onAddCharacter
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                        {characters.map(char => (
                            <div 
                                key={char.id}
                                onClick={() => onSelectCharacter(char)}
                                className={`relative rounded-xl overflow-hidden aspect-[3/4] ${MobileColors.border.default} ${MobileCardStyles.shadow} active:scale-[0.95] transition-transform touch-manipulation cursor-pointer`}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectCharacter(char);
                                    }
                                }}
                                aria-label={`选择角色: ${char.name}`}
                            >
                                <CharacterAvatarImage avatarUrl={char.avatarUrl} name={char.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <p className={`${MobileColors.text.primary} font-black text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]`}
                                       style={{ 
                                         textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.7)',
                                         WebkitTextStroke: '0.5px rgba(0,0,0,0.3)',
                                         letterSpacing: '0.02em'
                                       }}>
                                        {char.name}
                                    </p>
                                    <p className={`text-[10px] font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]`}
                                       style={{ 
                                         textShadow: '0 1px 5px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.6)'
                                       }}>
                                        {char.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Scenarios Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 className={`text-lg font-bold ${MobileColors.text.primary} border-l-4 ${MobileColors.border.indigo} pl-3`}>剧情剧本</h3>
                         <MobileTouchableButton
                            onClick={onAddScenario}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            aria-label="创建剧本"
                        >
                            + 创建剧本
                         </MobileTouchableButton>
                    </div>

                    {scenarios.length === 0 ? (
                        <MobileEmptyState
                            icon="📜"
                            title="暂无剧本"
                            description="创建剧本，开始你的剧情之旅"
                            action={{
                                label: "创建剧本",
                                onClick: onAddScenario
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {scenarios.map(scen => (
                             <div 
                                key={scen.id}
                                onClick={() => onPlayScenario(scen)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onPlayScenario(scen);
                                    }
                                }}
                                className={`${MobileCardStyles.default} ${MobileCardStyles.interactive} min-h-[80px] ${
                                    scen.id.startsWith('system_script_') 
                                        ? `${MobileColors.primary.gradient} opacity-50 ${MobileColors.border.indigo}` 
                                        : ''
                                }`}
                                role="button"
                                tabIndex={0}
                                aria-label={`播放剧本: ${scen.title}`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className={`${MobileColors.text.indigo} font-bold flex-1`}>{scen.title}</h4>
                                    {scen.id.startsWith('system_script_') && (
                                        <span className={`text-[10px] ${MobileColors.semantic.info.bg} ${MobileColors.semantic.info.text} px-2 py-0.5 rounded-full ${MobileColors.semantic.info.border} ml-2`}>
                                            预设
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs ${MobileColors.text.muted} line-clamp-2`}>{scen.description}</p>
                                <div className={`flex justify-between items-center mt-3 pt-2 border-t ${MobileColors.border.slate}`}>
                                    <span className={`text-[10px] ${MobileColors.text.muted}`}>By {scen.author}</span>
                                    <span className={`text-[10px] ${MobileColors.text.indigo}`}>开始剧情 &rarr;</span>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

            </MobileSmoothScroll>
        </div>
    );
});

MobileCharacterSelection.displayName = 'MobileCharacterSelection';

/**
 * 主线故事头像图片组件（内部组件，用于生成图片变体）
 */
const MainStoryAvatarImage: React.FC<{ avatarUrl: string; name: string }> = memo(({ avatarUrl, name }) => {
    const imageVariants: ImageVariants | undefined = useMemo(() => {
        if (!avatarUrl || !avatarUrl.trim()) return undefined;
        
        return {
            original: avatarUrl,
            thumbnail: generateVariantUrl(avatarUrl, 200, 200),
            medium: generateVariantUrl(avatarUrl, 800, 600),
            highQuality: generateVariantUrl(avatarUrl, 1920, 1080),
        };
    }, [avatarUrl]);

    return (
        <MobileLazyImage 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover" 
            variants={imageVariants}
            displayPurpose="detail"
        />
    );
});

MainStoryAvatarImage.displayName = 'MainStoryAvatarImage';

/**
 * 角色头像图片组件（内部组件，用于生成图片变体）
 */
const CharacterAvatarImage: React.FC<{ avatarUrl: string; name: string }> = memo(({ avatarUrl, name }) => {
    const imageVariants: ImageVariants | undefined = useMemo(() => {
        if (!avatarUrl || !avatarUrl.trim()) return undefined;
        
        return {
            original: avatarUrl,
            thumbnail: generateVariantUrl(avatarUrl, 200, 200),
            medium: generateVariantUrl(avatarUrl, 800, 600),
            highQuality: generateVariantUrl(avatarUrl, 1920, 1080),
        };
    }, [avatarUrl]);

    return (
        <MobileLazyImage 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover" 
            variants={imageVariants}
            displayPurpose="list"
        />
    );
});

CharacterAvatarImage.displayName = 'CharacterAvatarImage';