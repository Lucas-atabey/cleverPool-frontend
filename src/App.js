import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import QuestionDetails from './pages/QuestionDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll/:pollId" element={<PollDetails />} />
        <Route path="/question/:questionId" element={<QuestionDetails />} />
      </Routes>
    </Router>
  );
}
