export default {
    methods: {
        async taxmix_search() {
            const response = await this.$axios.$get('/taxes');
            return response.data;
        },


        async taxmix_get(id) {
            const response = await this.$axios.$get('/tax', {
                params: {
                    id
                }
            });

            return response.data;
        },


        async taxmix_add(data) {
            const response = await this.$axios.$post('/tax', data);
            return response.data;
        },


        async taxmix_update(data) {
            const response = await this.$axios.$put('/tax', data);
            return response.data;
        },


        async taxmix_delete(id) {
            const response = await this.$axios.$delete('/tax', {
                params: {
                    id
                }
            });

            return response.data;
        },


        taxmix_goToList() {
            this.$router.push({
                name: 'tax-list'
            });
        },

        taxmix_goToUpsert(id) {
            this.$router.push({
                name: 'tax-upsert-id',
                params: { id }
            });
        }
    }
}
