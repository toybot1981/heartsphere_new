import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const TimeControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [dailyLimit, setDailyLimit] = useState(120); // 分钟
  const [enableTimeLimit, setEnableTimeLimit] = useState(true);
  const [timeRestrictions, setTimeRestrictions] = useState({
    weekdays: { enabled: true, start: '08:00', end: '20:00' },
    weekends: { enabled: false, start: '09:00', end: '21:00' },
  });

  const handleSave = () => {
    console.log('保存时间设置:', { dailyLimit, enableTimeLimit, timeRestrictions });
    alert('设置已保存');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">时间管理</h1>
          <p className="text-gray-600">设置孩子的平台使用时长和时间段</p>
        </header>

        {/* 每日使用时长限制 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">每日使用时长限制</h2>
              <p className="text-sm text-gray-600">设置孩子每天可以使用平台的最长时间</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableTimeLimit}
                onChange={(e) => setEnableTimeLimit(e.target.checked)}
                className="w-5 h-5 mr-2"
              />
              <span className="text-sm font-medium">启用限制</span>
            </label>
          </div>
          
          {enableTimeLimit && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">每日时长：</label>
                <input
                  type="range"
                  min="30"
                  max="240"
                  step="30"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-24 text-right font-semibold text-lg">{dailyLimit} 分钟</div>
              </div>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>30分钟</span>
                <span className="ml-auto">240分钟</span>
              </div>
            </div>
          )}
        </Card>

        {/* 时间段限制 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">允许使用时间段</h2>
          
          {/* 工作日 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">工作日</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeRestrictions.weekdays.enabled}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekdays: { ...timeRestrictions.weekdays, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">启用</span>
              </label>
            </div>
            {timeRestrictions.weekdays.enabled && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">时间范围：</label>
                <input
                  type="time"
                  value={timeRestrictions.weekdays.start}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekdays: { ...timeRestrictions.weekdays, start: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span>至</span>
                <input
                  type="time"
                  value={timeRestrictions.weekdays.end}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekdays: { ...timeRestrictions.weekdays, end: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* 周末 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">周末</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeRestrictions.weekends.enabled}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekends: { ...timeRestrictions.weekends, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">启用</span>
              </label>
            </div>
            {timeRestrictions.weekends.enabled && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">时间范围：</label>
                <input
                  type="time"
                  value={timeRestrictions.weekends.start}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekends: { ...timeRestrictions.weekends, start: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span>至</span>
                <input
                  type="time"
                  value={timeRestrictions.weekends.end}
                  onChange={(e) => setTimeRestrictions({
                    ...timeRestrictions,
                    weekends: { ...timeRestrictions.weekends, end: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </Card>

        {/* 当前使用情况 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">今日使用情况</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">已使用时长</span>
                <span className="text-sm font-semibold text-orange-600">45 分钟</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '37.5%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">剩余：{dailyLimit - 45} 分钟</p>
            </div>
          </div>
        </Card>

        {/* 保存按钮 */}
        <div className="flex gap-4">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="flex-1"
          >
            取消
          </Button>
          <Button 
            ageGroup="middle"
            onClick={handleSave}
            className="flex-1"
          >
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
};