const { DB_TABLES } = require('../../plugins/core/services/CoreService');

module.exports.up = (knex) => {
    return knex.schema.createTable(
        DB_TABLES.product_color_swatches,
        (t) => {
            t.uuid('id').primary();
            t.uuid('tenant_id').nullable();
            t.string('hex').nullable();
            t.string('label').nullable();
            t.string('description').nullable();
            t.jsonb('metadata').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            t.index([
                'id',
                'tenant_id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(DB_TABLES.product_color_swatches);
};
