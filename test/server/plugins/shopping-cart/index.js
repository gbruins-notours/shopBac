const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hoek = require('@hapi/hoek');
const Products = require('../../../../server/plugins/products');
const BookshelfOrm = require('../../../../server/plugins/bookshelf-orm');
const testHelpers = require('../../testHelpers');
const { getServer, getManifest } = require('./_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing Cart plugin', () => {

    it('errors on missing BookshelfOrm plugin', async () => {
        const manifest = Hoek.clone(getManifest());
        testHelpers.spliceRegistrationFromManifest('./plugins/bookshelf-orm', manifest);

        let error = null;

        try {
            await getServer(manifest);
        }
        catch(err) {
            error = err;
        }

        expect(error).to.exist();
        expect(error.message).to.include(`missing dependency ${BookshelfOrm.plugin.pkg.name}`);
    });


    it('errors on missing Products plugin', async () => {
        const manifest = Hoek.clone(getManifest());
        testHelpers.spliceRegistrationFromManifest('./plugins/products', manifest);

        let error = null;

        try {
            await getServer(manifest);
        }
        catch(err) {
            error = err;
        }

        expect(error).to.exist();
        expect(error.message).to.include(`missing dependency ${Products.plugin.pkg.name}`);
    });


    it('should have a Cart model', async () => {
        const server = await getServer();
        expect(server.app.bookshelf.model('Cart')).to.be.a.function();
    });

});
