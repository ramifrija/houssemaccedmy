import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
import { AuthPage } from '@/components/auth/AuthPage'
import { PendingApproval } from '@/components/auth/PendingApproval'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import MobileNavigation from '@/components/MobileNavigation'
import { AppLoading } from '@/components/layout/AppLoading'
import { getDefaultRouteForRole } from '@/lib/role-navigation'
import { CourseReminderHost } from '@/components/CourseReminderHost'
import { GlobalMessageNotification } from '@/components/messaging/GlobalMessageNotification'
import { usePushNotifications } from '@/hooks/usePushNotifications'

function PushNotificationHandler({ userId }: { userId?: string }) {
  usePushNotifications(userId)
  return null
}

const Index = lazy(() => import('./pages/Index'))
const Users = lazy(() => import('./pages/Users'))
const ClassesPage = lazy(() => import('./pages/ClassesPage'))
const Attendance = lazy(() => import('./pages/Attendance'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const StudentGradesPage = lazy(() => import('./pages/StudentGradesPage'))
const TeacherGradesPage = lazy(() => import('./pages/TeacherGradesPage'))
const MessagingPage = lazy(() => import('./pages/MessagingPage'))
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'))
const StudentsDossiersPage = lazy(() => import('./pages/StudentsDossiersPage'))
const StudentDossierPage = lazy(() => import('./pages/StudentDossierPage'))
const TeachersDossiersPage = lazy(() => import('./pages/TeachersDossiersPage'))
const TeacherDossierPage = lazy(() => import('./pages/TeacherDossierPage'))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'))
const MatieresPage = lazy(() => import('./pages/MatieresPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function RoleHome() {
  const { userProfile } = useAuth()
  const target = getDefaultRouteForRole(userProfile?.role)
  if (target === '/') return <Index />
  return <Navigate to={target} replace />
}

import { Button } from '@/components/ui/button'

const AppContent = () => {
  const { user, userProfile, loading, profileLoading, profileError, signOut, refreshProfile } = useAuth()

  const waitingProfile = Boolean(user && profileLoading && !userProfile && !profileError)

  if (loading || waitingProfile) {
    return <AppLoading message="Connexion en cours..." />
  }

  if (!user) {
    return <AuthPage />
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-school-gray-light">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-xl font-semibold text-school-black">Profil introuvable</h2>
          <p className="text-muted-foreground">
            {profileError ?? "Votre compte existe mais aucun profil n'est associé. Contactez l'administration."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => refreshProfile()}>
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (userProfile?.status === 'pending') {
    return <PendingApproval />
  }

  if (userProfile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-3">
          <h2 className="text-xl font-semibold text-school-black">Accès refusé</h2>
          <p className="text-muted-foreground">Votre demande d&apos;inscription a été refusée.</p>
        </div>
      </div>
    )
  }

  const role = userProfile?.role

  return (
    <div className="min-h-dvh bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <PushNotificationHandler userId={user.id} />
      <CourseReminderHost />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <Suspense fallback={<AppLoading message="Chargement de la page..." />}>
            <Routes>
              <Route path="/" element={<RoleHome />} />

              {/* Legacy redirects */}
              <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
              <Route path="/student/schedule" element={<Navigate to="/calendar" replace />} />
              <Route path="/student/messages" element={<Navigate to="/messaging" replace />} />
              <Route path="/student/announcements" element={<Navigate to="/announcements" replace />} />
              <Route path="/student/settings" element={<Navigate to="/settings" replace />} />
              <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
              <Route path="/teacher/calendar" element={<Navigate to="/calendar" replace />} />
              <Route path="/teacher/messages" element={<Navigate to="/messaging" replace />} />
              <Route path="/teacher/settings" element={<Navigate to="/settings" replace />} />
              <Route path="/teacher/students" element={<Navigate to="/students" replace />} />

              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />

              {role === 'admin' && (
                <>
                  <Route path="/users" element={<Users />} />
                  <Route path="/classes" element={<ClassesPage />} />
                  <Route path="/matieres" element={<MatieresPage />} />
                  <Route path="/teacher/grades" element={<TeacherGradesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/students" element={<StudentsDossiersPage />} />
                  <Route path="/students/:studentId" element={<StudentDossierPage />} />
                  <Route path="/teachers" element={<TeachersDossiersPage />} />
                  <Route path="/teachers/:teacherId" element={<TeacherDossierPage />} />
                </>
              )}

              {role === 'teacher' && (
                <>
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/grades" element={<TeacherGradesPage />} />
                  <Route path="/students" element={<StudentsDossiersPage />} />
                  <Route path="/students/:studentId" element={<StudentDossierPage />} />
                </>
              )}

              {role === 'student' && (
                <>
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/student/grades" element={<StudentGradesPage />} />
                </>
              )}

              {role === 'parent' && (
                <>
                  <Route path="/parent-dashboard" element={<ParentDashboard />} />
                </>
              )}

              {/* Pages légales (accessibles à tous les rôles) */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
      <MobileNavigation />
    </div>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
          <Toaster />
          <Sonner />
          <GlobalMessageNotification />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
