import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVisibleBoards, toggleBoardFavorite } from '../../services/boardService.js';

export default function BoardsPage() {
  const [boards, setBoards] = useState([]); const [error, setError] = useState('');
  const load = () => getVisibleBoards().then(setBoards).catch(() => setError('접근 가능한 게시판을 불러오지 못했습니다.'));
  useEffect(() => { load(); }, []);
  const groups = useMemo(() => boards.reduce((result, board) => { const key = board.is_favorite ? '즐겨찾기' : board.group_name ?? '기타'; (result[key] ??= []).push(board); return result; }, {}), [boards]);
  return <article className="gw-page" aria-labelledby="page-title"><header className="gw-page-header"><div><span className="gw-eyebrow">BOARDS</span><h1 id="page-title">게시판</h1><p>내 권한으로 볼 수 있는 게시판만 표시됩니다.</p></div><span className="gw-phase-badge">G3 권한 기반</span></header>{error && <div className="gw-notice gw-notice--warning" role="alert">{error}</div>}<div className="gw-board-directory">{Object.entries(groups).map(([group, items]) => <section key={group}><h2>{group}</h2><div className="gw-board-card-grid">{items.map((board) => <article className="gw-board-card" key={board.id}><div><span>{board.board_type}</span><h3><Link to={`/boards/${board.slug}`}>{board.name}</Link></h3><p>{board.description}</p></div><button type="button" onClick={async () => { await toggleBoardFavorite(board.id); load(); }} aria-pressed={board.is_favorite}>{board.is_favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기'}</button></article>)}</div></section>)}</div>{boards.length === 0 && !error && <p className="gw-empty-state">현재 접근 가능한 게시판이 없습니다.</p>}</article>;
}
