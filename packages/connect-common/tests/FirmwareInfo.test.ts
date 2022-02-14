import {
    parseFirmware,
    getFirmwareStatus,
    // getRelease,
    getReleases,
} from '../src';
import * as releases2 from '../files/firmware/2/releases.json';

describe('FirmwareInfo', () => {
    beforeEach(() => {
        parseFirmware(releases2, 2);
    });

    test('getReleases', () => {
        expect(getReleases(2)[0]).toMatchObject({
            ...releases2[0],
            url: expect.any(String),
            url_bitcoinonly: expect.any(String),
        });
    });

    test('getFirmwareStatus', () => {
        expect(
            // @ts-ignore
            getFirmwareStatus({
                firmware_present: false,
            }),
        ).toEqual('none');

        // @ts-ignore
        expect(
            // @ts-ignore
            getFirmwareStatus({
                major_version: 1,
                bootloader_mode: true,
            }),
        ).toEqual('unknown');
    });
});
