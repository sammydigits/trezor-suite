import { isHex as isHexUtil } from '@suite/utils/wallet/ethUtils';
import { isAscii as isAsciiUtil } from '@trezor/utils';
import * as yup from 'yup';

yup.setLocale({
    string: {
        max: 'TR_TOO_LONG',
    },
    number: {
        min: params => ({
            text: 'number.min',
            params,
        }),
        max: params => ({
            text: 'number.max',
            params,
        }),
    },

    mixed: {
        required: 'TR_SELL_VALIDATION_ERROR_EMPTY',
        notType: params => {
            if (params.type === 'date') {
                return 'mixed.not-date';
            }

            if (params.type === 'number') {
                return 'mixed.not-number';
            }
        },
    },
});

yup.addMethod<yup.StringSchema>(yup.string, 'isAscii', function isAscii() {
    return this.test('isAscii', 'TR_ASCII_ONLY', value => isAsciiUtil(value));
});

yup.addMethod<yup.StringSchema>(yup.string, 'isHex', function isHex() {
    return this.test('isHex', 'DATA_NOT_VALID_HEX', value => isHexUtil(value as string));
});

export default yup;
