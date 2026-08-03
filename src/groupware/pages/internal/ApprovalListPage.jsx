import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import { supabase } from '../../lib/supabase';

const ApprovalListPage = ({ type }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [type]);

  const loadDocuments = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      if (type === 'inbox') {
        const inbox = await approvalService.getInbox();
        setDocuments(inbox);
        return;
      }

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('로그인이 필요합니다.');

      let query = supabase
        .from('approval_documents')
        .select(`
          *,
          template:template_id (name),
          drafter:drafter_user_id (
            full_name,
            preferred_name,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (type === 'drafts') {
        query = query
          .eq('drafter_user_id', user.id)
          .eq('status', 'draft');
      } else if (type === 'outbox') {
        query = query
          .eq('drafter_user_id', user.id)
          .in('status', [
            'submitted',
            'in_progress',
            'held',
            'rejected',
            'recalled'
          ]);
      } else if (type === 'completed') {
        query = query.eq('status', 'approved');
      } else if (type === 'references') {
        query = query.in('status', [
          'submitted',
          'in_progress',
          'held',
          'approved',
          'rejected'
        ]);
      }

      const { data, error } = await query;
      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Failed to load approval documents', error);
      setDocuments([]);
      setErrorMessage(
        error?.message || '문서를 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const titles = {
      drafts: '임시 보관함',
      inbox: '결재 대기함',
      outbox: '기안 문서함',
      completed: '완료 문서함',
      references: '참조·열람함'
    };

    return titles[type] || '전자결재 문서';
  };

  const getTemplateName = (document) =>
    document.template_name ||
    document.template?.name ||
    '-';

  const getDrafterName = (document) =>
    document.drafter_name ||
    document.drafter?.preferred_name ||
    document.drafter?.full_name ||
    document.drafter?.name ||
    '-';

  const getDocumentDate = (document) => {
    const value =
      document.submitted_at ||
      document.created_at;

    if (!value) return '-';

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(value));
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
      ) : errorMessage ? (
        <div className="gw-empty-state">
          <span className="material-symbols-outlined gw-empty-icon">
            error
          </span>
          <p>{errorMessage}</p>
          <button
            type="button"
            className="gw-button-secondary mt-4"
            onClick={loadDocuments}
          >
            다시 시도
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="gw-empty-state">
          <span className="material-symbols-outlined gw-empty-icon">
            description
          </span>
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
                <th>{type === 'inbox' ? '제출일' : '기안일'}</th>
                <th>상태</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr key={`${document.id}-${document.assignee_id || ''}`}>
                  <td className="whitespace-nowrap text-xs text-gray-500">
                    {document.document_number || '미발급'}
                  </td>

                  <td>{getTemplateName(document)}</td>

                  <td>
                    <Link
                      to={`/approval/documents/${document.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {document.title || '제목 없음'}
                    </Link>

                    {document.is_delegated && (
                      <span className="gw-badge ml-2 bg-purple-100 text-purple-700">
                        위임
                      </span>
                    )}
                  </td>

                  <td>{getDrafterName(document)}</td>

                  <td className="whitespace-nowrap">
                    {getDocumentDate(document)}
                  </td>

                  <td>
                    <span
                      className={`gw-badge ${getStatusBadgeClass(
                        document.status
                      )}`}
                    >
                      {getStatusLabel(document.status)}
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
  const classes = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    held: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    recalled: 'bg-orange-100 text-orange-700',
    canceled: 'bg-gray-100 text-gray-600'
  };

  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status) => {
  const labels = {
    draft: '임시 저장',
    submitted: '제출',
    in_progress: '결재 진행',
    held: '보류',
    approved: '승인 완료',
    rejected: '반려',
    recalled: '회수',
    canceled: '취소',
    archived: '보관'
  };

  return labels[status] || status || '-';
};

export default ApprovalListPage;
