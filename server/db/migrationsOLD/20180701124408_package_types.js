const { DB_TABLES } = require('../../plugins/core/services/CoreService');


module.exports.up = (knex) => {
    return knex.schema.createTable(
        DB_TABLES.package_types,
        (t) => {
            t.uuid('id').primary();
            t.integer('type').nullable();
            t.string('label').nullable();
            t.decimal('length').nullable();
            t.decimal('width').nullable();
            t.decimal('height').nullable();
            t.decimal('weight').nullable();
            t.string('mass_unit').nullable();
            t.string('distance_unit').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            t.index([
                'id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(DB_TABLES.package_types);
};
