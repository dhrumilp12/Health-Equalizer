import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HealthQuery from './components/HealthQuery';
import ProvidersMap from './components/ProvidersMap';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <Navigation />
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
