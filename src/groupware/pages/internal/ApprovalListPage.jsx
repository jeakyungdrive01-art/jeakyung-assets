import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const ApprovalListPage = ({ type }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [type]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('approval_documents')
        .select(`
          *,
          template:template_id (name),
          drafter:drafter_user_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (type === 'drafts') query = query.eq('status', 'draft');
      else if (type === 'inbox') query = query.eq('status', 'in_progress'); // 실제로는 RPC 필요
      else if (type === 'outbox') query = query.eq('status', 'in_progress');
      else if (type === 'completed') query = query.eq('status', 'approved');

      const { data, error } = await query;
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const map = {
      drafts: '임시 보관함',
      inbox: '결재 대기함',
      outbox: '기안 문서함',
      completed: '완료 문서함',
      references: '참조·열람함'
    };
    return map[type] || '전자결재 문서';
  };

  return (
    <div className="gw-content-card">
      <div className="gw-header-with-actions mb-6">
        <h2 className="gw-heading-xl">{getTitle()}</h2>
        <Link to="/approval/new" className="gw-button-primary">
          <span className="material-symbols-outlined">add</span>
          새 기안
        </Link>
      </div>

      {loading ? (
        <div className="gw-loading">불러오는 중...</div>
      ) : documents.length === 0 ? (
        <div className="gw-empty-state">
          <span className="material-symbols-outlined gw-empty-icon">description</span>
          <p>문서가 없습니다.</p>
        </div>
      ) : (
        <div className="gw-table-container">
          <table className="gw-table">
            <thead>
              <tr>
                <th>문서번호</th>
                <th>양식</th>
                <th>제목</th>
                <th>기안자</th>
                <th>기안일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="whitespace-nowrap text-xs text-gray-500">{doc.document_number || '-'}</td>
                  <td>{doc.template?.name}</td>
                  <td>
                    <Link to={`/approval/documents/${doc.id}`} className="font-medium hover:text-blue-600">
                      {doc.title}
                    </Link>
                  </td>
                  <td>{doc.drafter_user_id}</td>
                  <td className="whitespace-nowrap">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`gw-badge ${getStatusBadgeClass(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600'
  };
  return map[status] || 'bg-gray-100';
};

export default ApprovalListPage;
