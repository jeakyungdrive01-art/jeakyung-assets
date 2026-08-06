import { useEffect, useState } from 'react';

import { approvalService } from '../../services/approvalService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const localDateTime = (offsetHours = 0) => {
  const date = new Date(Date.now() + offsetHours * 3600000 - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};

export default function ApprovalDelegationsPage() {
  const auth = useAuth();
  const [catalog, setCatalog] = useState({ users: [], templates: [] });
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ delegateUserId: '', scopeType: 'all', templateId: '', startsAt: localDateTime(), endsAt: localDateTime(24 * 7), reason: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => { const [nextCatalog, delegations] = await Promise.all([approvalService.getAuthoringCatalog(), approvalService.getDelegations()]); setCatalog(nextCatalog); setItems(delegations); };
  useEffect(() => { load().catch((error) => setStatus(error?.message ?? '위임 정보를 불러오지 못했습니다.')); }, []);
  const users = catalog.users.filter((user) => user.id !== auth.user?.id && `${user.name} ${user.department_name ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 10);
  const save = async (event) => { event.preventDefault(); if (!form.delegateUserId) { setStatus('위임받을 사람을 선택해 주세요.'); return; } setBusy(true); setStatus(''); try { await approvalService.createDelegation({ ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() }); setForm({ ...form, delegateUserId: '', reason: '' }); setSearch(''); await load(); setStatus('결재 위임을 등록했습니다.'); } catch (error) { setStatus(error?.message ?? '결재 위임을 등록하지 못했습니다.'); } finally { setBusy(false); } };
  return <article className="gw-approval-page" aria-labelledby="delegation-title"><header className="gw-approval-heading"><div><span className="gw-eyebrow">DELEGATION</span><h1 id="delegation-title">대결·위임 관리</h1><p>부재 기간 동안 내 결재 업무를 지정한 직원에게 안전하게 위임합니다.</p></div></header><div className="gw-approval-admin-layout"><section className="gw-approval-card"><h2>등록한 위임</h2><div className="gw-delegation-list">{items.map((item) => <article key={item.id}><div><strong>{item.delegate_name}</strong><span>{item.scope_type === 'all' ? '전체 결재' : `${item.template_name} 양식`} · {delegationStatus(item)}</span><time>{new Date(item.starts_at).toLocaleString('ko-KR')} ~ {new Date(item.ends_at).toLocaleString('ko-KR')}</time></div>{['scheduled','active'].includes(item.status) && <button type="button" onClick={async () => { const reason = window.prompt('위임 해제 사유를 입력하세요.') ?? ''; if (reason.trim().length < 2) return; await approvalService.revokeDelegation(item.id, reason); await load(); }}>해제</button>}</article>)}</div>{items.length === 0 && <p className="gw-empty-state">등록한 위임이 없습니다.</p>}</section><form className="gw-approval-card gw-credential-form" onSubmit={save}><h2>새 위임 등록</h2><label className="gw-field"><span>위임받을 사람 조회</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이름 또는 부서" /></label>{search && <div className="gw-approver-results">{users.map((user) => <button type="button" className={form.delegateUserId === user.id ? 'is-selected' : ''} key={user.id} onClick={() => { setForm({ ...form, delegateUserId: user.id }); setSearch(user.name); }}><strong>{user.name}</strong><span>{user.department_name ?? '소속 미등록'} · {user.position_name ?? '직급 미등록'}</span></button>)}</div>}<label className="gw-field"><span>위임 범위</span><select value={form.scopeType} onChange={(event) => setForm({ ...form, scopeType: event.target.value })}><option value="all">전체 결재</option><option value="template">특정 양식</option></select></label>{form.scopeType === 'template' && <label className="gw-field"><span>결재 양식</span><select required value={form.templateId} onChange={(event) => setForm({ ...form, templateId: event.target.value })}><option value="">선택</option>{catalog.templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<div className="gw-admin-form-grid"><label className="gw-field"><span>시작</span><input type="datetime-local" required value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label><label className="gw-field"><span>종료</span><input type="datetime-local" required value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></label></div><label className="gw-field"><span>위임 사유</span><textarea required minLength="2" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label><button className="gw-primary-button" disabled={busy}>{busy ? '등록 중…' : '위임 등록'}</button></form></div>{status && <p className="gw-form-status" role="status">{status}</p>}</article>;
}

function delegationStatus(item) {
  if (item.status === 'revoked') return '해제됨';
  if (new Date(item.ends_at) < new Date()) return '종료';
  if (new Date(item.starts_at) > new Date()) return '예약';
  return '진행 중';
}
