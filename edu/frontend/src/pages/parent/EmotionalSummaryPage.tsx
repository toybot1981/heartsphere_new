import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockEmotionRecords, mockParents, mockStudents } from '../../types/mock';

export const EmotionalSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];
  const childId = currentParent.childrenIds[0];
  const child = mockStudents.find(s => s.id === childId);
  const recentEmotions = mockEmotionRecords.filter(e => e.studentId === childId).slice(0, 7);

  if (!child) {
    return <div>未找到学生信息</div>;
  }

  const emotionStats = recentEmotions.reduce((acc, record) => {
    acc[record.emotion] = (acc[record.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';

  const emotionLabels = {
    happy: '开心',
    sad: '难过',
    anxious: '焦虑',
    frustrated: '沮丧',
    excited: '兴奋',
    calm: '平静',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {child.username} 的情绪健康摘要
          </h1>
          <p className="text-gray-600">查看孩子的情绪健康趋势（不包含详细对话内容）</p>
        </header>

        {/* 重要提示 */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">隐私说明</h3>
              <p className="text-sm text-blue-700">
                为了保护孩子的隐私，这里只显示情绪健康趋势和统计信息，不包含具体的对话内容。
                如果发现严重情绪问题，系统会及时通知您。
              </p>
            </div>
          </div>
        </Card>

        {/* 总体情绪状态 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">最近一周情绪状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-3">
                {dominantEmotion === 'happy' ? '😊' :
                 dominantEmotion === 'sad' ? '😢' :
                 dominantEmotion === 'anxious' ? '😰' :
                 dominantEmotion === 'frustrated' ? '😤' :
                 dominantEmotion === 'excited' ? '🤩' : '😌'}
              </div>
              <p className="text-sm text-gray-600 mb-1">主要情绪</p>
              <p className="text-xl font-semibold">{emotionLabels[dominantEmotion as keyof typeof emotionLabels]}</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-3">
                {recentEmotions.length}
              </div>
              <p className="text-sm text-gray-600 mb-1">情绪记录</p>
              <p className="text-xl font-semibold">本周</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-3">
                {Math.round(recentEmotions.reduce((sum, e) => sum + e.intensity, 0) / recentEmotions.length || 0)}
              </div>
              <p className="text-sm text-gray-600 mb-1">平均强度</p>
              <p className="text-xl font-semibold">1-10分</p>
            </div>
          </div>
        </Card>

        {/* 情绪分布 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">情绪分布</h2>
          <div className="space-y-3">
            {Object.entries(emotionStats).map(([emotion, count]) => {
              const percentage = (count / recentEmotions.length) * 100;
              return (
                <div key={emotion}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {emotionLabels[emotion as keyof typeof emotionLabels]} ({count}次)
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        emotion === 'happy' ? 'bg-yellow-500' :
                        emotion === 'sad' ? 'bg-blue-500' :
                        emotion === 'anxious' ? 'bg-orange-500' :
                        emotion === 'frustrated' ? 'bg-red-500' :
                        emotion === 'excited' ? 'bg-pink-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 情绪趋势 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">情绪趋势（最近7天）</h2>
          <div className="space-y-3">
            {recentEmotions.map((record) => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {record.emotion === 'happy' ? '😊' :
                       record.emotion === 'sad' ? '😢' :
                       record.emotion === 'anxious' ? '😰' :
                       record.emotion === 'frustrated' ? '😤' :
                       record.emotion === 'excited' ? '🤩' : '😌'}
                    </span>
                    <div>
                      <p className="font-medium">{emotionLabels[record.emotion as keyof typeof emotionLabels]}</p>
                      <p className="text-xs text-gray-500">
                        {record.context || '无额外说明'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{record.intensity}/10</p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(record.intensity / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 建议和支持 */}
        <Card className="bg-green-50 border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-900">建议和支持</h2>
          <div className="space-y-3 text-sm text-green-800">
            <div className="flex items-start gap-3">
              <span>💡</span>
              <p>如果发现孩子情绪持续低落或有异常，建议与孩子进行沟通，了解具体情况。</p>
            </div>
            <div className="flex items-start gap-3">
              <span>🤝</span>
              <p>可以鼓励孩子多使用心理辅导功能，帮助孩子管理情绪。</p>
            </div>
            <div className="flex items-start gap-3">
              <span>📞</span>
              <p>如有严重情绪问题，建议咨询专业心理咨询师或学校心理老师。</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};