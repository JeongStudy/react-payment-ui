import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './pages/Header/Header';
import Main from './pages/Main/Main';
import Login from './pages/Login/Login';
import LoginAuthId from './pages/Login/LoginAuthId';
import Join from './pages/Join/Join';
import CardRegister from './pages/Card/CardRegister';
import InicisReturn from './pages/Card/InicisReturn';

function App() {
  return (
      <BrowserRouter>
        <Header/>
          <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/auth">
                  <Route index element={<Login />} /> {/* /auth */}
                  <Route path="id" element={<LoginAuthId />} /> {/* /auth/id */}
              </Route>
              <Route path="/join" element={<Join />} />
              <Route path="/card/register" element={<CardRegister />} />
              <Route path="/card/return" element={<InicisReturn />} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
