import { useEffect } from 'react';
import { useForm, useController, DeepMap, FieldError } from 'react-hook-form';
import { useTranslation } from '@suite-hooks';
import { isHex } from '@wallet-utils/ethUtils';
import { isAscii } from '@trezor/utils';
import { isAddressValid } from '@wallet-utils/validation';
import type { Account, Network } from '@wallet-types';
import { Shape } from '@suite/types/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../../config/suite/yup';
import { TransFunction } from '@suite/hooks/suite/useTranslation';
import { TypedFieldError } from '@suite/types/wallet/form';

export const MAX_LENGTH_MESSAGE = 1024;
export const MAX_LENGTH_SIGNATURE = 255;

export type SignVerifyFields = {
    message: string;
    address: string;
    isElectrum: boolean;
    path: string;
    signature: string;
    hex: boolean;
};

type SignVerifyContext = {
    isSignPage: boolean;
    accountNetwork: Network['symbol'];
};

const DEFAULT_VALUES: SignVerifyFields = {
    message: '',
    address: '',
    isElectrum: false,
    path: '',
    signature: '',
    hex: false,
};

// const translateErrors = (t: TransFunction, errors: DeepMap<SignVerifyFields, TypedFieldError>) => {
//     console.log('first')
// };

const signVerifySchema = yup.object().shape<Shape<Omit<SignVerifyFields, 'isElectrum'>>>({
    message: yup
        .string()
        .max(MAX_LENGTH_MESSAGE)
        .when('hex', {
            is: true,
            then: schema => schema.isHex(),
            otherwise: schema => schema.isAscii(),
        })
        .required(),
    address: yup
        .string()
        .test(
            'isAddressValid',
            'TR_ADD_TOKEN_ADDRESS_NOT_VALID',
            (value, context) =>
                value &&
                context.options.context?.accountNetwork &&
                isAddressValid(value, context.options.context?.accountNetwork),
        )
        .required(),
    path: yup.string().required(),
    signature: yup.string().when('$isSignPage', {
        is: false,
        then: schema => schema.required(),
    }),
    hex: yup.boolean(),
});

export const useSignVerifyForm = (isSignPage: boolean, account: Account) => {
    const { translationString } = useTranslation();

    const {
        register,
        handleSubmit,
        formState,
        reset,
        setValue,
        clearErrors,
        control,
        trigger,
        watch,
    } = useForm<SignVerifyFields, SignVerifyContext>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver(signVerifySchema),
        context: {
            isSignPage,
            accountNetwork: account?.symbol,
        },
        defaultValues: DEFAULT_VALUES,
    });

    const { isDirty, errors, isSubmitting } = formState;

    const formValues = watch();

    const { field: addressField } = useController({
        control,
        name: 'address',
        // rules: {
        //     required: translationString('TR_SELL_VALIDATION_ERROR_EMPTY'),
        //     validate: (address: string) =>
        //         account?.symbol && !isAddressValid(address, account.symbol)
        //             ? translationString('TR_ADD_TOKEN_ADDRESS_NOT_VALID')
        //             : undefined,
        // },
    });

    const { field: pathField } = useController({
        control,
        name: 'path',
        // rules: {
        //     required: isSignPage && translationString('TR_SELL_VALIDATION_ERROR_EMPTY'),
        // },
    });

    const { field: hexField } = useController({
        control,
        name: 'hex',
    });

    const messageRef = register({
        // maxLength: {
        //     value: MAX_LENGTH_MESSAGE,
        //     message: translationString('TR_TOO_LONG'),
        // },
        // validate: {
        //     hex: (message: string) =>
        //         formValues.hex && !isHex(message)
        //             ? translationString('DATA_NOT_VALID_HEX')
        //             : undefined,
        //     ascii: (message: string) =>
        //         !formValues.hex && !isAscii(message)
        //             ? translationString('TR_ASCII_ONLY')
        //             : undefined,
        // },
    });

    const signatureRef = register({
        // required: {
        //     value: !isSignPage,
        //     message: translationString('TR_SELL_VALIDATION_ERROR_EMPTY'),
        // },
    });

    const { field: isElectrumField } = useController({
        control,
        name: 'isElectrum',
    });

    useEffect(() => {
        if (control?.fieldsRef?.current?.message) trigger('message');
    }, [trigger, formValues.message, formValues.hex, control?.fieldsRef]);

    useEffect(() => {
        if (isSignPage) setValue('signature', '');
    }, [setValue, isSignPage, formValues.address, formValues.message]);

    useEffect(() => {
        const overrideValues =
            isSignPage && account?.networkType === 'ethereum'
                ? {
                      path: account.path,
                      address: account.descriptor,
                  }
                : {};

        reset({
            ...DEFAULT_VALUES,
            ...overrideValues,
        });
    }, [reset, account, isSignPage]);

    return {
        isFormDirty: isDirty,
        isSubmitting,
        resetForm: () => reset(),
        formSubmit: handleSubmit,
        formValues,
        formErrors: errors,
        formSetSignature: (value: string) => setValue('signature', value),
        messageRef,
        signatureRef,
        hexField: {
            checked: hexField.value,
            onChange: hexField.onChange,
        },
        addressField: {
            value: addressField.value,
            onChange: addressField.onChange,
            onBlur: addressField.onBlur,
        },
        pathField: {
            value: pathField.value,
            onBlur: pathField.onBlur,
            onChange: (addr: { path: string; address: string } | null) => {
                clearErrors(['path', 'address']);
                pathField.onChange(addr?.path || '');
                addressField.onChange(addr?.address || '');
            },
            isDisabled: account?.networkType === 'ethereum',
        },
        isElectrumField: {
            selectedOption: isElectrumField.value,
            onChange: isElectrumField.onChange,
        },
    };
};
