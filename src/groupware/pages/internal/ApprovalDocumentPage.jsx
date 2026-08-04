import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';

const ApprovalDocumentPage = () => {
  const { documentId } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const data = await approvalService.getDocument(documentId);
      setDoc(data);
    } catch (err) {
      console.error('Failed to load document', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="gw-loading">로딩 중...</div>;
  if (!doc) return <div className="gw-error">문서를 찾을 수 없거나 접근 권한이 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="gw-content-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="gw-badge gw-badge-primary">{doc.template?.name}</span>
              <span className="text-sm text-gray-500">{doc.document_number}</span>
            </div>
            <h1 className="gw-heading-xl">{doc.title}</h1>
          </div>
          <div className="text-right">
            <span className={`gw-badge ${getStatusBadgeClass(doc.status)}`}>
              {getStatusLabel(doc.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 border-y py-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">기안자</label>
            <p className="font-medium">{doc.drafter_user_id}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">기안일시</label>
            <p className="font-medium">{new Date(doc.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="min-h-[200px] mb-8 prose max-w-none">
          {doc.revision?.body_json ? (
            <p>본문 내용 렌더링 영역</p>
          ) : (
            <p className="text-gray-400">본문 내용이 없습니다.</p>
          )}
        </div>

        {doc.attachments?.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="gw-heading-sm mb-2">첨부파일 ({doc.attachments.length})</h3>
            <ul className="space-y-1">
              {doc.attachments.map(file => (
                <li key={file.id} className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base">attach_file</span>
                  <a href="#" className="text-blue-600 hover:underline">{file.original_name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="gw-content-card">
        <h3 className="gw-heading-lg mb-4">결재 진행 정보</h3>
        <div className="space-y-4">
          {doc.lines?.sort((a,b) => a.step_order - b.step_order).map(line => (
            <div key={line.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                {line.step_order}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm uppercase tracking-wider text-gray-500">
                    {getStepKindLabel(line.step_kind)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLineStatusClass(line.status)}`}>
                    {getLineStatusLabel(line.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {line.assignees?.map(assignee => (
                    <div key={assignee.id} className="bg-white px-3 py-2 rounded border flex items-center gap-2 min-w-[120px]">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="text-xs font-bold">{assignee.assigned_user_id}</p>
                        <p className="text-[10px] text-gray-500">{getAssigneeStatusLabel(assignee.status)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getStatusLabel = (status) => {
  const map = {
    draft: '임시 저장',
    submitted: '제출됨',
    in_progress: '진행 중',
    approved: '승인 완료',
    rejected: '반려',
    recalled: '회수됨',
    canceled: '취소됨'
  };
  return map[status] || status;
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

const getStepKindLabel = (kind) => {
  const map = { approval: '결재', agreement: '합의', cooperation: '협조' };
  return map[kind] || kind;
};

const getLineStatusLabel = (status) => {
  const map = { waiting: '대기', active: '진행 중', approved: '완료', rejected: '반려' };
  return map[status] || status;
};

const getLineStatusClass = (status) => {
  const map = { active: 'bg-blue-50 text-blue-500 border border-blue-200', approved: 'bg-green-50 text-green-500 border border-green-200' };
  return map[status] || 'bg-gray-50 text-gray-400 border border-gray-200';
};

const getAssigneeStatusLabel = (status) => {
  const map = { pending: '대기', approved: '승인', rejected: '반려', waiting: '예정' };
  return map[status] || status;
};

export default ApprovalDocumentPage;
