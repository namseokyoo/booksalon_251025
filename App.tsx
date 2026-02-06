
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ForumList from './components/ForumList';
import ForumView from './components/ForumView';
import ProfilePage from './components/ProfilePage';
import ActivityFeed from './components/ActivityFeed';
import MessagingPage from './components/MessagingPage';
import NotificationComponent from './components/NotificationComponent';
import AdminDashboard from './components/AdminDashboard';
import RequireAuth from './components/RequireAuth';
import AdminRoute from './components/AdminRoute';
import type { Forum, Book } from './types';
import { useAuth } from './contexts/AuthContext';
import { LoginModalProvider, useLoginModal } from './contexts/LoginModalContext';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import SearchModal from './components/SearchModal';

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
            <ForumView
              onBack={handleBackToList}
              onNavigateToMessaging={(userId) => {
                navigate(`/messages?userId=${userId}`);
              }}
              onLoginRequired={openLoginModal}
            />
          } />
          <Route path="/profile/:userId" element={<ProfilePage onBack={handleBackToList} />} />

          {/* 인증 필요 라우트 */}
          <Route path="/profile" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <ProfilePage onBack={handleBackToList} />
            </RequireAuth>
          } />
          <Route path="/activity" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <ActivityFeed onBack={handleBackToList} />
            </RequireAuth>
          } />
          <Route path="/messages" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <MessagingPage />
            </RequireAuth>
          } />
          <Route path="/notifications" element={
            <RequireAuth onLoginRequired={openLoginModal}>
              <NotificationComponent />
            </RequireAuth>
          } />

          {/* 관리자 전용 라우트 */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="text-center p-8">
              <p className="text-gray-900">페이지를 찾을 수 없습니다.</p>
              <button onClick={handleBackToList} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                목록으로 돌아가기
              </button>
            </div>
          } />
        </Routes>
      </main>

      {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
      {signupModalOpen && <SignUpModal onClose={() => setSignupModalOpen(false)} />}
      {deleteModalOpen && <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} />}
      {searchModalOpen && (
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelectForum={handleSelectForum}
          onCreateForum={handleCreateForumFromSearch}
        />
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
