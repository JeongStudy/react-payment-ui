import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Header from './pages/Header/Header';
import Main from './pages/Main/Main';
import Login from './pages/Login/Login';
import LoginAuthId from './pages/Login/LoginAuthId';
import Join from './pages/Join/Join';
import CardRegister from './pages/Card/CardRegister';
import InicisReturn from './pages/Card/InicisReturn'
import Order from './pages/Order/Order';
import Payment from './pages/Payment/Payment';
import {getCookie} from './utils/token';
import PaymentComplete from "./pages/Payment/PaymentComplete";

// PublicOnlyRoute 컴포넌트
const PublicOnlyRoute = ({children}) => {
    const isLoggedIn = !!getCookie("accessToken");
    return isLoggedIn ? <Navigate to="/" replace/> : children;
};

function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/auth" element={
                    <PublicOnlyRoute>
                        <Login/>
                    </PublicOnlyRoute>
                }>
                </Route>
                <Route path="/auth/id" element={
                    <PublicOnlyRoute>
                        <LoginAuthId/>
                    </PublicOnlyRoute>
                }/>
                <Route path="/join" element={
                    <PublicOnlyRoute>
                        <Join/>
                    </PublicOnlyRoute>
                }/>
                <Route path="/card/register" element={<CardRegister/>}/>
                <Route path="/card/return" element={<InicisReturn/>}/>
                <Route path="/order" element={<Order/>}/>
                <Route path="/payment" element={<Payment/>}/>
                <Route path="/payment/complete" element={<PaymentComplete />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
