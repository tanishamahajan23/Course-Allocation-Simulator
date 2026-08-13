const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                ...options.headers,

                ...(token
                    ? {
                          Authorization:
                              `Bearer ${token}`,
                      }
                    : {}),
            },
        }
    );

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        throw new Error(
            "Authentication required."
        );
    }

    return response;
}
