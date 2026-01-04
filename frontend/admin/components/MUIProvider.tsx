import React, { cache } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// 创建 emotion cache
const muiCache = createCache({
  key: 'mui',
  prepend: true,
});

interface MUIProviderProps {
  children: React.ReactNode;
}

/**
 * MUI Provider - 为 MUI 组件提供 emotion cache
 */
export const MUIProvider: React.FC<MUIProviderProps> = ({ children }) => {
  return <CacheProvider value={muiCache}>{children}</CacheProvider>;
};
