/**
 * Mobile版本共享配置步骤1：选择共享范围
 */

import React, { memo } from 'react';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileCardStyles, MobileColors, MobileTypography, MobileSpacing } from '../MobileStyleGuide';
import type { ShareType, ShareScope } from '../../hooks/useShareConfig';
import type { World } from '../../../services/api/world/types';
import type { UserEra } from '../../../services/api/scene/types';

interface MobileShareConfigStep1Props {
  shareType: ShareType;
  setShareType: (type: ShareType) => void;
  selectedScopes: ShareScope[];
  setSelectedScopes: (scopes: ShareScope[]) => void;
  worlds: World[];
  eras: UserEra[];
  loading: boolean;
}

/**
 * Mobile版本共享范围选择步骤
 */
export const MobileShareConfigStep1: React.FC<MobileShareConfigStep1Props> = memo(({
  shareType,
  setShareType,
  selectedScopes,
  setSelectedScopes,
  worlds,
  eras,
  loading,
}) => {
  const handleScopeToggle = (scopeType: 'world' | 'era', scopeId: number) => {
    const index = selectedScopes.findIndex(
      s => s.scopeType === scopeType && s.scopeId === scopeId
    );

    if (index >= 0) {
      setSelectedScopes(selectedScopes.filter((_, i) => i !== index));
    } else {
      setSelectedScopes([...selectedScopes, { scopeType, scopeId }]);
    }
  };

  const handleShareTypeChange = (type: ShareType) => {
    setShareType(type);
    // 切换类型时，只保留匹配的类型选择
    if (type === 'world') {
      setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'world'));
    } else if (type === 'era') {
      setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'era'));
    }
  };

  return (
    <div className={`space-y-4 ${MobileSpacing.padding.md}`}>
      <h3 className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary} mb-4`}>
        选择共享范围
      </h3>

      {/* 全部共享 */}
      <div
        className={`${MobileCardStyles.default} p-4 cursor-pointer transition-all ${
          shareType === 'all'
            ? 'border-purple-500/50 bg-purple-500/10'
            : 'hover:border-purple-500/30'
        } ${MobileCardStyles.interactive}`}
        onClick={() => handleShareTypeChange('all')}
        role="button"
        aria-label="全部共享"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleShareTypeChange('all');
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
              shareType === 'all' ? 'border-purple-500 bg-purple-500' : 'border-slate-600 bg-transparent'
            }`}
          >
            {shareType === 'all' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                全部共享
              </span>
              <span className={`${MobileTypography.fontSize.xs} px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded`}>
                ⭐推荐
              </span>
            </div>
            <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
              共享所有世界和场景
            </p>
            <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
              适合：完全开放的心域
            </p>
          </div>
        </div>
      </div>

      {/* 按世界共享 */}
      <div
        className={`${MobileCardStyles.default} p-4 cursor-pointer transition-all ${
          shareType === 'world'
            ? 'border-purple-500/50 bg-purple-500/10'
            : 'hover:border-purple-500/30'
        } ${MobileCardStyles.interactive}`}
        onClick={() => handleShareTypeChange('world')}
        role="button"
        aria-label="按世界共享"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleShareTypeChange('world');
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
              shareType === 'world' ? 'border-purple-500 bg-purple-500' : 'border-slate-600 bg-transparent'
            }`}
          >
            {shareType === 'world' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                按世界共享
              </span>
              <span className={`${MobileTypography.fontSize.xs} px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded`}>
                ⭐推荐
              </span>
            </div>
            <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
              选择要共享的世界
            </p>

            {shareType === 'world' && (
              <div className={`mt-4 space-y-2 ${MobileSpacing.padding.xs}`}>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <MobileLoadingSpinner size="sm" />
                  </div>
                ) : worlds.length === 0 ? (
                  <div className={`text-center py-4 ${MobileTypography.fontSize.sm} ${MobileColors.text.muted}`}>
                    暂无世界
                  </div>
                ) : (
                  worlds.map(world => (
                    <label
                      key={world.id}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        selectedScopes.some(s => s.scopeType === 'world' && s.scopeId === world.id)
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.scopeType === 'world' && s.scopeId === world.id)}
                        onChange={() => handleScopeToggle('world', world.id)}
                        className="w-5 h-5 text-purple-500 rounded border-slate-600 focus:ring-purple-500 focus:ring-2"
                        aria-label={`选择世界：${world.name}`}
                      />
                      <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary} flex-1`}>
                        {world.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 按场景共享 */}
      <div
        className={`${MobileCardStyles.default} p-4 cursor-pointer transition-all ${
          shareType === 'era'
            ? 'border-purple-500/50 bg-purple-500/10'
            : 'hover:border-purple-500/30'
        } ${MobileCardStyles.interactive}`}
        onClick={() => handleShareTypeChange('era')}
        role="button"
        aria-label="按场景共享"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleShareTypeChange('era');
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
              shareType === 'era' ? 'border-purple-500 bg-purple-500' : 'border-slate-600 bg-transparent'
            }`}
          >
            {shareType === 'era' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                按场景共享
              </span>
            </div>
            <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
              精确选择要共享的场景
            </p>

            {shareType === 'era' && (
              <div className={`mt-4 space-y-2 ${MobileSpacing.padding.xs}`}>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <MobileLoadingSpinner size="sm" />
                  </div>
                ) : eras.length === 0 ? (
                  <div className={`text-center py-4 ${MobileTypography.fontSize.sm} ${MobileColors.text.muted}`}>
                    暂无场景
                  </div>
                ) : (
                  eras.map(era => (
                    <label
                      key={era.id}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        selectedScopes.some(s => s.scopeType === 'era' && s.scopeId === era.id)
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.scopeType === 'era' && s.scopeId === era.id)}
                        onChange={() => handleScopeToggle('era', era.id)}
                        className="w-5 h-5 text-purple-500 rounded border-slate-600 focus:ring-purple-500 focus:ring-2"
                        aria-label={`选择场景：${era.name}`}
                      />
                      <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary} flex-1`}>
                        {era.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 选择统计 */}
      {shareType !== 'all' && (
        <div className={`${MobileCardStyles.default} p-3 ${MobileSpacing.margin.top.sm}`}>
          <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} text-center`}>
            已选择 {selectedScopes.filter(s => s.scopeType === shareType).length} 个
            {shareType === 'world' ? '世界' : '场景'}
          </p>
        </div>
      )}
    </div>
  );
});

MobileShareConfigStep1.displayName = 'MobileShareConfigStep1';
