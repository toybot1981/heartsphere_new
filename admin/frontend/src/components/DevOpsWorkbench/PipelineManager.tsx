import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { DeploymentPipeline, PipelineExecution } from '../../services/api/admin/devops';
import { ProjectSelector, Project } from './ProjectSelector';
import { ProjectPipelineList } from './ProjectPipelineList';
import { PipelineExecutor } from './PipelineExecutor';
import { PipelineHistory } from './PipelineHistory';

type PipelineViewType = 'projects' | 'pipelines' | 'execute' | 'history';

export const PipelineManager: React.FC = () => {
    const [view, setView] = useState<PipelineViewType>('projects');
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState<DeploymentPipeline | null>(null);
    const [currentExecution, setCurrentExecution] = useState<PipelineExecution | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadPipelinesForProject(selectedProject);
        }
    }, [selectedProject]);

    const loadProjects = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const projectIds = await adminApi.devops.getProjects(token);
            const projectList: Project[] = projectIds.map(id => ({
                id,
                name: getProjectName(id),
                description: getProjectDescription(id),
                icon: getProjectIcon(id),
            }));
            setProjects(projectList);
        } catch (error: any) {
            console.error('Failed to load projects', error);
            // 如果 API 失败，使用默认项目列表
            setProjects(getDefaultProjects());
        }
    };

    const getDefaultProjects = (): Project[] => {
        return [
            { id: 'main', name: '主项目', description: '主客户端项目', icon: '📱' },
            { id: 'admin', name: '管理后台', description: '统一管理后台', icon: '⚙️' },
            { id: 'company', name: '公司官网', description: '公司官网项目', icon: '🌐' },
            { id: 'edu', name: '教育版', description: '教育版客户端', icon: '📚' },
            { id: 'mentis', name: 'Mentis', description: 'Mentis 超级智能体', icon: '🤖' },
            { id: 'shared', name: '共享模块', description: '共享代码库', icon: '🔗' },
        ];
    };

    const getProjectName = (id: string): string => {
        const names: Record<string, string> = {
            'main': '主项目',
            'admin': '管理后台',
            'company': '公司官网',
            'edu': '教育版',
            'mentis': 'Mentis',
            'shared': '共享模块',
        };
        return names[id] || id;
    };

    const getProjectDescription = (id: string): string => {
        const descriptions: Record<string, string> = {
            'main': '主客户端项目',
            'admin': '统一管理后台',
            'company': '公司官网项目',
            'edu': '教育版客户端',
            'mentis': 'Mentis 超级智能体',
            'shared': '共享代码库',
        };
        return descriptions[id] || '';
    };

    const getProjectIcon = (id: string): string => {
        const icons: Record<string, string> = {
            'main': '📱',
            'admin': '⚙️',
            'company': '🌐',
            'edu': '📚',
            'mentis': '🤖',
            'shared': '🔗',
        };
        return icons[id] || '📦';
    };

    const loadPipelinesForProject = async (project: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            // 获取该项目的所有流程（包括通用流程，project 为空字符串）
            const data = await adminApi.devops.getPipelines(token, { project });
            setPipelines(data || []);
        } catch (error: any) {
            showAlert('加载流程模板失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project.id);
        setView('pipelines');
    };

    const handleExecute = (pipeline: DeploymentPipeline) => {
        setSelectedPipeline(pipeline);
        setView('execute');
    };

    const handleExecutionStart = (execution: PipelineExecution) => {
        setCurrentExecution(execution);
        setView('execute');
    };

    return (
        <div className="p-6 space-y-6">
            {/* 标签页 */}
            <div className="flex gap-2 border-b border-slate-700">
                <button
                    onClick={() => {
                        setView('projects');
                        setSelectedProject(null);
                        setSelectedPipeline(null);
                        setCurrentExecution(null);
                    }}
                    className={`px-4 py-2 font-medium ${
                        view === 'projects'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    选择项目
                </button>
                {selectedProject && (
                    <button
                        onClick={() => setView('pipelines')}
                        className={`px-4 py-2 font-medium ${
                            view === 'pipelines'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        部署流程
                    </button>
                )}
                <button
                    onClick={() => setView('history')}
                    className={`px-4 py-2 font-medium ${
                        view === 'history'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    执行历史
                </button>
            </div>

            {/* 内容区域 */}
            {view === 'projects' && (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">选择项目</h2>
                    <p className="text-slate-400 mb-6">选择要部署的项目，然后选择对应的部署流程</p>
                    <ProjectSelector
                        projects={projects}
                        onSelect={handleProjectSelect}
                    />
                </div>
            )}

            {view === 'pipelines' && selectedProject && (
                <ProjectPipelineList
                    project={selectedProject}
                    pipelines={pipelines}
                    loading={loading}
                    onExecute={handleExecute}
                    onBack={() => {
                        setView('projects');
                        setSelectedProject(null);
                    }}
                    onRefresh={() => loadPipelinesForProject(selectedProject)}
                />
            )}

            {view === 'execute' && selectedPipeline && (
                <PipelineExecutor
                    pipeline={selectedPipeline}
                    execution={currentExecution}
                    onClose={() => {
                        setSelectedPipeline(null);
                        setCurrentExecution(null);
                        setView('pipelines');
                    }}
                    onExecutionStart={handleExecutionStart}
                />
            )}

            {view === 'history' && (
                <PipelineHistory />
            )}
        </div>
    );
};
