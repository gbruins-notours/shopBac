const Joi = require('@hapi/joi');
const path = require('path');


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.dependency(
            ['BookshelfOrm', 'Core'],
            function (server) {
                const routePrefix = '/api/v1';
                const ProductCtrl = new (require('./controllers/ProductCtrl'))(server);
                const ProductImageCtrl = new (require('./controllers/ProductImageCtrl'))(server);
                const ProductSkuCtrl = new (require('./controllers/ProductSkuCtrl'))(server);
                const ProductSkuImageCtrl = new (require('./controllers/ProductSkuImageCtrl'))(server);
                const ProductSkuOptionCtrl = new (require('./controllers/ProductSkuOptionCtrl'))(server);


                // Yes this was aleady set in the Core plugin, but apparently
                // it must be set in every plugin that needs a view engine:
                // https://github.com/hapijs/vision/issues/94
                server.views({
                    engines: {
                        html: require('handlebars')
                    },
                    // path: path.resolve(__dirname, '../../..')
                    path: path.resolve(__dirname, '../../../dist')
                    // path: '../../../dist/views',
                    // partialsPath: '../../views/partials',
                    // relativeTo: __dirname // process.cwd() // prefer this over __dirname when compiling to dist/cjs and using rollup
                });

                server.route([
                    {
                        method: 'GET',
                        path: `${routePrefix}/products`,
                        options: {
                            description: 'Gets a list of products',
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
                            validate: {
                                query: {
                                    id: Joi.string().uuid(),
                                    viewAllRelated: Joi.boolean().optional()
                                }
                            },
                            handler: (request, h) => {
                                return ProductCtrl.getByIdHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product`,
                        options: {
                            description: 'Creates a product',
                            validate: {
                                payload: ProductCtrl.getSchema()
                            },
                            handler: (request, h) => {
                                return ProductCtrl.upsertHandler(request, h);
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
                                    id: Joi.string().uuid().required(),
                                    ...ProductCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/seo`,
                        options: {
                            description: 'Finds a product by it\'s seo uri',
                            validate: {
                                query: {
                                    id: Joi.string().max(100)
                                }
                            },
                            handler: (request, h) => {
                                return ProductCtrl.productSeoHandler(request, h);
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
                                    id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                // TODO:  need to refactor this
                                return ProductCtrl.deleteHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/image`,
                        options: {
                            description: 'Add a Product image',
                            validate: {
                                payload: ProductImageCtrl.getUploadSchema()
                            },
                            payload: {
                                output: 'stream',
                                parse: true,
                                allow: 'multipart/form-data',
                                maxBytes: process.env.PRODUCT_IMAGE_MAX_BYTES || 7 * 1000 * 1000
                            },
                            handler: (request, h) => {
                                return ProductImageCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/image`,
                        options: {
                            description: 'Deletes a Product image',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductImageCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Product Skus
                     ******************************/
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/sku`,
                        options: {
                            description: 'Creates a product SKU',
                            validate: {
                                payload: ProductSkuCtrl.getSchema()
                            },
                            handler: (request, h) => {
                                return ProductSkuCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/sku`,
                        options: {
                            description: 'Updates a product SKU',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductSkuCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductSkuCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/sku`,
                        options: {
                            description: 'Deletes a product SKU',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductSkuCtrl.deleteHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/sku/image`,
                        options: {
                            description: 'Add a SKU image',
                            validate: {
                                payload: ProductSkuImageCtrl.getUploadSchema()
                            },
                            payload: {
                                output: 'stream',
                                parse: true,
                                allow: 'multipart/form-data',
                                maxBytes: process.env.PRODUCT_IMAGE_MAX_BYTES || 7 * 1000 * 1000
                            },
                            handler: (request, h) => {
                                return ProductSkuImageCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/sku/image`,
                        options: {
                            description: 'Deletes a product SKU image',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductSkuImageCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    /******************************
                     * Product Sku options
                     ******************************/
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/sku/options`,
                        options: {
                            description: 'Finds SKU options',
                            handler: (request, h) => {
                                return ProductSkuOptionCtrl.getPageHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'GET',
                        path: `${routePrefix}/product/sku/option`,
                        options: {
                            description: 'Finds a SKU option by ID',
                            validate: {
                                query: {
                                    id: Joi.string().uuid()
                                }
                            },
                            handler: (request, h) => {
                                return ProductSkuOptionCtrl.getByIdHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'POST',
                        path: `${routePrefix}/product/sku/option`,
                        options: {
                            description: 'Add a SKU option',
                            validate: {
                                payload: ProductSkuOptionCtrl.getSchema()
                            },
                            handler: (request, h) => {
                                return ProductSkuOptionCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'PUT',
                        path: `${routePrefix}/product/sku/option`,
                        options: {
                            description: 'Updates a SKU option',
                            validate: {
                                payload: Joi.object({
                                    id: Joi.string().uuid().required(),
                                    ...ProductSkuOptionCtrl.getSchema()
                                })
                            },
                            handler: (request, h) => {
                                return ProductSkuOptionCtrl.upsertHandler(request, h);
                            }
                        }
                    },
                    {
                        method: 'DELETE',
                        path: `${routePrefix}/product/sku/option`,
                        options: {
                            description: 'Deletes a SKU option',
                            validate: {
                                query: Joi.object({
                                    id: Joi.string().uuid().required()
                                })
                            },
                            handler: (request, h) => {
                                return ProductSkuOptionCtrl.deleteHandler(request, h);
                            }
                        }
                    },


                    {
                        method: 'GET',
                        path: '/product/share', // NOTE: no routePrefix on this one
                        options: {
                            auth: false,
                            validate: {
                                query: {
                                    uri: Joi.string()
                                }
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
                            auth: false
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
                    'ProductImage',
                    require('./models/ProductImage')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductSku',
                    require('./models/ProductSku')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductSkuImage',
                    require('./models/ProductSkuImage')(baseModel, server.app.bookshelf, server)
                );

                server.app.bookshelf.model(
                    'ProductSkuOption',
                    require('./models/ProductSkuOption')(baseModel, server.app.bookshelf, server)
                );
            }
        );
    }
};
