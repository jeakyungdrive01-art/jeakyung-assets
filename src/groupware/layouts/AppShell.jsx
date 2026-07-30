import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import GroupwareBrand from '../components/GroupwareBrand.jsx';
import NavigationIcon from '../components/NavigationIcon.jsx';
import { GROUPWARE_NAVIGATION, getRouteTitle } from '../config/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';

const MOBILE_QUERY = '(max-width: 1023px)';

export default function AppShell() {
  const auth = useAuth();
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const firstMenuRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  const visibleNavigation = useMemo(
    () => GROUPWARE_NAVIGATION.filter((item) => !item.requiredPermission || auth.permissions.includes(item.requiredPermission)),
    [auth.permissions],
  );

  const closeDrawer = ({ restoreFocus = false } = {}) => {
    setDrawerOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    window.requestAnimationFrame(() => firstMenuRef.current?.focus());
  };

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setDrawerOpen(false);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDrawer({ restoreFocus: true });
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (isMobile) setDrawerOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.body.classList.toggle('gw-drawer-open', isMobile && drawerOpen);
    return () => document.body.classList.remove('gw-drawer-open');
  }, [drawerOpen, isMobile]);

  const sidebarHidden = isMobile && !drawerOpen;

  return (
    <div className={`gw-app-shell${collapsed ? ' gw-app-shell--collapsed' : ''}`}>
      <a className="gw-skip-link" href="#groupware-content">본문으로 바로가기</a>
      <aside
        className={`gw-sidebar${drawerOpen ? ' is-open' : ''}`}
        aria-label="그룹웨어 주요 메뉴"
        aria-hidden={sidebarHidden || undefined}
        inert={sidebarHidden}
      >
        <div className="gw-sidebar-header">
          <GroupwareBrand compact={collapsed} />
          <button className="gw-drawer-close" type="button" onClick={() => closeDrawer({ restoreFocus: true })} aria-label="메뉴 닫기">×</button>
        </div>
        <nav className="gw-sidebar-nav" id="groupware-navigation">
          {visibleNavigation.map((item, index) => (
            <NavLink
              className={({ isActive }) => `gw-nav-link${isActive ? ' is-active' : ''}`}
              key={item.key}
              ref={index === 0 ? firstMenuRef : undefined}
              to={item.path}
              title={collapsed ? item.label : undefined}
              onClick={() => isMobile && closeDrawer()}
            >
              <NavigationIcon name={item.key} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="gw-sidebar-footer">
          <p><strong>연동 준비 단계</strong><span>실제 인증과 데이터는 연결되지 않았습니다.</span></p>
          <button className="gw-collapse-button" type="button" onClick={() => setCollapsed((current) => !current)} aria-pressed={collapsed}>
            <span aria-hidden="true">{collapsed ? '→' : '←'}</span>
            <span>{collapsed ? '펼치기' : '사이드바 접기'}</span>
          </button>
        </div>
      </aside>

      {isMobile && drawerOpen && <button className="gw-drawer-overlay" type="button" tabIndex="-1" aria-label="메뉴 닫기" onClick={() => closeDrawer({ restoreFocus: true })} />}

      <div className="gw-workspace">
        <header className="gw-topbar">
          <div className="gw-topbar-title">
            <button ref={menuButtonRef} className="gw-menu-button" type="button" aria-expanded={drawerOpen} aria-controls="groupware-navigation" aria-label={drawerOpen ? '메뉴 닫기' : '메뉴 열기'} onClick={drawerOpen ? () => closeDrawer({ restoreFocus: true }) : openDrawer}>
              <span aria-hidden="true">☰</span>
            </button>
            <div><span>현재 위치</span><strong>{getRouteTitle(location.pathname)}</strong></div>
          </div>
          <div className="gw-topbar-tools" aria-label="준비 중인 업무 도구">
            <button type="button" disabled title="검색 기능은 추후 제공됩니다"><span aria-hidden="true">⌕</span><span className="gw-tool-label">검색</span></button>
            <button type="button" disabled title="알림 기능은 추후 제공됩니다"><span aria-hidden="true">♢</span><span className="gw-tool-label">알림</span></button>
            <button type="button" disabled title="사용자 메뉴는 인증 연동 후 제공됩니다"><span aria-hidden="true">○</span><span className="gw-tool-label">사용자</span></button>
          </div>
        </header>
        <main className="gw-content" id="groupware-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
