import React from 'react';
import { useSelector } from '@suite-hooks';
import { CoinmarketLayout, WalletLayout } from '@wallet-components';
import CoinmarketAuthentication from '@wallet-components/CoinmarketAuthentication';
import invityAPI from '@suite-services/invityAPI';
import { useCoinmarketNavigation } from '@wallet-hooks/useCoinmarketNavigation';
import type { AppState } from '@suite-types';
import { Button } from '@trezor/components';

interface CoinmarketSavingsLoginRgistrationProps {
    selectedAccount: Extract<AppState['wallet']['selectedAccount'], { status: 'loaded' }>;
}

const CoinmarketSavingsRegistrationLoaded = ({
    selectedAccount,
}: CoinmarketSavingsLoginRgistrationProps) => {
    // const { whoAmI, fetching } = useContext(CoinmarketAuthenticationContext);
    const { navigateToSavingsLogin } = useCoinmarketNavigation(selectedAccount.account);
    return (
        <CoinmarketLayout>
            <Button onClick={() => navigateToSavingsLogin()}>Navigate to Login</Button>
            <CoinmarketAuthentication>
                <iframe
                    title="registration"
                    frameBorder="0"
                    src={invityAPI.getRegistrationPageSrc()}
                    sandbox="allow-scripts allow-forms allow-same-origin"
                />
            </CoinmarketAuthentication>
        </CoinmarketLayout>
    );
};

const CoinmarketSavingsRegistration = () => {
    const props = useSelector(state => ({
        selectedAccount: state.wallet.selectedAccount,
    }));

    const { selectedAccount } = props;
    if (selectedAccount.status !== 'loaded') {
        return <WalletLayout title="TR_NAV_SAVINGS" account={selectedAccount} />;
    }
    return (
        <CoinmarketAuthentication checkWhoAmImmediately={false}>
            <CoinmarketSavingsRegistrationLoaded selectedAccount={selectedAccount} />
        </CoinmarketAuthentication>
    );
};

export default CoinmarketSavingsRegistration;
