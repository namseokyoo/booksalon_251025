
import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ForumList from './components/ForumList';
import RequireAuth from './components/RequireAuth';
import AdminRoute from './components/AdminRoute';
import NotFoundPage from './components/NotFoundPage';
import type { Forum, Book } from './types';
import { useAuth } from './contexts/AuthContext';
import { LoginModalProvider, useLoginModal } from './contexts/LoginModalContext';

// Lazy loaded route components
const ForumView = lazy(() => import('./components/ForumView'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const ActivityFeed = lazy(() => import('./components/ActivityFeed'));
const MessagingPage = lazy(() => import('./components/MessagingPage'));
const NotificationComponent = lazy(() => import('./components/NotificationComponent'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Lazy loaded modals
const LoginModal = lazy(() => import('./components/LoginModal'));
const SignUpModal = lazy(() => import('./components/SignUpModal'));
const DeleteAccountModal = lazy(() => import('./components/DeleteAccountModal'));
const SearchModal = lazy(() => import('./components/SearchModal'));

const AppContent = () => {
  const navigate = useNavigate();
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useLoginModal();
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { loading, currentUser } = useAuth();

  const handleSelectForum = (forum: Forum) => {
    navigate(`/forum/${forum.isbn}`);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleShowProfile = () => {
    navigate('/profile');
  };

  const handleShowActivity = () => {
    navigate('/activity');
  };

  const handleShowSearch = () => {
    setSearchModalOpen(true);
  };

  const handleCreateForumFromSearch = async (book: Book) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const { db } = await import('./services/firebase');
    const { doc, setDoc } = await import('firebase/firestore');
    const { FilterService } = await import('./services/filterService');
    const { UserProfileService } = await import('./services/userProfile');

    const category = FilterService.categorizeBook(book);
    const tags = FilterService.generateTags(book);
    const newForum: Forum = {
      isbn: book.isbn,
      book,
      postCount: 0,
      category,
      tags,
      lastActivityAt: new Date(),
      popularity: 0,
    };
    await setDoc(doc(db, 'forums', book.isbn), newForum);

    // 사용자 통계 업데이트
    if (currentUser) {
      await UserProfileService.updateUserStats(currentUser.uid, 'forum', true);
    }

    navigate(`/forum/${book.isbn}`);
  };

  const handleShowMessaging = () => {
    navigate('/messages');
  };

  const handleShowNotifications = () => {
    navigate('/notifications');
  };

  const handleShowAdmin = () => {
    navigate('/admin');
  };

  const handleBackToList = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const suspenseFallback = (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={openLoginModal}
        onSignUpClick={() => setSignupModalOpen(true)}
        onDeleteClick={() => setDeleteModalOpen(true)}
        onProfileClick={handleShowProfile}
        onActivityClick={handleShowActivity}
        onSearchClick={handleShowSearch}
        onMessagingClick={handleShowMessaging}
        onNotificationsClick={handleShowNotifications}
        onAdminClick={handleShowAdmin}
        onHomeClick={handleHomeClick}
      />
      <main>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<ForumList onSelectForum={handleSelectForum} onLoginRequired={openLoginModal} />} />
          <Route path="/forum/:isbn" element={
            <Suspense fallback={suspenseFallback}>
              <ForumView
                onBack={handleBackToList}
                onNavigateToMessaging={(userId) => {
                  navigate(`/messages?userId=${userId}`);
                }}
                onLoginRequired={openLoginModal}
              />
            </Suspense>
          } />
          <Route path="/profile/:userId" element={
            <Suspense fallback={suspenseFallback}>
              <ProfilePage onBack={handleBackToList} />
            </Suspense>
          } />

          {/* 인증 필요 라우트 */}
          <Route path="/profile" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <Suspense fallback={suspenseFallback}>
                <ProfilePage onBack={handleBackToList} />
              </Suspense>
            </RequireAuth>
          } />
          <Route path="/activity" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <Suspense fallback={suspenseFallback}>
                <ActivityFeed onBack={handleBackToList} />
              </Suspense>
            </RequireAuth>
          } />
          <Route path="/messages" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <Suspense fallback={suspenseFallback}>
                <MessagingPage />
              </Suspense>
            </RequireAuth>
          } />
          <Route path="/notifications" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <Suspense fallback={suspenseFallback}>
                <NotificationComponent />
              </Suspense>
            </RequireAuth>
          } />

          {/* 관리자 전용 라우트 */}
          <Route path="/admin" element={
            <AdminRoute>
              <Suspense fallback={suspenseFallback}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal onClose={closeLoginModal} />
        </Suspense>
      )}
      {signupModalOpen && (
        <Suspense fallback={null}>
          <SignUpModal onClose={() => setSignupModalOpen(false)} />
        </Suspense>
      )}
      {deleteModalOpen && (
        <Suspense fallback={null}>
          <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} />
        </Suspense>
      )}
      {searchModalOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onSelectForum={handleSelectForum}
            onCreateForum={handleCreateForumFromSearch}
          />
        </Suspense>
      )}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
};

const App = () => {
  return (
    <LoginModalProvider>
      <AppContent />
    </LoginModalProvider>
  );
};

export default App;
