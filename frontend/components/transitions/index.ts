/**
 * 页面切换特效系统
 * 提供多种页面切换特效，特别支持穿越感效果
 */

export {
  PageTransition,
  TransitionWrapper,
  type PageTransitionProps,
  type PageTransitionConfig,
  type TransitionType,
} from './PageTransitionSystem';

export {
  SharedHeartSphereTransition,
  SharedHeartSphereWrapper,
  type SharedHeartSphereTransitionProps,
  type SharedHeartSphereWrapperProps,
} from './SharedHeartSphereTransition';

export {
  usePageTransition,
  useGlobalPageTransition,
  pageTransitionManager,
  type TransitionState,
} from '../../hooks/usePageTransition';
