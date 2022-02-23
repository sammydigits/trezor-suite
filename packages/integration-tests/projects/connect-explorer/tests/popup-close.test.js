const { test, expect } = require('@playwright/test');
const { Controller } = require('../../../websocket-client');
const { createDeferred } = require('@trezor/utils');

const url = process.env.URL || 'http://localhost:8082/';
const controller = new Controller({ url: 'ws://localhost:9001/' });

const WAIT_AFTER_TEST = 3000; // how long test should wait for more potential trezord requests

// requests to bridge
let requests = [];
// responses from bridge
let responses = [];

let releasePromise;

// popup window reference
let popup;

test.beforeAll(async () => {
    await controller.connect();
});

// '2.0.26' '2.0.27',
// todo: these two versions don't have localhost nor sldev whitelisted. So this can't be tested
// in case we are going to host connect-explorer on trezor.io domain (might be reasonable), we may
// enable also tests for older bridge versions
['2.0.31'].forEach(bridgeVersion => {
    test.beforeEach(async ({ page }) => {
        requests = [];
        responses = [];
        releasePromise = createDeferred();

        await controller.send({
            type: 'bridge-stop',
        });
        await controller.send({
            type: 'emulator-stop',
        });
        await controller.send({
            type: 'emulator-start',
            wipe: true,
        });
        await controller.send({
            type: 'emulator-setup',
            mnemonic:
                'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
            pin: '',
            passphrase_protection: false,
            label: 'My Trevor',
            needs_backup: false,
        });
        await controller.send({
            type: 'bridge-start',
            version: bridgeVersion,
        });

        await page.goto(`${url}#/method/verifyMessage`);
        await page.waitForSelector("button[data-test='@submit-button']", { state: 'visible' });

        // Subscribe to 'request' and 'response' events.
        page.on('request', request => {
            // ignore other than bridge requests
            if (!request.url().startsWith('http://127.0.0.1:21325')) {
                return;
            }
            requests.push({ url: request.url() });
        });
        page.on('response', async response => {
            // ignore other than bridge requests
            if (!response.url().startsWith('http://127.0.0.1:21325')) {
                return;
            }
            if (response.url().endsWith('release/2')) {
                releasePromise.resolve();
            }
            console.log(response.status(), response.url());
            responses.push({
                url: response.url(),
                status: response.status(),
                body: await response.text(),
            });
        });

        [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.click("button[data-test='@submit-button']"),
        ]);
        await popup.waitForLoadState('load');

        await popup.waitForSelector('button.confirm', { state: 'visible', timeout: 40000 });
        await popup.click('button.confirm');
        await popup.waitForSelector('.follow-device >> visible=true');
    });

    test(`popup closed by user with bridge version ${bridgeVersion}`, async ({ page }) => {
        // user closed popup
        await popup.close();
        await releasePromise.promise;
        await page.waitForTimeout(WAIT_AFTER_TEST);

        responses.forEach(response => {
            expect(response.status).toEqual(200);
        });
        // sending 'Cancel' message using post endpoint
        expect(responses[12].url).toEqual('http://127.0.0.1:21325/post/2');
    });

    test(`device dialog canceled by user with bridge version ${bridgeVersion}`, async ({
        page,
    }) => {
        // user canceled dialog on device
        await controller.send({ type: 'emulator-press-no' });
        await releasePromise.promise;
        await page.waitForTimeout(WAIT_AFTER_TEST);

        responses.forEach(response => {
            expect(response.status).toEqual(200);
            // no post endpoint is used
            expect(response.url).not.toContain('post');
        });
    });

    test(`device disconnected during device interaction with bridge version ${bridgeVersion}`, async ({
        page,
    }) => {
        // user canceled interaction on device
        await controller.send({ type: 'emulator-stop' });
        await releasePromise.promise;
        await page.waitForTimeout(WAIT_AFTER_TEST);

        responses.forEach(response => {
            expect(response.url).not.toContain('post');
        });

        // 'device disconnected during action' error
        expect(responses[12]).toMatchObject({
            url: 'http://127.0.0.1:21325/call/2',
            status: 400,
        });
    });
});
