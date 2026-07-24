import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="text-2xl font-bold p-8">SSCatFacts</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
