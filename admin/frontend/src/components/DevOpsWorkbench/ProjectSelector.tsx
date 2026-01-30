import React from 'react';

export interface Project {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

interface ProjectSelectorProps {
    projects: Project[];
    onSelect: (project: Project) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <div
                    key={project.id}
                    onClick={() => onSelect(project)}
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 hover:bg-slate-750 cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-4 mb-3">
                        {project.icon && (
                            <div className="text-4xl">{project.icon}</div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-white">{project.name}</h3>
                            <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-500">点击选择 →</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
