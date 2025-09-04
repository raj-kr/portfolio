import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GoogleAnalyticsComponent from './components/GoogleAnalytics';
import { GA_ID, isGAEnabled } from './config/analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        {isGAEnabled && <GoogleAnalyticsComponent gaId={GA_ID} />}
      </Layout>
    </Router>
  );
}

export default App;
