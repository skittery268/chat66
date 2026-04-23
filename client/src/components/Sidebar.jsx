import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const {
    groups,
    activeGroup,
    loadingGroups,
    fetchGroups,
    createGroup,
    joinGroup,
    deleteGroup,
    selectGroup,
    reset,
  } = useChat();

  const [newTitle, setNewTitle] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError('');
    try {
      await createGroup(newTitle.trim());
      setNewTitle('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setError('');
    try {
      await joinGroup(joinId.trim());
      setJoinId('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    reset();
    logout();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>{user?.fullname}</h3>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <form className="sidebar-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New group name..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      <form className="sidebar-form" onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Group ID to join..."
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>

      {error && <p className="error sidebar-error">{error}</p>}

      <div className="group-list">
        {loadingGroups ? (
          <p className="loading">Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="empty">No groups yet. Create or join one!</p>
        ) : (
          groups.map((group) => (
            <div
              key={group._id}
              className={`group-item ${activeGroup?._id === group._id ? 'active' : ''}`}
              onClick={() => selectGroup(group)}
            >
              <span className="group-title">{group.title}</span>
              {group.admin === user?._id && (
                <button
                  className="btn-delete-group"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group._id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
