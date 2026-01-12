import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick, isActive = false }) => {
  const baseClasses = "transition-colors duration-200 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2";
  
  const activeClasses = isActive
    ? "bg-primary-500 text-white font-semibold"
    : "text-neutral-700 hover:text-primary-500 hover:bg-primary-50";

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      {children}
    </Link>
  );
};

/**
 * 导航组件
 * 响应式导航菜单，支持移动端汉堡菜单
 */
export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/company', label: '首页' },
    { to: '/company/about', label: '关于我们' },
    { to: '/company/product', label: '核心产品' },
    { to: '/company/services', label: 'AI服务' },
    { to: '/company/contact', label: '联系我们' },
  ];

  // 判断当前路径是否激活
  const isActive = (path: string) => {
    if (path === '/company') {
      return location.pathname === '/company' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50" role="navigation" aria-label="主导航">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/company"
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded">
                正心智能
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} isActive={isActive(link.to)}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 rounded-md p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  isActive={isActive(link.to)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
