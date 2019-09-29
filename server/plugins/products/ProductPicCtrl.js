const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const Promise = require('bluebird');
const isObject = require('lodash.isobject');
const cloneDeep = require('lodash.clonedeep');
const fileType = require('file-type');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const helperService = require('../../helpers.service');
const BaseController = require('./BaseController');

// Configure AWS client for use with Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
AWS.config.update({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET
});
const s3 = new AWS.S3(); // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

const imageMimeTypeWhiteList = [
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/pjpeg'
];


class ProductPicCtrl extends BaseController {

    constructor(server, modelName) {
        super(server, modelName);
    }


    getSchema() {
        return {
            id: Joi.string().uuid(),
            sort_order: Joi.number().integer().min(0),
            is_visible: Joi.boolean(),
            product_id: Joi.string().uuid()
        };
    }


    getProductPicVariantModel() {
        return this.server.app.bookshelf.model('ProductPicVariant');
    }


    getCloudUrl() {
        return `https://${process.env.DIGITAL_OCEAN_SPACE_NAME}.${process.env.DIGITAL_OCEAN_SPACES_ENDPOINT}`;
    }


    getCloudImagePath(fileName) {
        return `${process.env.NODE_ENV}/uploads/images/${fileName}`;
    }


    fileIsImage(fileData) {
        let typeObj = fileType(fileData);

        if(isObject(typeObj) && imageMimeTypeWhiteList.indexOf(typeObj.mime) > -1) {
            return typeObj;
        }

        return false;
    }


    async deleteFile(url) {
        return new Promise((resolve, reject) => {
            if(!url) {
                return;
            }

            let arr = url.split('/');
            let fileName = arr[arr.length - 1];

            if(!fileName) {
                reject(`Can not delete file for url ${url}`);
                return;
            }

            const config = {
                Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
                Key: this.getCloudImagePath(fileName)
            };

            s3.deleteObject(config, (err, data) => {
                if(err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }


    /**
     * Saves a new picture file to disk, which is only temorary.
     * Nanobox does not persist file contents between deploys.  Therefore product pics
     * would be wiped out when a new version of the app is deployed to Nanobox.
     * After the file is saved then it will be uploaded to cloud storage.  The saved file
     * is no longer needed after that.
     * More info here about 'writable directories' on Nanobox:
     * https://docs.nanobox.io/app-config/writable-dirs/
     */
    async resizeAndWrite(req, width) {
        return new Promise((resolve, reject) => {
            // Cloning is necessary because the file.pipe operation below seems
            // to modify the request.payload.file value, causing subsequest
            // resize attemtps on the same file to fail.
            let file = cloneDeep(req.payload.file);

            if(file) {
                let typeObj = this.fileIsImage(file._data)

                if(typeObj) {
                    let w = parseInt(width, 10) || 600
                    let cleanId = helperService.stripTags(helperService.stripQuotes(req.payload.product_id));
                    let fileName = `${cleanId}_${new Date().getTime()}.${typeObj.ext}`;

                    // Read image data from readableStream,
                    // resize,
                    // emit an 'info' event with calculated dimensions
                    // and finally write image data to writableStream
                    // http://sharp.pixelplumbing.com/en/stable/api-resize/
                    // http://sharp.pixelplumbing.com/en/stable/api-output/#tobuffer
                    let transformer = sharp()
                        .resize({
                            width: w
                        })
                        .toBuffer((err, buffer, info) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            global.logger.info('IMAGE RESIZING', {
                                meta: info
                            });

                            let fileKey = this.getCloudImagePath(fileName);
                            let { mime } = fileType(buffer);

                            // https://gist.github.com/SylarRuby/b60eea29c1682519e422476cc5357b60
                            const s3Config = {
                                Bucket: process.env.DIGITAL_OCEAN_SPACE_NAME,
                                Key: fileKey,
                                Body: buffer,
                                ACL: 'public-read',
                                ContentEncoding: 'base64', // required
                                ContentType: mime
                                // Metadata: {
                                //     'Content-Type': typeObj.mime
                                // }
                            };

                            s3.upload(s3Config, (err, data) => {
                                if (err) {
                                    global.logger.error('IMAGE UPLOAD FAILURE', err);
                                    return reject(err);
                                }

                                global.logger.info('IMAGE SUCCESSFULLY UPLOADED', {
                                    meta: data
                                });

                                return resolve({
                                    url: `${this.getCloudUrl()}/${fileKey}`,
                                    width: w
                                });
                            })
                        });

                    file.pipe(transformer);
                }
                else {
                    global.logger.info('SAVING PRODUCT FAILED BECAUSE WRONG MIME TYPE');
                    return reject('File type must be one of: ' + imageMimeTypeWhiteList.join(','))
                }
            }
            else {
                resolve();
            }
        });
    }


    /**
     * Deletes the product file if a new file is being sent in the request payload.
     * A successful file delete will then return the ProductPic in the response,
     * otherwise the response will be empty.
     */
    async unlinkFileAndVariantsIfBeingReplaced(request) {
        if(request.payload.id && request.payload.file) {
            // Delete the current product picture if an id is being passed (updating)
            // and a new file is being uploaded
            let ProductPic = await this.unlinkFileAndVariants(request.payload.id);
            return ProductPic;
        }
    }


    /**
     * Deletes a file from the file system, and does the same
     * with any variants this file may have
     *
     * @param {*} id
     * @returns {ProductPic}  Returns the ProductPic model
     */
    async unlinkFileAndVariants(id) {
        // Query the DB to get the file name of the pic
        // and all of the pics variants
        let ProductPic = await this.getModel().findById(id, {
            withRelated: ['pic_variants']
        });

        if(!ProductPic) {
            throw new Error('Unable to find product picture.');
        }

        let json = ProductPic.toJSON();

        if(json.url) {
            // Unlink the main product pic
            await this.deleteFile(json.url)
            global.logger.info('PRODUCT PIC - FILE DELETED', {
                meta: {
                    jsonUrl: json.url
                }
            });

            // Unlink the product pic variants
            if(Array.isArray(json.pic_variants)) {
                json.pic_variants.forEach(async (obj) => {
                    await this.deleteFile(obj.url);
                    global.logger.info('PRODUCT PIC VARIANT - FILE DELETED', {
                        meta: {
                            fileUrl: obj.url
                        }
                    });
                });
            }

            return ProductPic
        }
    }


    deleteVariants(ProductPic) {
        if(!ProductPic) {
            return;
        }

        let json = ProductPic.toJSON();

        if(Array.isArray(json.pic_variants)) {
            json.pic_variants.forEach((obj) => {
                global.logger.info('DELETING PRODUCT PIC VARIANT FROM DB', {
                    meta: {
                        id: obj.id
                    }
                });

                this.getProductPicVariantModel().destroy({
                    id: obj.id
                });
            });
        }
    }


    /**
     * Upserts and resizes a standard product pic as well as its larger variant (ProductPicVariant)
     *
     * @param {*} req
     * @param {*} options
     **/
    async upsertPic(request) {
        try {
            const ProductPic = await this.unlinkFileAndVariantsIfBeingReplaced(request);

            // Always delete the variants and re-create
            if(request.payload.file) {
                this.deleteVariants(ProductPic)
            }
        }
        catch(e) {
            // just dropping the exception beacuse issues deleting the file
            // shouldn't stop this process from continuing
            global.logger.error('ERROR UNLINKING FILE', e)
        }

        const resizeResponse = await this.resizeAndWrite(request, 600);

        global.logger.info('PRODUCT PIC - FILE RESIZED (600)', {
            meta: {
                resizeResponse
            }
        });

        // update or create the ProductPic
        const createParams = {
            product_id: request.payload.product_id,
            is_visible: request.payload.is_visible === true ? true : false,
            sort_order: parseInt(request.payload.sort_order, 10) || 1
        };

        // resizeResponse will be empty if the HTTP request did not include a file
        // (which it may not if the user in only updating other attributes)
        if(isObject(resizeResponse)) {
            createParams.url = resizeResponse.url;
            createParams.width = resizeResponse.width || null;
            createParams.height = resizeResponse.height || null;
        }

        let ProductPic;
        if(request.payload.id) {
            ProductPic = await this.getModel().update(createParams, { id: request.payload.id });
        }
        else {
            ProductPic = await this.getModel().create(createParams);
        }

        global.logger.info('PRODUCT PIC UPSERTED', {
            meta: {
                picture_id: ProductPic.get('id')
            }
        });

        let ProductPicVariant = await this.createPicVariant(request, ProductPic.get('id'), 1000);
        return ProductPicVariant.get('product_pic_id');
    }


    async createPicVariant(request, productPicId, width) {
        const picWidth = width || 1000;
        const resizeResponse = await this.resizeAndWrite(request, picWidth);

        global.logger.info(`PRODUCT PIC VARIANT - FILE RESIZED (${picWidth})`, {
            meta: {
                resizeResponse
            }
        });

        const createParams = {
            product_pic_id: productPicId,
            is_visible: request.payload.is_visible === true ? true : false
        };

        if(isObject(resizeResponse)) {
            createParams.url = resizeResponse.url;
            createParams.width = resizeResponse.width || null;
            createParams.height = resizeResponse.height || null;
        }

        global.logger.info('PRODUCT PIC VARIANT - CREATING BEGIN', {
            meta: createParams
        });

        const ProductPicVariant = this.getProductPicVariantModel().create(createParams);

        global.logger.info('PRODUCT PIC VARIANT - CREATING END', {
            meta: {
                product_pic_id: ProductPicVariant.get('product_pic_id')
            }
        });

        return ProductPicVariant;
    }


    /**
     * Deletes the picture from file and DB
     *
     * @param {*} productPicId
     */
    deletePic(productPicId) {
        return new Promise(async (resolve, reject) => {

            global.logger.info('REQUEST: ProductPicCtrl.deletePic', {
                meta: { productPicId }
            });

            try {
                await this.unlinkFileAndVariants(productPicId);
            }
            catch(err) {
                // just dropping the exception beacuse issues deleting the file
                // shouldn't stop this process from continuing
                global.logger.error(err);
                global.bugsnag(err);
            }

            try {
                //TODO: Get the product.  If this is the featured pic, assign a new one on the product

                const ProductPic = await this.getModel().destroy({ id: productPicId });

                global.logger.info('RESPONSE: ProductPicCtrl.deletePic', {
                    meta: ProductPic ? ProductPic.toJSON() : null
                });

                resolve(ProductPic);
            }
            catch(err) {
                global.logger.error(err);
                global.bugsnag(err);
                reject(err)
            }
        });
    }


    /***************************************
     * route handlers
     /**************************************/

    async upsertHandler(request, h) {
        try {
            const productPicId = await this.upsertPic(request);

            if(!productPicId) {
                throw Boom.badRequest('Unable to create a a new product picture.');
            }

            global.logger.info(
                request.payload.id ? 'PRODUCT PIC - DB UPDATED' : 'PRODUCT PIC - DB CREATED',
                {
                    meta: {
                        productPicId
                    }
                }
            );

            return h.apiSuccess({
                product_pic_id: productPicId
            });
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    };


    async deleteHandler(request, h) {
        try {
            const productPicId = request.query.id;

            global.logger.info('REQUEST: ProductPicCtrl.deleteHandler', {
                meta: { productPicId }
            });

            const ProductPic = await this.deletePic(productPicId);

            global.logger.info('RESPONSE: ProductPicCtrl.deleteHandler', {
                meta: ProductPic ? ProductPic.toJSON() : null
            });

            return h.apiSuccess(ProductPic);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    };

}

module.exports = ProductPicCtrl;
