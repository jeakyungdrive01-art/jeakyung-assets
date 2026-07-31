import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getMyDashboardWidgets, setDashboardPreference } from '../../services/dashboardService.js';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const PREPARING = new Set(['approval_status', 'today_schedule', 'week_schedule']);

export default function DashboardPage() {
  const auth = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setWidgets(await getMyDashboardWidgets()); }
    catch { setError('대시보드 구성을 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [auth.activeRole]);

  const hide = async (widget) => {
    await setDashboardPreference(widget.id, { customOrder: widget.display_order, isHidden: true });
    setWidgets((current) => current.map((item) => item.id === widget.id ? { ...item, is_hidden: true } : item));
  };

  const restore = async (widget) => {
    await setDashboardPreference(widget.id, { customOrder: widget.display_order, isHidden: false });
    setWidgets((current) => current.map((item) => item.id === widget.id ? { ...item, is_hidden: false } : item));
  };

  const move = async (widget, direction) => {
    const visible = widgets.filter((item) => !item.is_hidden);
    const index = visible.findIndex((item) => item.id === widget.id);
    const swap = visible[index + direction];
    if (!swap) return;
    await Promise.all([
      setDashboardPreference(widget.id, { customOrder: swap.display_order, isHidden: false }),
      setDashboardPreference(swap.id, { customOrder: widget.display_order, isHidden: false }),
    ]);
    await load();
  };

  return (
    <article className="gw-page" aria-labelledby="page-title">
      <header className="gw-page-header"><div><span className="gw-eyebrow">WORKSPACE</span><h1 id="page-title">대시보드</h1><p>관리자가 배포한 업무 위젯을 내 순서와 표시 설정으로 확인합니다.</p></div><span className="gw-phase-badge">G3 동적 위젯</span></header>
      <ProfileCard />
      {error && <div className="gw-notice gw-notice--warning" role="alert">{error}</div>}
      {loading ? <p className="gw-empty-state" role="status">위젯을 불러오고 있습니다.</p> : (
        <div className="gw-dashboard-grid">
          {widgets.filter((widget) => !widget.is_hidden).map((widget) => (
            <section className={`gw-dashboard-widget gw-dashboard-widget--${widget.size}`} key={widget.id}>
              <div className="gw-dashboard-widget-heading"><div><span>{widget.widget_type.replaceAll('_', ' ')}</span><h2>{widget.title}</h2></div><div className="gw-widget-actions">
                {widget.allow_user_reorder && <><button type="button" onClick={() => move(widget, -1)} aria-label={`${widget.title} 앞으로 이동`}>↑</button><button type="button" onClick={() => move(widget, 1)} aria-label={`${widget.title} 뒤로 이동`}>↓</button></>}
                {widget.allow_user_hide && !widget.is_required && <button type="button" onClick={() => hide(widget)}>숨김</button>}
              </div></div>
              <p>{widget.description}</p>
              {Array.isArray(widget.configuration?.items) && widget.configuration.items.length > 0 && <ul className="gw-widget-posts">{widget.configuration.items.map((item) => <li key={item.id}><Link to={`/boards/${item.board_slug}/posts/${item.id}`}><strong>{item.title}</strong><span>{item.board_name}</span></Link></li>)}</ul>}
              {PREPARING.has(widget.widget_type) && <span className="gw-preparing-label">준비 중</span>}
              {widget.route && (widget.route.startsWith('http') ? <a className="gw-inline-link" href={widget.route} target="_blank" rel="noopener noreferrer">이동하기</a> : <Link className="gw-inline-link" to={widget.route}>이동하기</Link>)}
            </section>
          ))}
          {widgets.every((widget) => widget.is_hidden) && <p className="gw-empty-state">표시 중인 위젯이 없습니다. 관리자에게 문의해 주세요.</p>}
        </div>
      )}
      {!loading && widgets.some((widget) => widget.is_hidden) && <section className="gw-hidden-widgets" aria-labelledby="hidden-widgets-title"><h2 id="hidden-widgets-title">숨긴 위젯</h2>{widgets.filter((widget) => widget.is_hidden).map((widget) => <button type="button" key={widget.id} onClick={() => restore(widget)}>{widget.title} 복원</button>)}</section>}
    </article>
  );
}
