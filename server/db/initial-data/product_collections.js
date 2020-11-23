const CoreService = require('../../plugins/core/core.service');
const { tenantId, randomUuid } = require('../utils');

exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.product_collections)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const d = new Date();

                return Promise.all([
                    knex(CoreService.DB_TABLES.product_collections).insert({
                        id: randomUuid(),
                        published: true,
                        tenant_id: tenantId,
                        name: 'Fall 2020',
                        value: 1,
                        description: 'fall 2020 description',
                        seo_page_title: 'BreadVan Fall 2020 Collection!',
                        seo_page_desc: 'An exciting description goes here',
                        seo_uri: 'fall2020',
                        created_at: d,
                        updated_at: d
                    })
                ]);
            }
        );
};
