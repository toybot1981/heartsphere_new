import React from 'react';
import { Button } from '../../components/Button';
import { GameState } from '../../types';
import { WORLD_SCENES } from '../../constants';

interface DashboardViewProps {
    gameState: GameState;
    onResetWorld: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ gameState, onResetWorld }) => {
    const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
    
    const getAllCharacters = () => {
        const list: any[] = [];
        allScenes.forEach(scene => {
            scene.characters.forEach(c => list.push(c));
            const customs = gameState.customCharacters[scene.id] || [];
            customs.forEach(c => list.push(c));
        });
        return list;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-white">1</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Active Scenes</h3>
                <p className="text-3xl font-bold text-indigo-400">{allScenes.length}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Characters</h3>
                <p className="text-3xl font-bold text-pink-400">{getAllCharacters().length}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Scenarios</h3>
                <p className="text-3xl font-bold text-emerald-400">{gameState.customScenarios.length}</p>
            </div>
            
            <div className="col-span-full mt-8 p-6 bg-red-900/10 border border-red-900/50 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="text-red-400 font-bold">危险操作区</h3>
                    <p className="text-red-400/60 text-sm">重置所有数据将无法恢复。</p>
                </div>
                <Button onClick={onResetWorld} className="bg-red-600 hover:bg-red-500 border-none">恢复出厂设置</Button>
            </div>
        </div>
    );
};


