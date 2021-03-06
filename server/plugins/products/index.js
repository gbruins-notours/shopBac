const Joi = require('@hapi/joi');


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.dependency(
            ['BookshelfOrm', 'Core'],
            function (server) {
                const routePrefix = '/api/v1';
                const ProductCtrl = new (require('./controllers/ProductCtrl'))(server);
                const ProductVariantCtrl = new (require('./controllers/ProductVariantCtrl'))(server);
                const ProductVariantSkuCtrl = new (require('./controllers/ProductVariantSkuCtrl'))(server);
                const ProductAccentMessageCtrl = new (require('./controllers/ProductAccentMessageCtrl'))(server);
                const ProductColorSwatchCtrl = new (require('./controllers/ProductColorSwatchCtrl'))(server);
                const ProductCollectionCtrl = new (require('./controllers/ProductCollectionCtrl'))(server);
                const ProductDataTableCtrl = new (require('./controllers/ProductDataTableCtrl'))(server);

                const payloadMaxBytes = process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760; // 10MB (1048576 (1 MB) is the default)

                server.route([
                    {
                        method: 'GET',
                        path: `${routePrefix}/products`,
                        options: {
                            description: 'Gets a list of products',
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            handler: (request, h) => {
                                return ProductCtrl.getPageHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product`,
                        options: {
                            description: 'Finds a product by ID',
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid(),
                                    tenant_id: Joi.string().uuid(),
                                    viewAllRelated: Joi.boolean().optional()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCtrl.getByIdHandler(
                                    request,
                                    { withRelated: ProductCtrl.getWithRelated() },
                                    h
                                );
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product`,
                        options: {
                            description: 'Creates a product',
                            validate: {
                                payload: Joi.object({
                                    ...ProductCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCtrl.upsertHandler(request, h);
                            },
                            payload: {
                                maxBytes: payloadMaxBytes
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product`,
                        options: {
                            description: 'Updates a product',
                            validate: {
                                payload: Joi.object({
                                    ...ProductCtrl.getSchema(true)
                                })
                            },
                            handler: (request, h) => {
                                return ProductCtrl.upsertHandler(request, h);
                            },
                            payload: {
                                maxBytes: payloadMaxBytes
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product`,
                        options: {
                            description: 'Deletes a product',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid()
                                })
                            },
                            handler: (request, h) => {
                                // TODO:  need to refactor this
                                return ProductCtrl.deleteHandler(request, h);
                            }
                        }
                    },
                    // {
                    //     method: 'DELETE',
                    //     path: `${routePrefix}/product/image`,
                    //     options: {
                    //         description: 'Deletes a Product image',
                    //         validate: {
                    //             query: Joi.object({
                    //                 id: Joi.string().uuid().required(),
                    //                 tenant_id: Joi.string().uuid()
                    //             })
                    //         },
                    //         handler: (request, h) => {
                    //             return ProductImageCtrl.deleteHandler(request, h);
                    //         }
                    //     }
                    // },


                    /******************************
                     * Product variants
                     ******************************/
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/variant`,
                        options: {
                            description: 'Deletes a product variant',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid()
                                })
                            },
                            handler: (request, h) => {
                                return ProductVariantCtrl.deleteHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/variant/sku`,
                        options: {
                            description: 'Gets a variant SKU',
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductVariantSkuCtrl.getByIdHandler(request, null, h);
                            }
                        }
                    },

                    /******************************
                     * Product Accent Messages
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/accent_messages`,
                        options: {
                            description: 'Gets a list of product accent messages',
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.getPageHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/accent_messages/all`,
                        options: {
                            description: 'Gets a list of product accent messages',
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.getAllHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/accent_message`,
                        options: {
                            description: 'Gets a product accent message by ID',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.getByIdHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/accent_message`,
                        options: {
                            description: 'Adds a new product accent message',
                            validate: {
                                payload: Joi.object({
                                    ...ProductAccentMessageCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/accent_message`,
                        options: {
                            description: 'Updates a product accent message',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductAccentMessageCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/accent_message`,
                        options: {
                            description: 'Deletes a product accent message',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductAccentMessageCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Product Color Swatches
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/color_swatches`,
                        options: {
                            description: 'Gets a list of product color swatches',
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.getPageHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/color_swatches/all`,
                        options: {
                            description: 'Gets a list of product color swatches',
                            auth: {
                                strategies: ['session']
                            },
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.getAllHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/color_swatch`,
                        options: {
                            description: 'Gets a product color swatch by ID',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.getByIdHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/color_swatches`,
                        options: {
                            description: 'Adds a new product color swatch',
                            validate: {
                                payload: Joi.object({
                                    ...ProductColorSwatchCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/color_swatches`,
                        options: {
                            description: 'Updates a product color swatch',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductColorSwatchCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/color_swatch`,
                        options: {
                            description: 'Deletes a product color swatch',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductColorSwatchCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Product Collections
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/collections`,
                        options: {
                            description: 'Gets a list of product collections',
                            handler: (request, h) => {
                                return ProductCollectionCtrl.getPageHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/collection`,
                        options: {
                            description: 'Gets a product collection by ID',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCollectionCtrl.getByIdHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/collection`,
                        options: {
                            description: 'Adds a new product collection',
                            validate: {
                                payload: Joi.object({
                                    ...ProductCollectionCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCollectionCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/collection`,
                        options: {
                            description: 'Updates a product collection',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductCollectionCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCollectionCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/collection`,
                        options: {
                            description: 'Deletes a product collection',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCollectionCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Product Data Tables
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/data_tables`,
                        options: {
                            description: 'Gets a list of product data tables',
                            handler: (request, h) => {
                                return ProductDataTableCtrl.getPageHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/data_tables/all`,
                        options: {
                            description: 'Gets a list of product data tables',
                            handler: (request, h) => {
                                return ProductDataTableCtrl.getAllHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/data_table`,
                        options: {
                            description: 'Gets a product data table by ID',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductDataTableCtrl.getByIdHandler(request, null, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/data_table`,
                        options: {
                            description: 'Adds a new product data table',
                            validate: {
                                payload: Joi.object({
                                    ...ProductDataTableCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductDataTableCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/data_table`,
                        options: {
                            description: 'Updates a product data table',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductDataTableCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductDataTableCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/data_table`,
                        options: {
                            description: 'Deletes a product data table',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    tenant_id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductDataTableCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Misc
                     ******************************/
                    {
                        method: 'GET',
                        path: '/product/share', // NOTE: no routePrefix on this one
                        options: {
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            validate: {
                                query: Joi.object({
                                    uri: Joi.string()
                                })
                            }
                        },
                        handler: (request, h) => {
                            return ProductCtrl.productShareHandler(request, h);
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/info`,
                        options: {
                            description: 'Returns general info about products',
                            auth: {
                                strategies: ['storeauth', 'session']
                            },
                            handler: (request, h) => {
                                return ProductCtrl.productInfoHandler(request, h);
                            }
                        }
                    },

                    /******************************
                     * Admin routes
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/admin/products`,
                        options: {
                            description: 'Gets a list of products',
                            handler: (request, h) => {
                                return ProductCtrl.getAdminProductList(request, h);
                            }
                        }
                    },

                    /******************************
                     * Other
                     ******************************/
                    {
                        method: 'GET',
                        path: '/sitemap.xml', // NOTE: no routePrefix on this one
                        options: {
                            auth: {
                                strategies: ['storeauth', 'session']
                            }
                        },
                        handler: (request, h) => {
                            return ProductCtrl.sitemapHandler(request, h);
                        }
                    }
                ]);


                // LOADING BOOKSHELF MODELS:
                const baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

                server.app.bookshelf.model(
                    'Product',
                    require('./models/Product')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductVariant',
                    require('./models/ProductVariant')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductVariantSku',
                    require('./models/ProductVariantSku')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductAccentMessage',
                    require('./models/ProductAccentMessage')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductColorSwatch',
                    require('./models/ProductColorSwatch')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductCollection',
                    require('./models/ProductCollection')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductDataTable',
                    require('./models/ProductDataTable')(baseModel, server.app.bookshelf, server)
                );
            }
        );
    }
};
