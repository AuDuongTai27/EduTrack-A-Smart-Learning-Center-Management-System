import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
