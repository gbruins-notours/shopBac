export default ($http) => ({

    async register(userData) {
        const { data } = await $http.$post('/tenant', userData);
        return data;
    },

    async login(userData) {
        const { data } = await $http.$post('/tenant/user/login', userData);
        return data;
    },

    async logout(userData) {
        const { data } = await $http.$post('/tenant/user/logout');
        return data;
    }

});
