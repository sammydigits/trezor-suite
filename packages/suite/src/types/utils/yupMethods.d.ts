import * as yup from 'yup'; // eslint-disable-line

declare module 'yup' {
    interface StringSchema {
        isAscii(): StringSchema;
        isHex(): StringSchema;
    }
}
