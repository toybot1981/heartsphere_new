import React, { memo } from 'react';
import { WorldScene, Character, CustomScenario } from '../../types';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLazyImage } from '../components/MobileLazyImage';

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
    return (
        <div className="h-full bg-black flex flex-col">
            {/* Header / Hero */}
            <div className="relative h-64 shrink-0">
                <MobileLazyImage src={scene.imageUrl} alt="Scene Cover" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
                
                <MobileTouchableButton
                    onClick={onBack}
                    variant="ghost"
                    size="md"
                    className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 min-w-[44px] min-h-[44px] p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </MobileTouchableButton>

                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h1 className="text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">{scene.name}</h1>
                    <p className="text-sm text-gray-300 line-clamp-2">{scene.description}</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <MobileSmoothScroll className="flex-1 pb-24 p-4 space-y-8">
                
                {/* Main Story Section - 主线故事显示在角色上方 */}
                {scene.mainStory && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white border-l-4 border-pink-500 pl-3">主线剧情</h3>
                        </div>
                        <div 
                            onClick={() => onSelectCharacter(scene.mainStory!)}
                            className="bg-gradient-to-r from-gray-800 to-gray-900 border border-pink-500/30 rounded-xl p-4 active:scale-[0.97] transition-transform touch-manipulation cursor-pointer min-h-[80px]"
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onSelectCharacter(scene.mainStory!);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">Main Story</span>
                                    <h4 className="text-white font-bold mt-2">{scene.mainStory.name}</h4>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{scene.mainStory.bio}</p>
                                </div>
                                <div className="w-16 h-16 ml-3 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <MobileLazyImage src={scene.mainStory.avatarUrl} alt={scene.mainStory.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Characters Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-white border-l-4 border-pink-500 pl-3">登场人物</h3>
                         <MobileTouchableButton
                            onClick={onAddCharacter}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-pink-600/20 text-pink-400 border-pink-600/30"
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
                                className="relative rounded-xl overflow-hidden aspect-[3/4] border border-white/10 shadow-lg active:scale-[0.95] transition-transform touch-manipulation cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onSelectCharacter(char);
                                    }
                                }}
                            >
                                <MobileLazyImage src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <p className="text-white font-bold text-sm">{char.name}</p>
                                    <p className="text-[10px] text-gray-400">{char.role}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Scenarios Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-white border-l-4 border-indigo-500 pl-3">剧情剧本</h3>
                         <MobileTouchableButton
                            onClick={onAddScenario}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-indigo-600/20 text-indigo-400 border-indigo-600/30"
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
                                className={`rounded-xl p-4 active:scale-[0.97] transition-transform touch-manipulation cursor-pointer min-h-[80px] ${
                                    scen.id.startsWith('system_script_') 
                                        ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30' 
                                        : 'bg-gray-900 border border-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="text-indigo-200 font-bold flex-1">{scen.title}</h4>
                                    {scen.id.startsWith('system_script_') && (
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 ml-2">
                                            预设
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">{scen.description}</p>
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800">
                                    <span className="text-[10px] text-gray-600">By {scen.author}</span>
                                    <span className="text-[10px] text-indigo-400">开始剧情 &rarr;</span>
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