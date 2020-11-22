const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const cloneDeep = require('lodash.clonedeep');
const BaseController = require('../../core/BaseController');
const ProductVariantSkuCtrl = require('./ProductVariantSkuCtrl');
// const ProductSkuImageCtrl = require('./ProductSkuImageCtrl');


class ProductVariantCtrl extends BaseController {

    constructor(server) {
        super(server, 'ProductVariant');
        this.ProductVariantSkuCtrl = new ProductVariantSkuCtrl(server);
        // this.ProductSkuImageCtrl = new ProductSkuImageCtrl(server);  // TODO
    }


    getSchema(isUpdate) {
        const schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean().empty('').default(false),
            ordinal: Joi.number().integer().min(0).allow(null),
            label: Joi.alternatives().try(Joi.string().max(100), Joi.allow(null)),

            // PRICING
            currency: Joi.alternatives().try(Joi.string().max(3), Joi.allow(null)),
            base_price: Joi.number().integer().min(0).empty('').default(0),
            cost_price: Joi.number().integer().min(0).empty('').default(0),
            compare_at_price: Joi.number().integer().min(0).empty('').default(0),
            sale_price: Joi.number().integer().min(0).empty('').default(0),
            is_on_sale: Joi.boolean().empty('').default(false),
            is_taxable: Joi.boolean().empty('').default(false),
            tax_code: Joi.alternatives().try(Joi.number(), Joi.allow(null)),

            // ACCENT MESSAGE
            accent_message_id: Joi.alternatives().try(Joi.string().uuid(), Joi.allow(null)),
            accent_message_begin: Joi.alternatives().try(Joi.date(), Joi.allow(null)),
            accent_message_end: Joi.alternatives().try(Joi.date(), Joi.allow(null)),

            // MEDIA
            exhibitType: Joi.alternatives().try(Joi.string().empty(''), Joi.allow(null)),
            exhibits: Joi.alternatives().try(Joi.string().empty(''), Joi.allow(null)),

            // SHIPPING
            requires_shipping: Joi.boolean().empty('').default(true),
            weight_oz: Joi.number().precision(2).min(0).max(99999999.99).empty('').default(0),
            customs_country_of_origin: Joi.alternatives().try(Joi.string().max(2), Joi.allow(null)),
            customs_harmonized_system_code: Joi.alternatives().try(Joi.string(), Joi.allow(null)),

            // product_id: Joi.string().uuid().required(),
            product_id: Joi.string().uuid(),

            skus: Joi.array().items(
                // Note: should not pass the 'isUpdate' flag to getSchema() in this case.
                // When creating a product, the user doesn't necessarily have to also create variants,
                // therefore updating a product may be the first time that a variants is added, in
                // which case the variant will not have an id
                Joi.object(this.ProductVariantSkuCtrl.getSchema())
            ),

            // TIMESTAMPS
            created_at: Joi.date(),
            updated_at: Joi.date()
        };

        if(isUpdate) {
            schema.id = Joi.string().uuid().required();
        }

        return schema;
    }


    getWithRelated() {
        const related = [
            {
                skus: (query) => {
                    // query.where('published', '=', true);
                    query.orderBy('ordinal', 'ASC');
                }
            },
        ];

        return related;
    }


    upsertVariant(data) {
        return new Promise(async (resolve, reject) => {
            try {
                global.logger.info(`REQUEST: ProductVariantCtrl.upsertVariant (${this.modelName})`, {
                    meta: {
                        variant: data
                    }
                });

                // remove skus from the data so we can save the model
                const skus = cloneDeep(data.skus);
                delete data.skus;

                const ProductVariant = await this.upsertModel(data);

                // resize and save variant images
                if(ProductVariant) {
                    await this.ProductVariantSkuCtrl.upsertSkus(
                        skus,
                        ProductVariant.get('id'),
                        ProductVariant.get('tenant_id')
                    );
                }

                global.logger.info(`RESPONSE: ProductVariantCtrl.upsertVariant (${this.modelName})`, {
                    meta: {
                        productVariant: ProductVariant ? ProductVariant.toJSON() : null
                    }
                });

                resolve(ProductVariant);
            }
            catch(err) {
                global.logger.error(err);
                global.bugsnag(err);
                reject(err);
            }
        });
    }


    upsertVariants(variants, productId, tenantId) {
        try {
            global.logger.info(`REQUEST: ProductVariantCtrl.upsertVariants (${this.modelName})`, {
                meta: {
                    tenantId,
                    productId,
                    variants
                }
            });

            const promises = [];

            if(Array.isArray(variants)) {
                variants.forEach((v) => {
                    promises.push(
                        this.upsertVariant({
                            tenant_id: tenantId,
                            product_id: productId,
                            ...v
                        })
                    );
                });
            }

            global.logger.info(`RESPONSE: ProductVariantCtrl.upsertVariants (${this.modelName}) - returning ${promises.length} promises`);

            return Promise.all(promises);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw err;
        }
    }


    /**
     * Deletes a sku, including all of its images
     *
     * @param {*} request
     * @param {*} h
     */
    async deleteVariant(id, tenant_id) {
        global.logger.info('REQUEST: ProductVariantCtrl.deleteVariant', {
            meta: { id, tenant_id }
        });

        const ProductVariant = await this.modelForgeFetch(
            { id, tenant_id },
            // { withRelated: ['images'] }
        );

        if(!ProductVariant) {
            throw new Error('Unable to find ProductVariant.');
        }

        // TODO: images or swatches
        // const images = ProductVariant.related('images').toArray();
        const promises = [];

        // Delete images
        // if(Array.isArray(images)) {
        //     try {
        //         images.forEach((obj) => {
        //             promises.push(
        //                 this.ProductSkuImageCtrl.deleteModel(obj.id, tenant_id)
        //             );
        //         });
        //     }
        //     catch(err) {
        //         global.logger.error('ProductSkuCtrl.deleteSku - ERROR DELETING IMAGES: ', err);
        //         throw err;
        //     }
        // }

        promises.push(
            this.deleteModel(id, tenant_id)
        );

        return Promise.all(promises);
    }


    /**
     * Deletes a sku, including all of its images
     *
     * @param {*} request
     * @param {*} h
     */
    async deleteHandler(request, h) {
        try {
            await this.deleteVariant(
                request.query.id,
                this.getTenantIdFromAuth(request)
            );

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}

module.exports = ProductVariantCtrl;
