import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';

const ApprovalHomePage = () => {
  const [summary, setSummary] = useState({
    inbox: 0,
    outbox: 0,
    drafts: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 요약 정보를 가져오는 로직 (향후 RPC로 최적화)
    setLoading(false);
  }, []);

  return (
    <div className="gw-content-card">
      <div className="gw-header-with-actions">
        <div>
          <h2 className="gw-heading-xl">전자결재 홈</h2>
          <p className="gw-subheading">결재 현황을 한눈에 확인하고 기안을 시작하세요.</p>
        </div>
        <Link to="/approval/new" className="gw-button-primary">
          <span className="material-symbols-outlined">add</span>
          기안하기
        </Link>
      </div>

      <div className="gw-grid-4 mt-6">
        <Link to="/approval/inbox" className="gw-stat-card clickable">
          <span className="gw-stat-label">결재 대기</span>
          <span className="gw-stat-value">{summary.inbox}</span>
        </Link>
        <Link to="/approval/outbox" className="gw-stat-card clickable">
          <span className="gw-stat-label">진행 중 기안</span>
          <span className="gw-stat-value">{summary.outbox}</span>
        </Link>
        <Link to="/approval/drafts" className="gw-stat-card clickable">
          <span className="gw-stat-label">임시 보관</span>
          <span className="gw-stat-value">{summary.drafts}</span>
        </Link>
        <Link to="/approval/completed" className="gw-stat-card clickable">
          <span className="gw-stat-label">완료 문서</span>
          <span className="gw-stat-value">{summary.completed}</span>
        </Link>
      </div>

      <div className="mt-8">
        <h3 className="gw-heading-lg mb-4">최근 결재 이력</h3>
        <div className="gw-empty-state">
          <span className="material-symbols-outlined gw-empty-icon">history</span>
          <p>최근 처리된 결재 문서가 없습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHomePage;
