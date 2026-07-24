import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RegisterPage } from '@/pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div className="text-2xl font-bold p-8">SSCatFacts</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
