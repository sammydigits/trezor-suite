import React from 'react';
import styled from 'styled-components';
import { variables } from '@trezor/components';
import * as routerActions from '@suite-actions/routerActions';
import * as coinmarketSavingsActions from '@wallet-actions/coinmarketSavingsActions';
import { useSelector, useActions } from '@suite-hooks';
import { WalletLayoutNavigation, WalletLayoutNavLink } from '@wallet-components';

const SavingsWalletLayoutNavLinkWrapper = styled.div`
    display: flex;
    margin-left: auto;
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-left: 30px;
    }
`;

const Navigation = () => {
    const items = [
        { route: 'wallet-coinmarket-buy', title: 'TR_NAV_BUY' },
        { route: 'wallet-coinmarket-sell', title: 'TR_NAV_SELL' },
        { route: 'wallet-coinmarket-exchange', title: 'TR_NAV_EXCHANGE' },
        { route: 'wallet-coinmarket-spend', title: 'TR_NAV_SPEND' },
    ] as const;

    const { routeName, account, savingsInfo } = useSelector(state => ({
        routeName: state.router.route?.name,
        account: state.wallet.selectedAccount?.account,
        savingsInfo: state.wallet.coinmarket.savings.savingsInfo,
    }));
    const { goto, loadSavingsTrade } = useActions({
        goto: routerActions.goto,
        loadSavingsTrade: coinmarketSavingsActions.loadSavingsTrade,
    });

    const isRouteVisibleInCardano = (i: { route: string; title: string }) =>
        !(i.route === 'wallet-coinmarket-sell' || i.route === 'wallet-coinmarket-exchange');

    return (
        <WalletLayoutNavigation>
            <>
                {items
                    .filter(i =>
                        account?.networkType === 'cardano' ? isRouteVisibleInCardano(i) : true,
                    )
                    .map(({ route, title }) => (
                        <WalletLayoutNavLink
                            key={route}
                            title={title}
                            active={routeName === route}
                            onClick={() => goto(route, { preserveParams: true })}
                        />
                    ))}
                {account?.symbol === 'btc' && (
                    <SavingsWalletLayoutNavLinkWrapper>
                        <WalletLayoutNavLink
                            key="wallet-coinmarket-savings"
                            title="TR_NAV_SAVINGS"
                            active={!!routeName?.startsWith('wallet-coinmarket-savings')}
                            onClick={() =>
                                // TODO: Better to first redirect and then show loading spinner/skeleton during requests.
                                savingsInfo?.savingsList?.providers &&
                                loadSavingsTrade(savingsInfo?.savingsList?.providers[0].name)
                            }
                        />
                    </SavingsWalletLayoutNavLinkWrapper>
                )}
            </>
        </WalletLayoutNavigation>
    );
};

export default Navigation;
