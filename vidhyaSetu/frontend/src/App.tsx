import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { OfflineBanner } from "./components/OfflineBanner";
import { StudentProfileModal } from "./components/StudentProfileModal";
import { SubjectCreator } from "./components/SubjectCreator";
import { StudentDashboard } from "./pages/StudentDashboard";
import type { ModuleSummary } from "./components/CourseDashboard";
import { ModuleViewer } from "./components/ModuleViewer";
import { TestPage } from "./pages/TestPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ChatBot } from "./components/ChatBot";
import { LandingPage } from "./pages/LandingPage";
import { AppLayout } from "./components/AppLayout";
import { generateCourse, generateModuleContent, saveProgress, loadProgress } from "./services/api";
import { useAuth } from "./contexts/AuthContext";
import type { ModuleContentResponse, QuizQuestionData } from "./services/api";
import { Analytics } from "./pages/Analytics";
import { translations } from "./translations";
import type { Language } from "./translations";
import { AuthPage } from "./pages/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SettingsPage } from "./pages/SettingsPage";
import { PricingPage } from "./pages/PricingPage";
import { ChartsPage } from "./pages/ChartsPage";
import { ActivatePathHub } from "./pages/ActivatePathHub";
import { AIRoadmapPage } from "./pages/AIRoadmapPage";
import { CodingPlayground } from "./pages/CodingPlayground";

export interface TestResult {
  moduleId: number;
  score: number;
  total: number;
  timestamp: string;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [language, setLanguage] = useState<Language>("en");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ name: string, age: number, grade: string } | null>(null);

  // App State — persisted to localStorage
  const [subject, setSubject] = useState(() => localStorage.getItem("vidya_subject") || "");
  const [modules, setModules] = useState<ModuleSummary[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("vidya_modules") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('vidya_completed') || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('vidya_test_results') || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeModuleContent, setActiveModuleContent] = useState<ModuleContentResponse | null>(null);

  // Dashboard Quick Start input state
  const [searchTopic, setSearchTopic] = useState("");

  // Test / Results state
  const [testScore, setTestScore] = useState(0);
  const [testTotal, setTestTotal] = useState(0);
  const [testQuestions, setTestQuestions] = useState<QuizQuestionData[]>([]);
  const [testModuleId, setTestModuleId] = useState<number | null>(null);

  // Loading & Retry states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdaptive, setIsLoadingAdaptive] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const savedProfile = localStorage.getItem("vidya_student_profile");
    if (savedProfile) {
      setStudentProfile(JSON.parse(savedProfile));
    } else {
      if (location.pathname !== "/") {
        setShowProfileModal(true);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [location.pathname]);

  // Persist course data to localStorage whenever it changes
  useEffect(() => { localStorage.setItem("vidya_subject", subject); }, [subject]);
  useEffect(() => { localStorage.setItem("vidya_modules", JSON.stringify(modules)); }, [modules]);
  useEffect(() => {
    localStorage.setItem('vidya_completed', JSON.stringify(completedModules));
  }, [completedModules]);

  useEffect(() => {
    localStorage.setItem('vidya_test_results', JSON.stringify(testResults));
  }, [testResults]);

  // ── Phase 8: Cloud Sync ────────────────────────────────────────────────────

  // 1) Load from Cloud on Login
  useEffect(() => {
    if (user) {
      loadProgress(user.id).then(data => {
        if (data) {
          if (data.subject) setSubject(data.subject);
          if (Array.isArray(data.modules)) setModules(data.modules);
          if (Array.isArray(data.completedModules)) setCompletedModules(data.completedModules);
          if (Array.isArray(data.testResults)) setTestResults(data.testResults);
          if (data.studentProfile) setStudentProfile(data.studentProfile);
        }
      }).catch(err => console.error("Failed to load cloud progress:", err));
    }
  }, [user]);

  // 2) Auto-save to Cloud (Debounced)
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      saveProgress(user.id, {
        subject,
        modules,
        completedModules,
        testResults,
        studentProfile
      }).catch(err => console.error("Failed to save cloud progress:", err));
    }, 2000); // 2 second debounce to prevent spamming the backend

    return () => clearTimeout(timeoutId);
  }, [user, subject, modules, completedModules, testResults, studentProfile]);

  const handleSaveProfile = (profile: { name: string, age: number, grade: string }) => {
    setStudentProfile(profile);
    localStorage.setItem("vidya_student_profile", JSON.stringify(profile));
    setShowProfileModal(false);
  };

  const handleGenerateCourse = async (newSubject: string, notes: string) => {
    if (isOffline) {
      alert(translations[language].offlineWarning);
      return;
    }
    setIsLoading(true);
    try {
      const res = await generateCourse({
        subject: newSubject,
        reference_notes: notes,
        language,
        student_name: studentProfile?.name,
        student_age: studentProfile?.age,
        student_grade: studentProfile?.grade
      });
      setSubject(newSubject);
      setModules(res.modules);
      setCompletedModules([]);
      setSearchTopic("");
      navigate('/dashboard');
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for the dashboard Quick Start input
  const handleDashboardQuickStart = () => {
    if (searchTopic.trim()) {
      handleGenerateCourse(searchTopic.trim(), "");
    }
  };

  const handleStartModule = async (moduleId: number) => {
    if (isOffline) return;
    setIsLoading(true);
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    try {
      const res = await generateModuleContent({
        module_id: moduleId,
        title: mod.title,
        subject: subject,
        language,
        student_name: studentProfile?.name,
        student_age: studentProfile?.age,
        student_grade: studentProfile?.grade,
        failed_attempts: 0
      });
      setActiveModuleId(moduleId);
      setActiveModuleContent(res);
      navigate(`/module/${moduleId}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to the test page for a module
  const handleTakeTest = (moduleId: number) => {
    setTestModuleId(moduleId);
    navigate(`/module/${moduleId}/test`);
  };

  // Called when student finishes the test
  const handleTestComplete = (moduleId: number, score: number, total: number, questions: QuizQuestionData[]) => {
    setTestScore(score);
    setTestTotal(total);
    setTestQuestions(questions);
    setTestModuleId(moduleId);

    // Save to test history
    setTestResults(prev => [...prev, { moduleId, score, total, timestamp: new Date().toISOString() }]);

    // Mark as passed if score >= 50%
    if (score / total >= 0.5 && !completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
    }
    navigate(`/module/${moduleId}/results`);
  };

  // Retry test (navigate back to test page — TestPage will generate new questions using localStorage history)
  const handleRetryTest = () => {
    if (testModuleId) navigate(`/module/${testModuleId}/test`);
  };

  // Next module
  const handleNextModule = () => {
    const currentIdx = modules.findIndex(m => m.id === testModuleId);
    const nextMod = modules[currentIdx + 1];
    if (nextMod) {
      handleStartModule(nextMod.id);
    } else {
      navigate('/dashboard');
    }
  };

  const handleModuleFail = async (moduleId: number) => {
    if (isOffline) return;
    setIsLoadingAdaptive(true);
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    try {
      const res = await generateModuleContent({
        module_id: moduleId,
        title: mod.title,
        subject: subject,
        language,
        student_name: studentProfile?.name,
        student_age: studentProfile?.age,
        student_grade: studentProfile?.grade,
        failed_attempts: 1
      });
      setActiveModuleContent(res);
    } catch (e: any) {
      alert("Error adapting module: " + e.message);
    } finally {
      setIsLoadingAdaptive(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const t = translations[language];

  return (
    <div onMouseMove={handleMouseMove}>
      {isOffline && <OfflineBanner isOnline={!isOffline} savedCardsCount={0} />}
      {showProfileModal && (
        <StudentProfileModal
          onSave={handleSaveProfile}
          onCancel={studentProfile ? () => setShowProfileModal(false) : undefined}
          language={language}
          t={t}
        />
      )}

      <Routes>
        {/* Public routes — no auth required */}
        <Route path="/" element={<LandingPage language={language} setLanguage={setLanguage} t={t} />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes — wrapped with AppLayout and ProtectedRoute */}
        <Route path="*" element={
          <ProtectedRoute>
            <AppLayout
              language={language}
              setLanguage={setLanguage}
              studentProfile={studentProfile}
              onEditProfile={() => setShowProfileModal(true)}
            >
              <Routes>
                <Route path="/create" element={
                  <main className="main-container auth-page">
                    <SubjectCreator
                      onGenerate={handleGenerateCourse}
                      onCancel={modules.length > 0 ? () => navigate('/dashboard') : undefined}
                      isLoading={isLoading}
                      t={t}
                      language={language}
                    />
                  </main>
                } />

                <Route path="/dashboard" element={
                  <main className="auth-page">
                    <StudentDashboard
                      subject={subject}
                      modules={modules}
                      completedModules={completedModules}
                      testResults={testResults}
                      onStartModule={handleStartModule}
                      searchTopic={searchTopic}
                      setSearchTopic={setSearchTopic}
                      handleQuickStart={handleDashboardQuickStart}
                      language={language}
                      t={t}
                      isLoading={isLoading}
                    />
                  </main>
                } />


                <Route path="/dashboard/modules" element={
                  <main className="auth-page">
                    <StudentDashboard
                      subject={subject}
                      modules={modules}
                      completedModules={completedModules}
                      testResults={testResults}
                      onStartModule={handleStartModule}
                      searchTopic={searchTopic}
                      setSearchTopic={setSearchTopic}
                      handleQuickStart={handleDashboardQuickStart}
                      language={language}
                      t={t}
                      isLoading={isLoading}
                    />
                  </main>
                } />

                <Route path="/dashboard/tests" element={
                  <main className="auth-page">
                    <StudentDashboard
                      subject={subject}
                      modules={modules}
                      completedModules={completedModules}
                      testResults={testResults}
                      onStartModule={handleStartModule}
                      searchTopic={searchTopic}
                      setSearchTopic={setSearchTopic}
                      handleQuickStart={handleDashboardQuickStart}
                      language={language}
                      t={t}
                      isLoading={isLoading}
                    />
                  </main>
                } />

                {/* Module Viewer */}
                <Route path="/module/:id" element={
                  <main className="auth-page module-layout">
                    {activeModuleId && activeModuleContent && (
                      <ModuleViewer
                        moduleId={activeModuleId}
                        title={modules.find(m => m.id === activeModuleId)?.title || "Module"}
                        subject={subject}
                        explanation={activeModuleContent.explanation}
                        mermaidCode={activeModuleContent.mermaid_diagram}
                        quizQuestion={activeModuleContent.quiz_question}
                        quizAnswer={activeModuleContent.quiz_answer}
                        onBack={() => navigate('/dashboard')}
                        onPass={(id) => { if (!completedModules.includes(id)) setCompletedModules(prev => [...prev, id]); navigate('/dashboard'); }}
                        onFail={handleModuleFail}
                        onTakeTest={handleTakeTest}
                        t={t}
                        language={language}
                        isLoadingAdaptive={isLoadingAdaptive}
                      />
                    )}
                  </main>
                } />

                {/* Test Page */}
                <Route path="/module/:id/test" element={
                  <main className="auth-page module-layout">
                    {activeModuleId !== null && (
                      <TestPage
                        moduleId={activeModuleId}
                        moduleTitle={modules.find(m => m.id === activeModuleId)?.title || "Module"}
                        subject={subject}
                        studentProfile={studentProfile}
                        onTestComplete={handleTestComplete}
                        onBack={() => navigate(`/module/${activeModuleId}`)}
                        t={t}
                        language={language}
                      />
                    )}
                  </main>
                } />

                {/* Results Page */}
                <Route path="/module/:id/results" element={
                  <main className="auth-page module-layout">
                    {testModuleId !== null && (
                      <ResultsPage
                        moduleId={testModuleId}
                        moduleTitle={modules.find(m => m.id === testModuleId)?.title || "Module"}
                        score={testScore}
                        total={testTotal}
                        questions={testQuestions}
                        studentName={studentProfile?.name || "Student"}
                        onRetryTest={handleRetryTest}
                        onNextModule={handleNextModule}
                        onBack={() => navigate(`/module/${testModuleId}`)}
                        t={t}
                        language={language}
                      />
                    )}
                  </main>
                } />


                <Route path="/analytics" element={
                  <main className="auth-page">
                    <Analytics t={t} completedModules={completedModules} testResults={testResults} studentProfile={studentProfile} language={language} />
                  </main>
                } />

                <Route path="/learning-path" element={
                  <main className="auth-page">
                    <ActivatePathHub subject={subject} modules={modules} completedModules={completedModules} onStartModule={handleStartModule} t={t} language={language} />
                  </main>
                } />

                <Route path="/roadmap" element={
                  <main className="auth-page">
                    <AIRoadmapPage
                      subject={subject}
                      modules={modules}
                      completedModules={completedModules}
                      testResults={testResults}
                      onStartModule={handleStartModule}
                      onGenerateCourse={handleGenerateCourse}
                      isLoading={isLoading}
                      language={language}
                      t={t}
                      studentProfile={studentProfile}
                    />
                  </main>
                } />

                <Route path="/coding" element={
                  <main className="auth-page">
                    <CodingPlayground
                      subject={subject}
                      language={language}
                      t={t}
                      studentProfile={studentProfile}
                    />
                  </main>
                } />

                <Route path="/charts" element={
                  <main className="auth-page">
                    <ChartsPage testResults={testResults} completedModules={completedModules} t={t} studentProfile={studentProfile} language={language} subject={subject} />
                  </main>
                } />

                <Route path="/settings" element={
                  <main className="auth-page">
                    <SettingsPage t={t} studentProfile={studentProfile} onSaveProfile={handleSaveProfile} language={language} />
                  </main>
                } />

                <Route path="/pricing" element={
                  <main className="auth-page">
                    <PricingPage t={t} language={language} />
                  </main>
                } />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>

      <ChatBot language={language} studentProfile={studentProfile} />
    </div >
  );
}

export default App;
