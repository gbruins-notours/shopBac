'use strict';

const { getList, getSingle, postCreate } = require('./helpers')
const { getOrder } = require('./orders')
const basePath = '/transactions';



/**
 * There are 2 APIs for creating shipping label ('transaction')
 * 1) Using the 'rate' id:  https://goshippo.com/docs/reference/js#transactions-create
 * 2) Using the 'shipment' object:  https://goshippo.com/docs/reference/js#transactions-create-instant
 *
 * This method is for #2
 *
 * @param {*} data
 */
async function createShippingLabel(data) {
    return await postCreate(basePath, data);
}


async function getShippingLabel(transactionId) {
    return await getSingle(`${basePath}/${transactionId}`)
}



module.exports = {
    createShippingLabel,
    getShippingLabel
}



