import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

class AuthService {
    async register(user) {
        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('password', user.password);
        if (user.image) {
            formData.append('image', user.image);
        }

        return axios.post(`${API_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    }

    async login(credentials) {
        return axios.post(`${API_URL}/login`, credentials);
    }
}

export default new AuthService();
