const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend({
        tableName: CoreService.DB_TABLES.tenants,

        uuid: true,

        hasTimestamps: true,

        visible: [
            'id',
            'email',
            'cors_origin',
            'api_key',
            'active',
            'created_at',
            'updated_at'
        ]
    });
};