import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockHomework } from '../../types/mock';
import type { AgeGroup } from '../../types';

export const HomeworkDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  const [submission, setSubmission] = useState('');
  const homework = mockHomework.find(hw => hw.id === id);

  if (!homework) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-6`}>
        <Card>
          <p className="mb-4">作业不存在</p>
          <Button ageGroup={ageGroup} onClick={() => navigate(`/student/homework?ageGroup=${ageGroup}`)}>
            返回
          </Button>
        </Card>
      </div>
    );
  }

  const canSubmit = homework.status === 'pending' || homework.status === 'in_progress';
  const isOverdue = homework.dueDate && new Date(homework.dueDate) < new Date();

  const handleSubmit = () => {
    if (!submission.trim()) {
      alert(isElementary ? '请填写作业内容！' : '请填写作业内容');
      return;
    }
    console.log('提交作业:', { homeworkId: homework.id, submission });
    alert(isElementary ? '作业提交成功！' : '作业提交成功');
    navigate(`/student/homework?ageGroup=${ageGroup}`);
  };

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => navigate(`/student/homework?ageGroup=${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
                {homework.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>布置时间：{new Date(homework.createdAt).toLocaleDateString('zh-CN')}</span>
                {homework.dueDate && (
                  <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                    截止：{new Date(homework.dueDate).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>
            {homework.grade !== undefined && (
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">{homework.grade}</div>
                <div className="text-sm text-gray-600">分</div>
              </div>
            )}
          </div>
        </header>

        {/* 作业内容 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '📝 作业内容' : '作业内容'}
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
          </div>
        </Card>

        {/* 提交区域 */}
        {canSubmit ? (
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '✏️ 提交作业' : '提交作业'}
            </h2>
            {isOverdue && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ {isElementary ? '作业已过期，但还可以提交' : '作业已过期，但您仍可以提交'}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isElementary ? '作业答案' : '作业答案 *'}
                </label>
                <textarea
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder={isElementary ? '在这里写下你的答案...' : '请输入作业答案'}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>
              
              {isElementary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    💡 <strong>小贴士：</strong> 如果遇到困难，可以点击"AI助手"按钮，让AI帮助你理解题目，但不要直接抄袭答案哦！
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  ageGroup={ageGroup}
                  variant="outline"
                  onClick={() => navigate(`/student/ai-chat?ageGroup=${ageGroup}&homeworkId=${homework.id}`)}
                  className="flex-1"
                >
                  {isElementary ? '🤖 AI助手' : 'AI助手'}
                </Button>
                <Button 
                  ageGroup={ageGroup}
                  onClick={handleSubmit}
                  disabled={!submission.trim()}
                  className="flex-1"
                >
                  {isElementary ? '📤 提交作业' : '提交作业'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* 已提交的作业显示 */}
            {homework.submission && (
              <Card className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isElementary ? '📝 我的提交' : '我的提交'}
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap font-mono text-sm">{homework.submission}</p>
                </div>
                {homework.submittedAt && (
                  <p className="text-sm text-gray-500 mt-3">
                    提交时间：{new Date(homework.submittedAt).toLocaleString('zh-CN')}
                  </p>
                )}
              </Card>
            )}

            {/* 老师反馈 */}
            {homework.feedback && (
              <Card>
                <h2 className="text-xl font-semibold mb-4">
                  {isElementary ? '👨‍🏫 老师反馈' : '老师反馈'}
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 whitespace-pre-wrap">{homework.feedback}</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};