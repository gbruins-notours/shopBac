const { DB_TABLES } = require('../../plugins/core/services/CoreService');

module.exports.up = (knex) => {
    return knex.schema.table(DB_TABLES.products, (t) => {
        t.dropColumn('sku');
        t.dropColumn('cost');
        t.dropColumn('weight_oz');
        t.dropColumn('hide_if_out_of_stock');
    });
};

module.exports.down = (knex) => {
    return knex.schema.table(DB_TABLES.products, function(t) {
        t.integer('inventory_count').defaultTo(0);
    })
};

