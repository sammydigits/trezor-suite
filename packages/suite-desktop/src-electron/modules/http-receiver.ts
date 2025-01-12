/**
 * Local web server for handling requests to app
 */
import { app, ipcMain } from '../typed-electron';
import { buyRedirectHandler } from '../libs/buy';
import { sellRedirectHandler } from '../libs/sell';
import { HttpReceiver } from '../libs/http-receiver';
import { Module } from './index';

// External request handler
const httpReceiver = new HttpReceiver();

const init: Module = ({ mainWindow, src }) => {
    const { logger } = global;

    // wait for httpReceiver to start accepting connections then register event handlers
    httpReceiver.on('server/listening', () => {
        // when httpReceiver accepted oauth response
        httpReceiver.on('oauth/response', message => {
            mainWindow.webContents.send('oauth/response', message);
            app.focus();
        });

        httpReceiver.on('buy/redirect', url => {
            buyRedirectHandler(url, mainWindow, src);
        });

        httpReceiver.on('sell/redirect', url => {
            sellRedirectHandler(url, mainWindow, src);
        });

        httpReceiver.on('spend/message', event => {
            mainWindow.webContents.send('spend/message', event);
        });

        // when httpReceiver was asked to provide current address for given pathname
        ipcMain.handle('server/request-address', (_, pathname) =>
            httpReceiver.getRouteAddress(pathname),
        );
    });

    logger.info('http-receiver', 'Starting server');
    httpReceiver.start();
    app.on('before-quit', () => {
        logger.info('http-receiver', 'Stopping server (app quit)');
        httpReceiver.stop();
    });
};

export default init;
