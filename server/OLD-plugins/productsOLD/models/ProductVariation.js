const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.product_variations,

            uuid: true,

            hasTimestamps: true,

            // One-to-One relation with Product
            // product_id is the foreign key in this model
            product: function() {
                return this.belongsTo('Product', 'product_id');
            },

            options: function() {
                // product_variation_id is the foreign key in ProductOption
                return this.hasMany('ProductOption', 'product_variation_id');
            },

            pics: function() {
                // product_variation_id is the foreign key in ProductPic
                return this.hasMany('ProductPic', 'product_variation_id');
            }
        },

        // Custom methods:
        {

        }
    );
};