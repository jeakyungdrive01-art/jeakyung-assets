import { useEffect, useMemo, useState } from 'react';

import { deleteOrArchiveBoard, getBoardAdminCatalog, previewBoardPermissions, saveBoardDefinition, saveBoardGroup } from '../../services/boardService.js';

const ACTIONS = ['sidebar_view','list_read','detail_read','post_create','own_post_update','own_post_delete','other_post_update','other_post_delete','comment_create','own_comment_update','own_comment_delete','other_comment_update','other_comment_delete','attachment_view','attachment_download','attachment_upload','notice_manage','pin_manage','category_manage','permission_manage','board_setting_manage','archive_manage','board_delete'];
const TYPES = ['general','notice','files','anonymous','qna','gallery','project','department','free','custom'];
const MANAGEMENT_ACTIONS = new Set(['permission_manage','board_setting_manage','archive_manage','board_delete']);
const SETTINGS = { show_in_sidebar: true, allow_comments: true, allow_replies: true, allow_attachments: false, allow_images: false, allow_anonymous: false, allow_notices: true, allow_important: true, show_views: true, allow_reactions: false, show_post_number: true, search_enabled: true, use_prefix: false, use_pinned: true, department_only: false, page_size: 20, default_sort: 'latest', max_file_size_mb: 20 };
const EMPTY = { name: '', slug: '', description: '', board_type: 'general', group_id: '', sort_order: 100, is_active: true, archived: false, settings: SETTINGS };
const EMPTY_RULE = { action: 'sidebar_view', target_type: 'all', target_id: '', effect: 'allow' };
const EMPTY_GROUP = { name: '', code: '', description: '', sort_order: 100, is_active: true };

export default function BoardBuilderPanel({ directory }) {
  const [catalog, setCatalog] = useState({ groups: [], boards: [], categories: [], rules: [], managers: [], users: [] });
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState('');
  const [rules, setRules] = useState([{ ...EMPTY_RULE }, ...['list_read','detail_read'].map((action) => ({ ...EMPTY_RULE, action }))]);
  const [rule, setRule] = useState(EMPTY_RULE);
  const [managers, setManagers] = useState([]);
  const [group, setGroup] = useState(EMPTY_GROUP);
  const [previewUser, setPreviewUser] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const load = () => getBoardAdminCatalog().then(setCatalog).catch(() => setStatus('게시판 관리 데이터를 불러오지 못했습니다.'));
  useEffect(() => { load(); }, []);

  const targetOptions = useMemo(() => {
    if (rule.target_type === 'role') return directory.roles.map((item) => ({ id: item.code, name: item.name }));
    if (rule.target_type === 'department') return directory.departments;
    if (rule.target_type === 'position') return directory.positions;
    if (rule.target_type === 'job_title') return directory.jobTitles;
    if (rule.target_type === 'user') return catalog.users;
    return [];
  }, [catalog.users, directory, rule.target_type]);

  const selectBoard = (board) => {
    setForm({ ...board, archived: Boolean(board.archived_at), settings: { ...SETTINGS, ...(board.settings ?? {}) } });
    setCategories(catalog.categories.filter((item) => item.board_id === board.id).map((item) => item.name).join(', '));
    setRules(catalog.rules.filter((item) => item.board_id === board.id).map(({ action, target_type, target_id, effect }) => ({ action, target_type, target_id: target_id ?? '', effect })));
    setManagers(catalog.managers.filter((item) => item.board_id === board.id).map((item) => item.user_id));
    setPreview(null);
  };

  const addRule = () => {
    const noTarget = ['all','board_manager','author'].includes(rule.target_type);
    if (!noTarget && !rule.target_id) { setStatus('권한 대상을 선택해 주세요.'); return; }
    setRules((current) => [...current, { ...rule, target_id: noTarget ? '' : rule.target_id }]);
    setRule(EMPTY_RULE);
  };

  const submit = async (event) => {
    event.preventDefault();
    const risky = rules.some((item) => item.effect === 'allow' && item.target_type === 'all' && MANAGEMENT_ACTIONS.has(item.action));
    const message = risky ? '전체 사용자에게 관리 권한이 포함됩니다. 정말 저장하시겠습니까?' : '게시판 설정·카테고리·관리자·권한 규칙을 저장하시겠습니까?';
    if (!window.confirm(message)) return;
    const categoryList = categories.split(',').map((name) => name.trim()).filter(Boolean).map((name, index) => ({ name, code: `category-${index + 1}`, sort_order: index * 10 }));
    try {
      await saveBoardDefinition(form, rules, categoryList, managers);
      setStatus('게시판 설정과 권한을 저장했습니다.'); setForm(EMPTY); setCategories(''); setRules([{ ...EMPTY_RULE }]); setManagers([]); await load();
    } catch { setStatus('게시판을 저장하지 못했습니다. slug, 대상과 관리 권한을 확인해 주세요.'); }
  };

  const saveGroup = async (event) => {
    event.preventDefault();
    try { await saveBoardGroup(group); setGroup(EMPTY_GROUP); setStatus('게시판 그룹을 저장했습니다.'); await load(); }
    catch { setStatus('그룹을 저장하지 못했습니다. 코드 중복과 최고 관리자 권한을 확인해 주세요.'); }
  };

  const updateSetting = (key, value) => setForm((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  return <section className="gw-admin-section" aria-labelledby="board-builder-title">
    <div className="gw-admin-section-heading"><div><span className="gw-eyebrow">BOARD BUILDER</span><h2 id="board-builder-title">게시판 빌더</h2><p>공통 엔진의 그룹·설정·관리자·세부 권한을 구성합니다.</p></div><span className="gw-count-badge">{catalog.boards.length}개</span></div>
    <div className="gw-builder-layout"><div className="gw-compact-list" aria-label="게시판 목록">{catalog.boards.map((board) => <button type="button" key={board.id} onClick={() => selectBoard(board)}><strong>{board.name}</strong><span>{board.board_type} · /{board.slug}{board.archived_at ? ' · 보관' : ''}</span></button>)}</div>
      <form className="gw-builder-form" onSubmit={submit}><div className="gw-admin-form-grid">
        <label className="gw-field"><span>게시판명</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="gw-field"><span>slug</span><input required pattern="[a-z0-9][a-z0-9-]{1,79}" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
        <label className="gw-field"><span>유형</span><select value={form.board_type} onChange={(event) => setForm({ ...form, board_type: event.target.value })}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="gw-field"><span>그룹</span><select required value={form.group_id ?? ''} onChange={(event) => setForm({ ...form, group_id: event.target.value })}><option value="">선택</option>{catalog.groups.filter((item) => !item.archived_at).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="gw-field gw-field--full"><span>설명</span><textarea value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="gw-field"><span>정렬</span><input type="number" value={form.sort_order ?? 0} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></label>
        <label className="gw-field"><span>페이지 크기</span><input type="number" min="5" max="100" value={form.settings.page_size} onChange={(event) => updateSetting('page_size', Number(event.target.value))} /></label>
        <label className="gw-field"><span>파일 제한(MB)</span><input type="number" min="1" max="20" value={form.settings.max_file_size_mb} onChange={(event) => updateSetting('max_file_size_mb', Number(event.target.value))} /></label>
        <label className="gw-field"><span>카테고리(쉼표 구분)</span><input value={categories} onChange={(event) => setCategories(event.target.value)} placeholder="일반, 업무, 자료" /></label>
      </div>
      <div className="gw-check-grid">{[['show_in_sidebar','Sidebar'],['allow_comments','댓글'],['allow_replies','대댓글'],['allow_attachments','첨부'],['allow_images','이미지'],['allow_anonymous','익명'],['allow_reactions','반응'],['search_enabled','검색'],['use_prefix','말머리'],['use_pinned','상단 공지'],['department_only','부서 전용']].map(([key, label]) => <label key={key}><input type="checkbox" checked={Boolean(form.settings[key])} onChange={(event) => updateSetting(key, event.target.checked)} /> {label}</label>)}<label><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> 활성</label><label><input type="checkbox" checked={form.archived} onChange={(event) => setForm({ ...form, archived: event.target.checked })} /> 보관</label></div>
      <fieldset className="gw-builder-fieldset"><legend>게시판 관리자</legend><div className="gw-manager-grid">{catalog.users.map((user) => <label key={user.id}><input type="checkbox" checked={managers.includes(user.id)} onChange={(event) => setManagers((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} /> {user.name} <small>{user.email}</small></label>)}</div></fieldset>
      <fieldset className="gw-builder-fieldset"><legend>게시판별 권한 규칙</legend><div className="gw-rule-editor"><select aria-label="권한 action" value={rule.action} onChange={(event) => setRule({ ...rule, action: event.target.value })}>{ACTIONS.map((action) => <option key={action}>{action}</option>)}</select><select aria-label="대상 종류" value={rule.target_type} onChange={(event) => setRule({ ...rule, target_type: event.target.value, target_id: '' })}>{['all','role','department','position','job_title','user','board_manager','author'].map((type) => <option key={type}>{type}</option>)}</select>{targetOptions.length > 0 && <select aria-label="권한 대상" value={rule.target_id} onChange={(event) => setRule({ ...rule, target_id: event.target.value })}><option value="">대상 선택</option>{targetOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}<select aria-label="권한 효과" value={rule.effect} onChange={(event) => setRule({ ...rule, effect: event.target.value })}><option value="allow">allow</option><option value="deny">deny</option></select><button type="button" className="gw-secondary-button" onClick={addRule}>규칙 추가</button></div><div className="gw-rule-list">{rules.map((item, index) => <div key={`${item.action}-${item.target_type}-${item.target_id}-${index}`}><code>{item.action}</code><span>{item.effect} · {item.target_type}{item.target_id ? `:${item.target_id}` : ''}</span><button type="button" onClick={() => setRules((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${item.action} 규칙 삭제`}>삭제</button></div>)}</div></fieldset>
      <div className="gw-admin-actions"><button className="gw-primary-button" type="submit">게시판 저장</button>{form.id && <button className="gw-secondary-button" type="button" onClick={() => setForm({ ...form, id: undefined, name: `${form.name} 복사본`, slug: `${form.slug}-copy` })}>복제</button>}{form.id && <button className="gw-secondary-button gw-secondary-button--danger" type="button" onClick={async () => { if (!window.confirm('사용 기록이 있으면 삭제 대신 보관됩니다. 계속하시겠습니까?')) return; const result = await deleteOrArchiveBoard(form.id); setStatus(result === 'archived' ? '사용 기록이 있어 보관 처리했습니다.' : '사용 기록이 없어 삭제했습니다.'); setForm(EMPTY); await load(); }}>안전 삭제</button>}</div></form></div>
    <form className="gw-inline-admin-form" onSubmit={saveGroup}><h3>게시판 그룹</h3><input required placeholder="그룹명" value={group.name} onChange={(event) => setGroup({ ...group, name: event.target.value })} /><input required pattern="[a-z0-9][a-z0-9_-]{1,59}" placeholder="group-code" value={group.code} onChange={(event) => setGroup({ ...group, code: event.target.value })} /><button className="gw-secondary-button" type="submit">그룹 저장</button></form>
    {form.id && <div className="gw-permission-preview"><h3>사용자별 권한 미리보기</h3><select value={previewUser} onChange={(event) => setPreviewUser(event.target.value)}><option value="">사용자 선택</option>{catalog.users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select><button className="gw-secondary-button" type="button" disabled={!previewUser} onClick={async () => setPreview(await previewBoardPermissions(form.id, previewUser))}>확인</button>{preview && <div>{Object.entries(preview).map(([action, allowed]) => <span className={allowed ? 'is-allowed' : 'is-denied'} key={action}>{action}: {allowed ? '허용' : '차단'}</span>)}</div>}</div>}
    {status && <p className="gw-form-status" role="status">{status}</p>}
  </section>;
}
