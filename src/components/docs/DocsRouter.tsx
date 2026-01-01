import { Routes, Route, Navigate } from 'react-router-dom';
import DocsHome from '@/pages/docs/DocsHome';
import DocsPage from '@/pages/docs/DocsPage';
import { getDocsBasePath } from '@/lib/hostname';

/**
 * Docs Router Component
 * 
 * Handles all documentation routes when on docs subdomain
 */
export function DocsRouter() {
  const basePath = getDocsBasePath();
  const rootPath = basePath || '/';

  return (
    <Routes>
      {/* Root redirect */}
      <Route path={rootPath} element={<Navigate to={`${rootPath}ru`} replace />} />
      {/* Language home pages */}
      <Route path={`${rootPath}ru`} element={<DocsHome />} />
      <Route path={`${rootPath}en`} element={<DocsHome />} />
      {/* Language-specific pages */}
      <Route path={`${rootPath}:lang`} element={<DocsPage />} />
      <Route path={`${rootPath}:lang/:slug/*`} element={<DocsPage />} />
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={`${rootPath}ru`} replace />} />
    </Routes>
  );
}

