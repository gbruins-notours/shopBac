import uuid from 'uuid';
import cloneDeep from 'lodash.clonedeep';
import IconWarningOutine from '@/components/icons/IconWarningOutline';

export default {
    methods: {
        errorToast(message, toastConfig, opts) {
            const cfg = Object.assign(
                {},
                {
                    variant: 'danger',
                    title: this.$t('Error')
                },
                toastConfig
            );

            return this.toastMessage(
                message || this.$t('An error occurred'),
                cfg,
                opts
            );
        },

        successToast(message, toastConfig, opts) {
            const cfg = Object.assign(
                {},
                {
                    variant: 'success',
                    title: this.$t('Success'),
                    // autoHideDelay: 5000,
                    noAutoHide: false
                },
                toastConfig
            );

            return this.toastMessage(message, cfg, opts);
        },

        toastMessage(message, toastConfig, opts) {
            const options = Object.assign(
                {},
                {
                    persistAcrossRoute: false,
                    hideOthers: true
                },
                opts
            );

            if(options.hideOthers) {
                // keeping this outside of setTimeout in case visibleToasts gets updated below before
                // the setTimeout function is executed
                const closeIds = cloneDeep(this.$store.state.ui.visibleToasts);
                setTimeout(() => {
                    this.hideToast(closeIds, true);
                }, 250);
            }

            const cfg = Object.assign(
                {},
                {
                    variant: 'default',
                    toaster: 'b-toaster-top-center',
                    solid: true,
                    noAutoHide: true,
                    noCloseButton: false,
                    id: uuid()
                },
                toastConfig
            );

            // not saving the id of toasts that will be auto-hidden anyhow
            if(cfg.noAutoHide) {
                this.$store.dispatch('ui/addToast', cfg.id);
            }

            // https://bootstrap-vue.org/docs/components/toast#toasts-on-demand
            if(options.persistAcrossRoute) {
                this.$root.$bvToast.toast(message, cfg);
            }
            else {
                this.$bvToast.toast(message, cfg);
            }

            return cfg.id;
        },

        hideToast(id, deleteToast) {
            if(!Array.isArray(id)) {
                this.$bvToast.hide(id);
                return;
            }

            const ids = Array.isArray(id) ? id : this.$store.state.ui.visibleToasts;
            ids.forEach((toastId) => {
                this.$bvToast.hide(toastId);

                if(deleteToast) {
                    this.$store.dispatch('ui/deleteToast', toastId);
                }
            });
        },

        confirmModal(message, variant, config) {
            const cfg = Object.assign(
                {},
                {
                    okVariant: variant === 'warning' || variant === 'danger' ? 'danger' : 'primary',
                    okTitle: this.$t('OK'),
                    cancelTitle: this.$t('cancel'),
                    bodyClass: [`modal-body-${variant}`, 'tac'],
                    // headerCloseLabel: this.$t('Close'),
                    // title: this.$t('Please Confirm'),
                    noCloseButton: true,
                    centered: true,
                    footerClass: ['py-2', 'px-3', 'modal-button-center'],
                    size: 'sm'
                },
                config
            );

            const h = this.$createElement;
            let childNode;

            switch(variant) {
                case 'warning':
                    childNode = h(IconWarningOutine, {
                        attrs: {
                            width: '35',
                            height: '35',
                            stroke: 'none',
                            className: 'vabtm fillYellow'
                        }
                    });
                    break;

                default: {
                    childNode = null;
                }
            }

            if(childNode) {
                const messageVNode = h('div', {}, [
                    h('div', { class: ['mbm'] }, [
                        childNode
                    ]),
                    h('div', {}, [
                        message
                    ])

                    // h('div', { class: ['inlineBlock mrm'] }, [
                    //     childNode
                    // ]),
                    // h('div', { class: ['inlineBlock'] }, [
                    //     message
                    // ])
                ]);

                return this.$bvModal.msgBoxConfirm(
                    [messageVNode],
                    cfg
                );
            }

            return this.$bvModal.msgBoxConfirm(message, cfg);
        }
    }

};