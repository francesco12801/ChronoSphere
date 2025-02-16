import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChronoSphere from './components/ChronoSphere';
import MyCollection from './components/MyCollection';

const App = () => {
  const [collection, setCollection] = React.useState([]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<ChronoSphere 
            collection={collection} 
            setCollection={setCollection} 
          />} 
        />
        <Route 
          path="/collection" 
          element={<MyCollection collection={collection} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;