import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { loginSuccess } from "../actions/authActions";

// API 호출
const loginApi = (credentials) => axios.post("/api/login", credentials);

// Saga 함수
function* loginSaga(action) {
    try {
        const response = yield call(loginApi, action.payload);
        yield put(loginSuccess(response.data));
    } catch (error) {
        console.error("Login failed", error);
    }
}

// Watcher
export default function* authSaga() {
    yield takeLatest("LOGIN_REQUEST", loginSaga);
}
