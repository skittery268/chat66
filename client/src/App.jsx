import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-container"><p>Loading...</p></div>;
  if (!user) return <Auth />;

  return (
    <div className="app">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default App;
