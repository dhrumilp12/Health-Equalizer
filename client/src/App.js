import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HealthQuery from './components/HealthQuert';
import ProvidersMap from './components/ProvidersMap';
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HealthQuery />} />
          <Route path="/providers" element={<ProvidersMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
