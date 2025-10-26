
import React, { useState } from 'react';
import Header from './components/Header';
import ForumList from './components/ForumList';
import ForumView from './components/ForumView';
import ProfilePage from './components/ProfilePage';
import ActivityFeed from './components/ActivityFeed';
import UserSearch from './components/UserSearch';
import MessagingPage from './components/MessagingPage';
import NotificationComponent from './components/NotificationComponent';
import AdminDashboard from './components/AdminDashboard';
import type { Forum, Book } from './types';
import { useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import DeleteAccountModal from './components/DeleteAccountModal';

const App = () => {
  const [currentView, setCurrentView] = useState<'list' | 'forum' | 'profile' | 'activity' | 'search' | 'messaging' | 'notifications' | 'admin'>('list');
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [messagingTargetUserId, setMessagingTargetUserId] = useState<string | null>(null);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { loading } = useAuth();

  const handleSelectForum = (forum: Forum) => {
    setSelectedForum(forum);
    setCurrentView('forum');
  };

  const handleHomeClick = () => {
    setCurrentView('list');
    setSelectedForum(null);
  };

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleShowActivity = () => {
    setCurrentView('activity');
    setSelectedForum(null);
  };

  const handleShowSearch = () => {
    setCurrentView('search');
    setSelectedForum(null);
  };

  const handleShowMessaging = () => {
    setMessagingTargetUserId(null); // 일반 메시징 페이지로 이동
    setCurrentView('messaging');
    setSelectedForum(null);
  };

  const handleShowNotifications = () => {
    setCurrentView('notifications');
    setSelectedForum(null);
  };

  const handleShowAdmin = () => {
    setCurrentView('admin');
    setSelectedForum(null);
  };

  const handleBackToList = () => {
    setSelectedForum(null);
    setCurrentView('list');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        onLoginClick={() => setLoginModalOpen(true)}
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
        {currentView === 'list' ? (
          <ForumList onSelectForum={handleSelectForum} />
        ) : currentView === 'profile' ? (
          <ProfilePage onBack={handleBackToList} />
        ) : currentView === 'activity' ? (
          <ActivityFeed onBack={handleBackToList} />
        ) : currentView === 'search' ? (
          <UserSearch onBack={handleBackToList} />
        ) : currentView === 'messaging' ? (
          <MessagingPage targetUserId={messagingTargetUserId || undefined} />
        ) : currentView === 'notifications' ? (
          <NotificationComponent />
        ) : currentView === 'admin' ? (
          <AdminDashboard />
        ) : selectedForum ? (
          <ForumView
            forum={selectedForum}
            onBack={handleBackToList}
            onNavigateToMessaging={(userId) => {
              setMessagingTargetUserId(userId);
              setCurrentView('messaging');
            }}
          />
        ) : (
          <div className="text-center p-8">
            <p>오류: 해당 살롱을 찾을 수 없습니다.</p>
            <button onClick={handleBackToList} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded">
              목록으로 돌아가기
            </button>
          </div>
        )}
      </main>

      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} />}
      {signupModalOpen && <SignUpModal onClose={() => setSignupModalOpen(false)} />}
      {deleteModalOpen && <DeleteAccountModal onClose={() => setDeleteModalOpen(false)} />}
    </div>
  );
};

export default App;