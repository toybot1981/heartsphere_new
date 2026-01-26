import React from 'react';
import { WorldScene } from '../types';

interface MobileSceneSelectionProps {
    scenes: WorldScene[];
    onSelectScene: (sceneId: string) => void;
    onCreateScene: () => void;
}

export const MobileSceneSelection: React.FC<MobileSceneSelectionProps> = ({ scenes, onSelectScene, onCreateScene }) => {
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
          style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
        >
            <div 
              className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] shrink-0 backdrop-blur-md z-10 border-b flex justify-between items-center"
              style={{
                backgroundColor: 'var(--bg-primary, rgba(0, 0, 0, 0.8))',
                borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
              }}
            >
                <h1 
                  className="text-xl font-bold"
                  style={{
                    background: 'var(--gradient-text-primary, linear-gradient(to right, var(--color-pink, #f472b6), var(--color-primary, #c084fc)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  选择场景
                </h1>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  共 {uniqueScenes.length} 个场景
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex flex-col gap-6 p-4">
                    {uniqueScenes.map(scene => (
                        <div 
                            key={scene.id} 
                            onClick={() => onSelectScene(scene.id)}
                            className="relative h-48 w-full rounded-2xl overflow-hidden group border shadow-lg active:scale-[0.97] transition-transform touch-manipulation cursor-pointer"
                            style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onSelectScene(scene.id);
                                }
                            }}
                        >
                            <img src={scene.imageUrl} alt={scene.name} className="w-full h-full object-cover" />
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(to top, var(--bg-overlay-alpha), transparent)',
                              }}
                            />
                            
                            <div className="absolute bottom-0 left-0 w-full p-5">
                                <h3 
                                  className="text-2xl font-bold mb-1 shadow-black drop-shadow-md"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {scene.name}
                                </h3>
                                <p 
                                  className="text-xs line-clamp-2 opacity-90"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {scene.description}
                                </p>
                            </div>
                            
                            <div 
                              className="absolute top-4 right-4 backdrop-blur-md px-2 py-1 rounded-full border text-[10px]"
                              style={{
                                backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.4))',
                                borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                                color: 'var(--text-primary)',
                              }}
                            >
                                进入 &rarr;
                            </div>
                        </div>
                    ))}

                    {/* Create New Scene Card */}
                    <button 
                        onClick={onCreateScene}
                        className="h-24 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] touch-manipulation min-h-[96px]"
                        style={{
                          borderColor: 'var(--border-color-overlay, rgba(55, 65, 81, 1))',
                          color: 'var(--text-disabled)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-accent-alpha, rgba(236, 72, 153, 0.5))';
                          e.currentTarget.style.color = 'var(--color-pink, #ec4899)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(55, 65, 81, 1))';
                          e.currentTarget.style.color = 'var(--text-disabled)';
                        }}
                    >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold"
                          style={{ backgroundColor: 'var(--bg-card, rgba(31, 41, 55, 1))' }}
                        >
                          +
                        </div>
                        <span className="text-sm font-bold">创造新场景</span>
                    </button>
                </div>
            </div>
        </div>
    );
};