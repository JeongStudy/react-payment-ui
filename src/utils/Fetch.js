const fetchData_ = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

const get = (url, headers = {}) => {
    return fetchData(url, {
        method: "GET",
        headers,
    });
};

const post = (url, body, headers = {}) => {
    return fetchData(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
};

const fetchData = async (url, options = {}) => {
    // Request 전처리
    const token = localStorage.getItem("authToken");
    const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Response 전처리
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch Interceptor Error:", error);
        throw error;
    }
};