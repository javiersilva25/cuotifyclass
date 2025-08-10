// App.jsx
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './features/auth/hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
