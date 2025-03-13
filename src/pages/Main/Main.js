import React, {useState} from "react";
import './Main.css';
import Loading from "../../components/Loading/Loading";

const Main = () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <main className="main">
            {/* 로딩 컴포넌트 표시 */}
            {isLoading && <Loading text="데이터를 불러오는 중..."/>}
            {
                !isLoading && <div className="content">
                    <h1>Main Content</h1>
                    <p>여기에 메인 컨텐츠가 표시됩니다.</p>
                </div>
            }

        </main>

    );
};

export default Main;