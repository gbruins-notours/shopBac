const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend({
        tableName: CoreService.DB_TABLES.master_types,

        uuid: true,

        hasTimestamps: true,

        format(attributes) {
            if (attributes.metadata) {
                attributes.metadata = JSON.stringify(attributes.metadata)
            }

            return attributes;
        },

        // tenant_id is not visible
        visible: [
            'id',
            'published',
            'object',
            'name',
            'value',
            'slug',
            'description',
            'metadata',
            'created_at',
            'updated_at'
        ]
    });
};