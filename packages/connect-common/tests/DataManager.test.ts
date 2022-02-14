import { DataManager } from '../src';
import * as config from '../files/config.json';

// jest.mock('../src/utils/node/networkUtils', () => {

//     return {
//         __esModule: true,
//         default: {
//         },
//         httpRequest: () => {
//             return 'foo'
//         }
//     };
// });

const settings = {
    connectSrc: 'https://connect.trezor.io/v8/',
    transportReconnect: true,
    debug: false,
    popup: false,
    webusb: true,
    pendingTransportEvent: false,
    manifest: {
        email: 'info@trezor.io',
        appUrl: '@trezor/suite',
    },
    // internal part, not to be accepted from .init()
    origin: '',
    configSrc: '',
    iframeSrc: '',
    popupSrc: '',
    webusbSrc: '',
    version: '',
    priority: 1,
    trustedHost: true,
    supportedBrowser: true,
    extension: '',
    env: 'node' as const,
    timestamp: 1,
    proxy: '',
    useOnionLinks: false,
};

jest.mock('../src/utils/browser/networkUtils', () => ({
    __esModule: true,
    default: {},
    httpRequest: () => config,
}));

describe('DataManager', () => {
    beforeEach(async () => {
        try {
            await DataManager.load(settings, false);
        } catch (err) {
            expect(err).toBe(undefined);
        }
    });

    test('isWhitelisted', () => {
        expect(DataManager.isWhitelisted('trezor.io')).toEqual({
            origin: 'trezor.io',
            priority: 0,
        });
        expect(DataManager.isWhitelisted('foo')).toEqual(undefined);
    });

    test('isManagementAllowed', () => {
        expect(DataManager.isManagementAllowed()).toEqual(undefined);
    });

    test('getPriority', () => {
        expect(DataManager.getPriority()).toEqual(2);
    });

    test('getHostLabel', () => {
        expect(DataManager.getHostLabel('webextension@metamask.io')).toEqual({
            icon: './data/icons/metamask.svg',
            label: 'MetaMask',
            origin: 'webextension@metamask.io',
        });
    });

    test('getSettings', () => {
        expect(DataManager.getSettings('connectSrc')).toEqual(settings.connectSrc);
        expect(DataManager.getSettings()).toEqual(settings);
        // @ts-expect-error
        expect(DataManager.getSettings('foo')).toEqual(undefined);
    });

    test('getDebugSettings', () => {
        expect(DataManager.getDebugSettings()).toEqual(false);
    });

    test('getConfig', () => {});
});
