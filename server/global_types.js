const globalTypes = {
    product: {
        fits: {
            FIT_TYPE_MENS: 0x01, // 00000001
            FIT_TYPE_WOMENS: 0x02, // 00000010
            FIT_TYPE_BOYS: 0x04, // 00000100
            FIT_TYPE_GIRLS: 0x08  // 00001000
        },

        sizes: [
            'SIZE_YOUTH_XS',
            'SIZE_YOUTH_S',
            'SIZE_YOUTH_M',
            'SIZE_YOUTH_L',
            'SIZE_YOUTH_XL',
            'SIZE_ADULT_XS',
            'SIZE_ADULT_S',
            'SIZE_ADULT_M',
            'SIZE_ADULT_L',
            'SIZE_ADULT_XL',
            'SIZE_ADULT_2XL',
            'SIZE_ADULT_3XL',
            'SIZE_ADULT_4XL',
            'SIZE_ADULT_5XL'
        ],

        subtypes: {
            PRODUCT_SUBTYPE_HATS: 0x01, // 00000001
            PRODUCT_SUBTYPE_TOPS: 0x02,  // 00000010
            PRODUCT_SUBTYPE_SOCKS: 0x04  // 00000100
        },

        types: {
            PRODUCT_TYPE_APPAREL: 0x01 // 00000001
        },

        material_types: {
            MATERIAL_TYPE_COTTON: 0x01,
            MATERIAL_TYPE_TRI_BLEND: 0x02
        }
    }
};

// exports.product = globalTypes.product;
module.exports = globalTypes;
