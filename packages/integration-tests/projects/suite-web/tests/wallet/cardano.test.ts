// @group:wallet
// @retry=2

describe('Cardano', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu');
        cy.task('startBridge');

        cy.viewport(1024, 768).resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    it('Basic cardano walkthrough', () => {
        cy.discoveryShouldFinish();

        // go to coin settings and enable cardano
        cy.getTestElement('@suite/menu/settings').click();
        cy.getTestElement('@settings/menu/wallet').click();
        cy.getTestElement('@settings/wallet/network/ada').click();

        // open advanced coins settings
        cy.hoverTestElement('@settings/wallet/network/ada');
        cy.getTestElement('@settings/wallet/network/ada/advance').click();
        cy.getTestElement('@modal').matchImageSnapshot();
        cy.get('body').type('{esc}');

        // go to cardano account #1
        cy.getTestElement('@suite/menu/suite-index').click();
        cy.getTestElement('@suite/menu/wallet-index').click();
        cy.getTestElement('@account-menu/ada/normal/0').click();
        cy.discoveryShouldFinish();

        // go to cardano account #1 - account details
        cy.getTestElement('@wallet/menu/wallet-details').click();
        cy.getTestElement('@app').matchImageSnapshot();

        // show public key modal
        cy.getTestElement('@wallets/details/show-xpub-button').click();
        cy.getTestElement('@modal').matchImageSnapshot();
        cy.get('body').type('{esc}');

        // go to cardano account #1 - staking
        cy.getTestElement('@wallet/menu/wallet-tokens').click();
        cy.getTestElement('@app').matchImageSnapshot();

        // todo: enable staking - cardano lib problem
        // go to cardano account #1 - staking
        // cy.getTestElement('@wallet/menu/wallet-staking').click();
        // cy.getTestElement('@app').matchImageSnapshot();

        //  go to cardano account #1 - send
        cy.getTestElement('@wallet/menu/wallet-send').click();
        cy.getTestElement('@wallet/menu/close-button').last().click();

        //  go to cardano account #1 - receive
        cy.getTestElement('@wallet/menu/wallet-receive').click();
        cy.getTestElement('@wallet/receive/reveal-address-button').click();
        cy.getTestElement('@modal').matchImageSnapshot();
    });
});
