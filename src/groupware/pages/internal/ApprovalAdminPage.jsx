import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

const ApprovalAdminPage = () => {
  const location = useLocation();

  const tabs = [
    { name: '양식 관리', path: '/approval/admin/templates' },
    { name: '분류 관리', path: '/approval/admin/categories' },
    { name: '전결 규칙', path: '/approval/admin/authority' },
    { name: '대결·위임', path: '/approval/admin/delegations' },
    { name: '결재 감사', path: '/approval/admin/audit' }
  ];

  return (
    <div className="gw-content-card">
      <h2 className="gw-heading-xl mb-6">전자결재 관리</h2>
      
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              location.pathname.startsWith(tab.path)
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="templates" element={<TemplateManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">준비 중인 관리 기능입니다.</div>} />
      </Routes>
    </div>
  );
};

const TemplateManager = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="gw-heading-lg">결재 양식 목록</h3>
      <button className="gw-button-primary">양식 추가</button>
    </div>
    <div className="gw-empty-state">등록된 양식이 없습니다.</div>
  </div>
);

const CategoryManager = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="gw-heading-lg">결재 분류 목록</h3>
      <button className="gw-button-primary">분류 추가</button>
    </div>
    <div className="gw-empty-state">등록된 분류가 없습니다.</div>
  </div>
);

export default ApprovalAdminPage;
