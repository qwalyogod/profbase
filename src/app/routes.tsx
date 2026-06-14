import { createBrowserRouter } from 'react-router';
import Root from './Root';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import EmploymentPage from './pages/EmploymentPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import IncidentsPage from './pages/IncidentsPage';
import LaborCodePage from './pages/LaborCodePage';
import NewsPage from './pages/NewsPage';
import SiteMapPage from './pages/SiteMapPage';
import TermsPage from './pages/TermsPage';
import PedRoot from './pages/ped/PedRoot';
import PedCabinetPage from './pages/ped/PedCabinetPage';
import DiaryPage from './pages/ped/DiaryPage';
import CalendarPage from './pages/ped/CalendarPage';
import NotesPage from './pages/ped/NotesPage';
import JournalPage from './pages/ped/JournalPage';
import DocumentsPage from './pages/ped/DocumentsPage';
import OrganizationPage from './pages/OrganizationPage';
import AdminPage from './pages/AdminPage';
import SiteAdminPage from './pages/SiteAdminPage';
import EditorAdminPage from './pages/EditorAdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'onboarding', Component: OnboardingPage },
      { path: 'knowledge', Component: KnowledgeBasePage },
      { path: 'news', Component: NewsPage },
      { path: 'news/:newsId', Component: NewsPage },
      { path: 'sitemap', Component: SiteMapPage },
      { path: 'terms', Component: TermsPage },
      { path: 'labor-code', Component: LaborCodePage },
      {
        path: '/',
        Component: ProtectedRoute,
        children: [
          { path: 'employment', Component: EmploymentPage },
          { path: 'incidents', Component: IncidentsPage },
          { path: 'organization', Component: OrganizationPage },
          { path: 'profile', Component: ProfilePage },
          { path: 'site-admin', Component: SiteAdminPage },
          { path: 'editor-admin', Component: EditorAdminPage },
          { path: 'org-admin', Component: AdminPage },
          { path: 'admin', Component: AdminPage },
          {
            path: 'ped',
            Component: PedRoot,
            children: [
              { index: true, Component: PedCabinetPage },
              { path: 'diary', Component: DiaryPage },
              { path: 'calendar', Component: CalendarPage },
              { path: 'notes', Component: NotesPage },
              { path: 'journal', Component: JournalPage },
              { path: 'documents', Component: DocumentsPage },
            ],
          },
        ],
      },
    ],
  },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
]);
