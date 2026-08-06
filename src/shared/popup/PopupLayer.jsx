import { useEffect, useRef, useState } from 'react';

import PopupDocumentContent from './PopupDocumentContent.jsx';
import { getActivePopupDocuments } from './popupService.js';
import './popup.css';

const storageKey = (id) => `jeakyung-popup-dismissed:${id}`;
const wasDismissed = (id) => {
  try { return sessionStorage.getItem(storageKey(id)) === '1'; }
  catch { return false; }
};
const rememberDismissal = (id) => {
  try { sessionStorage.setItem(storageKey(id), '1'); }
  catch { /* 브라우저 저장소가 차단돼도 현재 팝업은 닫는다. */ }
};

export default function PopupLayer({ client, target }) {
  const [documents, setDocuments] = useState([]);
  const closeButtonRef = useRef(null);
  const current = documents[0];

  useEffect(() => {
    let active = true;
    getActivePopupDocuments(client, target).then((items) => {
      if (!active) return;
      setDocuments(items.filter((item) => !wasDismissed(item.id)));
    }).catch(() => { if (active) setDocuments([]); });
    return () => { active = false; };
  }, [client, target]);

  useEffect(() => {
    if (!current) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === 'Escape') closeCurrent(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [current?.id]);

  const closeCurrent = () => {
    if (!current) return;
    rememberDismissal(current.id);
    setDocuments((items) => items.slice(1));
  };

  if (!current) return null;

  return <div className="site-popup-layer" role="presentation">
    <section className="site-popup-dialog" role="dialog" aria-modal="true" aria-labelledby={`popup-title-${current.id}`}>
      <header><h2 id={`popup-title-${current.id}`}>{current.title}</h2><button ref={closeButtonRef} type="button" onClick={closeCurrent} aria-label="팝업 닫기">×</button></header>
      <div className="site-popup-body"><PopupDocumentContent html={current.content_html} /></div>
      <footer>{documents.length > 1 && <span>다음 안내 {documents.length - 1}개</span>}<button type="button" onClick={closeCurrent}>확인 후 닫기</button></footer>
    </section>
  </div>;
}
