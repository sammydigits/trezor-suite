/* eslint-disable global-require */

import fetch from 'cross-fetch';

if (global && typeof global.fetch !== 'function') {
    global.fetch = fetch;
}

export const httpRequest = (url: string, _type: string) => {
    const fileUrl = url.split('?')[0];

    switch (fileUrl) {
        case './data/config.json':
            return require('../../../files/data/config.json');
        case './data/coins.json':
            return require('../../../files/data/coins.json');
        case './data/bridge/releases.json':
            return require('../../../files/bridge/releases.json');
        case './data/firmware/1/releases.json':
            return require('../../../files/firmware/1/releases.json');
        case './data/firmware/2/releases.json':
            return require('../../../files/firmware/2/releases.json');
        case './data/messages/messages.json':
            return require('../../../data/messages/messages.json');
        default:
            return null;
    }
};