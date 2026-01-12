import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudentLoginPage } from './pages/student/LoginPage';
import { StudentRegisterPage } from './pages/student/RegisterPage';
import { StudentDashboardPage } from './pages/student/DashboardPage';
import { SceneListPage } from './pages/student/SceneListPage';
import { SceneCreatePage } from './pages/student/SceneCreatePage';
import { SceneEditorPage } from './pages/student/SceneEditorPage';
import { CharacterListPage } from './pages/student/CharacterListPage';
import { CharacterCreatePage } from './pages/student/CharacterCreatePage';
import { AIChatPage } from './pages/student/AIChatPage';
import { HomeworkPage } from './pages/student/HomeworkPage';
import { HomeworkDetailPage } from './pages/student/HomeworkDetailPage';
import { CounselingPage } from './pages/student/CounselingPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { CharacterDetailPage } from './pages/student/CharacterDetailPage';
import { TeacherLoginPage } from './pages/teacher/LoginPage';
import { TeacherDashboardPage } from './pages/teacher/DashboardPage';
import { StudentManagePage } from './pages/teacher/StudentManagePage';
import { CourseManagePage } from './pages/teacher/CourseManagePage';
import { HomeworkManagePage } from './pages/teacher/HomeworkManagePage';
import { ProgressMonitorPage } from './pages/teacher/ProgressMonitorPage';
import { ResourceLibraryPage } from './pages/teacher/ResourceLibraryPage';
import { TeacherProfilePage } from './pages/teacher/ProfilePage';
import { ParentLoginPage } from './pages/parent/LoginPage';
import { ParentDashboardPage } from './pages/parent/DashboardPage';
import { LearningReportPage } from './pages/parent/LearningReportPage';
import { TimeControlPage } from './pages/parent/TimeControlPage';
import { ContentControlPage } from './pages/parent/ContentControlPage';
import { EmotionalSummaryPage } from './pages/parent/EmotionalSummaryPage';
import { HomeworkStatusPage } from './pages/parent/HomeworkStatusPage';
import { AIUsagePage } from './pages/parent/AIUsagePage';
import { ParentProfilePage } from './pages/parent/ProfilePage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentLoginPage />} />
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/register" element={<StudentRegisterPage />} />
        <Route path="/student/dashboard/elementary" element={<StudentDashboardPage ageGroup="elementary" />} />
        <Route path="/student/dashboard/middle" element={<StudentDashboardPage ageGroup="middle" />} />
        
        {/* 场景相关路由 */}
        <Route path="/student/scenes" element={<SceneListPage ageGroup="elementary" />} />
        <Route path="/student/scenes/elementary" element={<SceneListPage ageGroup="elementary" />} />
        <Route path="/student/scenes/middle" element={<SceneListPage ageGroup="middle" />} />
        <Route path="/student/scenes/create" element={<SceneCreatePage />} />
        <Route path="/student/scenes/:id" element={<SceneEditorPage />} />
        
        {/* 角色相关路由 */}
        <Route path="/student/characters" element={<CharacterListPage />} />
        <Route path="/student/characters/elementary" element={<CharacterListPage />} />
        <Route path="/student/characters/middle" element={<CharacterListPage />} />
        <Route path="/student/characters/create" element={<CharacterCreatePage />} />
        <Route path="/student/characters/:id" element={<CharacterDetailPage />} />
        
        {/* AI对话和学习 */}
        <Route path="/student/ai-chat" element={<AIChatPage />} />
        
        {/* 作业相关路由 */}
        <Route path="/student/homework" element={<HomeworkPage />} />
        <Route path="/student/homework/elementary" element={<HomeworkPage />} />
        <Route path="/student/homework/middle" element={<HomeworkPage />} />
        <Route path="/student/homework/:id" element={<HomeworkDetailPage />} />
        
        {/* 心理辅导 */}
        <Route path="/student/counseling" element={<CounselingPage />} />
        
        {/* 个人中心 */}
        <Route path="/student/profile" element={<ProfilePage />} />
        
        {/* 教师端路由 */}
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/students" element={<StudentManagePage />} />
        <Route path="/teacher/courses" element={<CourseManagePage />} />
        <Route path="/teacher/homework" element={<HomeworkManagePage />} />
        <Route path="/teacher/progress" element={<ProgressMonitorPage />} />
        <Route path="/teacher/resources" element={<ResourceLibraryPage />} />
        <Route path="/teacher/profile" element={<TeacherProfilePage />} />
        
        {/* 家长端路由 */}
        <Route path="/parent/login" element={<ParentLoginPage />} />
        <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
        <Route path="/parent/report" element={<LearningReportPage />} />
        <Route path="/parent/homework" element={<HomeworkStatusPage />} />
        <Route path="/parent/ai-usage" element={<AIUsagePage />} />
        <Route path="/parent/time-control" element={<TimeControlPage />} />
        <Route path="/parent/content-control" element={<ContentControlPage />} />
        <Route path="/parent/emotional-summary" element={<EmotionalSummaryPage />} />
        <Route path="/parent/profile" element={<ParentProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;