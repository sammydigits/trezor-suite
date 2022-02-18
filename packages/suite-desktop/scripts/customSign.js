/**
 * Custom signing with electron builder.
 * https://www.electron.build/tutorials/code-signing-windows-apps-on-unix.html#integrate-signing-with-electron-builder
 */

// This function uses the internal electron-builder signing to sign files that are currently ignore by it.
exports.default = async function sign(configuration) {
    // Make sign false to make use the internal signing system of electron-builder
    configuration.options.sign = null;

    console.log('Log just for testing env variables are right');
    console.log('process.env.WIN_CSC_LINK', process.env.WIN_CSC_LINK);
    console.log('process.env.WIN_CSC_KEY_PASSWORD', process.env.WIN_CSC_KEY_PASSWORD);

    const path = configuration.path.split('/');
    // Right now we are only interested in signing the files inside `swiftshader` directory.
    const isSwiftsahder = path[path.length - 2] === 'swiftshader';

    // eslint-disable-next-line global-require
    const codeSign = require('../../../node_modules/app-builder-lib/out/codeSign/windowsCodeSign');
    // eslint-disable-next-line global-require
    const winPackager = require('../../../node_modules/app-builder-lib/out/winPackager');

    if (isSwiftsahder) {
        await codeSign.sign(configuration, winPackager);
    }
};
