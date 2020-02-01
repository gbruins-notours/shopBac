'use strict';

import queryString from 'query-string';

export default {
    methods: {
        async getPayment(id) {
            const response = await this.$axios.$get('/payment', {
                params: { id }
            });
            return response.data;
        },


        async getPayments(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/payments?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },


        async createPackingSlipFromPayment(paymentId) {
            const response = await this.$axios.$post('/payment/shipping/packingslip', {
                id: paymentId
            });
            return response.data;
        },


        async purchaseShippingLabel(data) {
            const response = await this.$axios.$post('/payment/shipping/label', data);
            return response.data;
        },


        async getShippingLabel(paymentId) {
            const response = await this.$axios.$get('/payment/shipping/label', {
                params: {
                    id: paymentId
                }
            });

            return response.data;
        },


        async deleteShippingLabelForPayment(paymentId) {
            const response = await this.$axios.$delete('/payment/shipping/label', {
                params: {
                    id: paymentId
                }
            });
            return response.data;
        },


        goToPaymentDetails: function(transactionId) {
            return this.$router.push({
                name: 'order-details-id',
                params: { id: transactionId }
            });
        },


        goToPaymentSuccess: function(transactionId) {
            return this.$router.push({
                name: 'order-id',
                params: { id: transactionId }
            });
        }
    }
}
