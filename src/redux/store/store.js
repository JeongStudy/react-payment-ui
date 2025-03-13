import { createStore, applyMiddleware } from "redux";
import rootReducer from "../reducers/rootReducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas/rootSaga.js";

// Redux-Saga 미들웨어 생성
const sagaMiddleware = createSagaMiddleware();

// Redux 스토어 생성
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

// Saga 실행
sagaMiddleware.run(rootSaga);

export default store;
