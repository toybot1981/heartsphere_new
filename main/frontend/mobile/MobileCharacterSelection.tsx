import React from 'react';
import { WorldScene, Character, CustomScenario } from '../types';

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

export const MobileCharacterSelection: React.FC<MobileCharacterSelectionProps> = ({ 
    scene, characters, scenarios, onBack, onSelectCharacter, onPlayScenario, onAddCharacter, onAddScenario 
}) => {
    return (
        <div 
          className="h-full flex flex-col"
          style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
        >
            {/* Header / Hero */}
            <div className="relative h-64 shrink-0">
                <img src={scene.imageUrl} className="w-full h-full object-cover opacity-80" alt="Scene Cover" />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, var(--bg-primary-alpha, rgba(0, 0, 0, 0.2)), var(--bg-primary, #000000))',
                  }}
                />
                
                <button 
                    onClick={onBack}
                    className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 min-w-[44px] min-h-[44px] p-2 backdrop-blur-md rounded-full border z-20 active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.4))',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h1 
                      className="text-3xl font-bold mb-2 shadow-black drop-shadow-md"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {scene.name}
                    </h1>
                    <p 
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {scene.description}
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-8 overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* Main Story Section - 主线故事显示在角色上方 */}
                {scene.mainStory && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 
                              className="text-lg font-bold border-l-4 pl-3"
                              style={{
                                color: 'var(--text-primary)',
                                borderLeftColor: 'var(--color-pink, #ec4899)',
                              }}
                            >
                              主线剧情
                            </h3>
                        </div>
                        <div 
                            onClick={() => onSelectCharacter(scene.mainStory!)}
                            className="border rounded-xl p-4 active:scale-[0.97] transition-transform touch-manipulation cursor-pointer min-h-[80px]"
                            style={{
                              background: 'linear-gradient(to right, var(--bg-card, rgba(31, 41, 55, 1)), var(--bg-primary, rgba(17, 24, 39, 1)))',
                              borderColor: 'var(--border-color-accent-alpha, rgba(236, 72, 153, 0.3))',
                            }}
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
                                    <span 
                                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                      style={{
                                        backgroundColor: 'var(--color-pink, #ec4899)',
                                        color: 'var(--text-primary)',
                                      }}
                                    >
                                      Main Story
                                    </span>
                                    <h4 
                                      className="font-bold mt-2"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      {scene.mainStory.name}
                                    </h4>
                                    <p 
                                      className="text-xs mt-2 line-clamp-2"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      {scene.mainStory.bio}
                                    </p>
                                </div>
                                <div 
                                  className="w-16 h-16 ml-3 rounded-lg overflow-hidden border shrink-0"
                                  style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
                                >
                                    <img src={scene.mainStory.avatarUrl} className="w-full h-full object-cover" alt={scene.mainStory.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Characters Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 
                           className="text-lg font-bold border-l-4 pl-3"
                           style={{
                             color: 'var(--text-primary)',
                             borderLeftColor: 'var(--color-pink, #ec4899)',
                           }}
                         >
                           登场人物
                         </h3>
                         <button 
                            onClick={onAddCharacter} 
                            className="text-xs px-3 py-2 rounded-full border min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-pink-alpha, rgba(219, 39, 119, 0.2))',
                              color: 'var(--color-pink, #ec4899)',
                              borderColor: 'var(--border-pink-alpha, rgba(219, 39, 119, 0.3))',
                            }}
                        >
                            + 新增角色
                         </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {characters.map(char => (
                            <div 
                                key={char.id}
                                onClick={() => onSelectCharacter(char)}
                                className="relative rounded-xl overflow-hidden aspect-[3/4] border shadow-lg active:scale-[0.95] transition-transform touch-manipulation cursor-pointer"
                                style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onSelectCharacter(char);
                                    }
                                }}
                            >
                                <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} />
                                <div 
                                  className="absolute inset-0"
                                  style={{
                                    background: 'linear-gradient(to top, var(--bg-primary, rgba(0, 0, 0, 0.9)), transparent)',
                                  }}
                                />
                                <div className="absolute bottom-3 left-3">
                                    <p 
                                      className="font-bold text-sm"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      {char.name}
                                    </p>
                                    <p 
                                      className="text-[10px]"
                                      style={{ color: 'var(--text-tertiary)' }}
                                    >
                                      {char.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scenarios Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 
                           className="text-lg font-bold border-l-4 pl-3"
                           style={{
                             color: 'var(--text-primary)',
                             borderLeftColor: 'var(--color-info, #6366f1)',
                           }}
                         >
                           剧情剧本
                         </h3>
                         <button 
                            onClick={onAddScenario} 
                            className="text-xs px-3 py-2 rounded-full border min-h-[44px] active:scale-95 transition-transform touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                              color: 'var(--color-info, #818cf8)',
                              borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                            }}
                        >
                            + 创建剧本
                         </button>
                    </div>

                    <div className="space-y-3">
                        {scenarios.map(scen => (
                             <div 
                                key={scen.id}
                                onClick={() => onPlayScenario(scen)}
                                className="rounded-xl p-4 active:scale-[0.97] transition-transform touch-manipulation cursor-pointer min-h-[80px] border"
                                style={{
                                  background: scen.id.startsWith('system_script_')
                                    ? 'linear-gradient(to right, var(--bg-info-alpha, rgba(30, 58, 138, 0.5)), var(--bg-accent-alpha, rgba(88, 28, 135, 0.5)))'
                                    : 'var(--bg-card, rgba(17, 24, 39, 1))',
                                  borderColor: scen.id.startsWith('system_script_')
                                    ? 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))'
                                    : 'var(--border-color-overlay, rgba(31, 41, 55, 1))',
                                }}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h4 
                                      className="font-bold flex-1"
                                      style={{ color: 'var(--text-info-light, #c7d2fe)' }}
                                    >
                                      {scen.title}
                                    </h4>
                                    {scen.id.startsWith('system_script_') && (
                                        <span 
                                          className="text-[10px] px-2 py-0.5 rounded-full border ml-2"
                                          style={{
                                            backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                                            color: 'var(--text-info, #a5b4fc)',
                                            borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                                          }}
                                        >
                                          预设
                                        </span>
                                    )}
                                </div>
                                <p 
                                  className="text-xs line-clamp-2"
                                  style={{ color: 'var(--text-disabled)' }}
                                >
                                  {scen.description}
                                </p>
                                <div 
                                  className="flex justify-between items-center mt-3 pt-2 border-t"
                                  style={{ borderTopColor: 'var(--border-color-overlay, rgba(31, 41, 55, 1))' }}
                                >
                                    <span 
                                      className="text-[10px]"
                                      style={{ color: 'var(--text-disabled)' }}
                                    >
                                      By {scen.author}
                                    </span>
                                    <span 
                                      className="text-[10px]"
                                      style={{ color: 'var(--color-info, #818cf8)' }}
                                    >
                                      开始剧情 &rarr;
                                    </span>
                                </div>
                            </div>
                        ))}

                        {scenarios.length === 0 && (
                            <p 
                              className="text-center text-xs py-4"
                              style={{ color: 'var(--text-disabled)' }}
                            >
                              暂无剧情，点击右上角创建。
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};