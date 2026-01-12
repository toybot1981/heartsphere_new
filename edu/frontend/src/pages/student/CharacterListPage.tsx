import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DigitalCharacterList, CharacterRecommendation } from '../../components/digitalHuman';
import { eduApi } from '../../services/api';
import { useCurrentUserId } from '../../hooks/useAuth';
import type { AgeGroup } from '../../types';
import type { EduCharacter } from '../../types/digitalHuman';

export const CharacterListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  const [characters, setCharacters] = useState<EduCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // 从认证系统获取学生ID
  const studentId = useCurrentUserId(1);
  
  useEffect(() => {
    loadCharacters();
  }, [currentPage, ageGroup]);

  const loadCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const ageGroupParam = ageGroup === 'elementary' ? 'primary_6_12' : 'secondary_13_18';
      const result = await eduApi.digitalHuman.getCharacters({
        ageGroup: ageGroupParam,
        isEnabled: true,
        page: currentPage,
        size: 20,
      });
      setCharacters(result.content);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('获取角色列表失败:', err);
      setError(err.message || '获取角色列表失败');
      // 失败时使用空数组，组件会显示空状态
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
              {isElementary ? '👤 我的角色' : '我的角色'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isElementary ? '看看你创造了哪些有趣的角色吧！' : '管理和查看你创建的角色'}
            </p>
          </div>
          <Button 
            ageGroup={ageGroup}
            onClick={() => navigate(`/student/characters/create?ageGroup=${ageGroup}`)}
          >
            {isElementary ? '➕ 创建新角色' : '+ 创建角色'}
          </Button>
        </header>

        {/* 错误提示 */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button 
              ageGroup={ageGroup}
              variant="outline"
              size="sm"
              onClick={loadCharacters}
              className="mt-2"
            >
              {isElementary ? '🔄 重试' : '重试'}
            </Button>
          </div>
        )}

        {/* 角色列表 */}
        <DigitalCharacterList
          characters={characters}
          ageGroup={ageGroup}
          onCharacterClick={(character) => navigate(`/student/characters/${character.id}?ageGroup=${ageGroup}`)}
          loading={loading}
          showStats={true}
          emptyMessage={isElementary ? '来创建你的第一个数字人角色吧！' : '开始创建你的第一个数字人角色'}
        />

        {/* 分页 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              ageGroup={ageGroup}
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              {isElementary ? '← 上一页' : '上一页'}
            </Button>
            <span className="text-sm text-gray-600">
              第 {currentPage + 1} 页 / 共 {totalPages} 页
            </span>
            <Button
              ageGroup={ageGroup}
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              {isElementary ? '下一页 →' : '下一页'}
            </Button>
          </div>
        )}

        {/* 数字人推荐 */}
        {!loading && characters.length > 0 && (
          <div className="mt-12">
            <CharacterRecommendation
              studentId={studentId}
              ageGroup={ageGroup}
              criteria={{
                ageGroup: ageGroup === 'elementary' ? 'primary_6_12' : 'secondary_13_18',
                limit: 6,
                includeHistory: true,
              }}
              onCharacterClick={(characterId) => navigate(`/student/characters/${characterId}?ageGroup=${ageGroup}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
};