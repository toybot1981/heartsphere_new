import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { InteractionHistory, LearningProgress } from '../../components/digitalHuman';
import { eduApi } from '../../services/api';
import { useCurrentUserId } from '../../hooks/useAuth';
import type { AgeGroup } from '../../types';
import type { EduCharacter } from '../../types/digitalHuman';

export const CharacterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  
  const [character, setCharacter] = useState<EduCharacter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 从认证系统获取学生ID
  const studentId = useCurrentUserId(1);
  
  useEffect(() => {
    if (id) {
      loadCharacter();
    }
  }, [id]);

  const loadCharacter = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const characterId = parseInt(id, 10);
      const data = await eduApi.digitalHuman.getCharacterById(characterId);
      setCharacter(data);
    } catch (err: any) {
      console.error('获取角色详情失败:', err);
      setError(err.message || '获取角色详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isElementary ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100'} p-6`}>
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card>
          <p className="mb-4 text-red-600">{error || '角色不存在'}</p>
          <Button ageGroup={ageGroup} onClick={() => navigate(`/student/characters?ageGroup=${ageGroup}`)}>
            {isElementary ? '← 返回' : '返回'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isElementary ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => navigate(`/student/characters?ageGroup=${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-6xl overflow-hidden">
              {character.avatarUrl ? (
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
                {character.name}
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                {character.characterType === 'teaching_assistant' ? (isElementary ? '📚 教学助手' : '教学助手') :
                 character.characterType === 'learning_companion' ? (isElementary ? '👥 学习伙伴' : '学习伙伴') :
                 character.characterType === 'counseling' ? (isElementary ? '💚 心理辅导' : '心理辅导') :
                 character.characterType === 'homework_helper' ? (isElementary ? '✏️ 作业辅导' : '作业辅导') :
                 character.characterType === 'subject_explainer' ? (isElementary ? '📖 学科讲解' : '学科讲解') :
                 character.characterType}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>创建时间：{new Date(character.createdAt).toLocaleDateString('zh-CN')}</span>
                {character.totalInteractions !== undefined && character.totalInteractions > 0 && (
                  <>
                    <span>•</span>
                    <span>互动 {character.totalInteractions} 次</span>
                  </>
                )}
                {character.averageRating !== undefined && character.averageRating > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-500">
                      {'★'.repeat(Math.round(character.averageRating))}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Button 
              ageGroup={ageGroup}
              onClick={() => navigate(`/student/ai-chat?ageGroup=${ageGroup}&characterId=${character.id}`)}
            >
              {isElementary ? '💬 开始对话' : '开始对话'}
            </Button>
          </div>
        </header>

        {/* 角色信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '📝 角色描述' : '角色描述'}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {character.description || '暂无描述'}
            </p>
            {character.bio && (
              <>
                <h3 className="text-lg font-semibold mb-2 mt-4">
                  {isElementary ? '📖 角色简介' : '角色简介'}
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">{character.bio}</p>
              </>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '🏷️ 角色标签' : '角色标签'}
            </h2>
            <div className="space-y-3">
              {character.subjectTags && character.subjectTags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">学科标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {character.subjectTags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {character.ageGroupSuitability && character.ageGroupSuitability.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">适用年龄段：</p>
                  <div className="flex flex-wrap gap-2">
                    {character.ageGroupSuitability.map((age, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        {age === 'primary_6_12' ? '小学（6-12岁）' : '中学（13-18岁）'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {character.difficultyLevel && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">难度等级：</p>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                    {character.difficultyLevel === 'beginner' ? '初级' :
                     character.difficultyLevel === 'intermediate' ? '中级' : '高级'}
                  </span>
                </div>
              )}

              {character.languageStyle && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">语言风格：</p>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                    {character.languageStyle === 'formal' ? '正式' :
                     character.languageStyle === 'casual' ? '随意' : '友好'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 操作按钮 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '⚙️ 操作' : '操作'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              ageGroup={ageGroup}
              onClick={() => navigate(`/student/ai-chat?ageGroup=${ageGroup}&characterId=${character.id}`)}
              className="w-full"
            >
              {isElementary ? '💬 开始对话' : '开始对话'}
            </Button>
            <Button 
              ageGroup={ageGroup}
              variant="outline"
              onClick={() => navigate(`/student/characters/create?ageGroup=${ageGroup}&template=${character.id}`)}
              className="w-full"
            >
              {isElementary ? '📋 复制角色' : '复制角色'}
            </Button>
          </div>
        </Card>

        {/* 互动历史 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '📝 互动历史' : '互动历史'}
          </h2>
          <InteractionHistory
            studentId={studentId}
            characterId={character.id}
            ageGroup={ageGroup}
            limit={5}
            showPagination={false}
            onInteractionClick={(interaction) => {
              // TODO: 导航到互动详情页面
              console.log('查看互动详情:', interaction);
            }}
          />
        </Card>

        {/* 学习进度 */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '📊 学习进度' : '学习进度'}
          </h2>
          <LearningProgress
            studentId={studentId}
            characterId={character.id}
            ageGroup={ageGroup}
            days={30}
          />
        </Card>
      </div>
    </div>
  );
};