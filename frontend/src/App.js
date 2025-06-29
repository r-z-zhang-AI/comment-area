// frontend/src/App.js
import React from 'react';
import { Container } from 'react-bootstrap';
import CommentList from './components/CommentList';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Container className="py-4">
      <CommentList />
    </Container>
  );
}

export default App;