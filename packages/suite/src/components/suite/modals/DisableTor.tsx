import React from 'react';
import styled from 'styled-components';
import { Button, P, CoinLogo, variables } from '@trezor/components';
import { Modal, Translation } from '@suite-components';
import { useActions, useSelector } from '@suite-hooks';
import { isOnionUrl } from '@suite-utils/tor';
import { getTitleForNetwork } from '@wallet-utils/accountUtils';
import { setBackend as setBackendAction } from '@settings-actions/walletSettingsActions';
import AdvancedCoinSettings from './AdvancedCoinSettings';
import type { Network } from '@wallet-types';
import type { UserContextPayload } from '@suite-actions/modalActions';

const ButtonRow = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    > * + * {
        margin-left: 16px;
    }
`;

const BackendRowWrapper = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    padding: 12px 0;
    & + & {
        border-top: 1px solid ${props => props.theme.STROKE_GREY};
    }
    > div:nth-child(2) {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: start;
        margin: 0 16px;
        overflow: hidden;
        > span:first-child {
            font-weight: ${variables.FONT_WEIGHT.MEDIUM};
            font-size: ${variables.FONT_SIZE.NORMAL};
        }
        > span:last-child {
            font-weight: ${variables.FONT_WEIGHT.MEDIUM};
            font-size: ${variables.FONT_SIZE.SMALL};
            color: ${props => props.theme.TYPE_LIGHT_GREY};
            white-space: nowrap;
            overflow: hidden;
            width: 100%;
            text-overflow: ellipsis;
            text-align: start;
        }
    }
`;

const BackendRow = ({
    coin,
    urls,
    onSettings,
}: {
    coin: Network['symbol'];
    urls: string[];
    onSettings: () => void;
}) => (
    <BackendRowWrapper>
        <CoinLogo symbol={coin} />
        <div>
            <Translation id={getTitleForNetwork(coin)} />
            <span>{urls.join(', ')}</span>
        </div>
        <Button variant="tertiary" onClick={onSettings} icon="SETTINGS">
            <Translation id="TR_GO_TO_SETTINGS" />
        </Button>
    </BackendRowWrapper>
);

const Description = styled(P)`
    text-align: left;
`;

const BackendsWrapper = styled.div`
    margin: 16px 0;
`;

type DisableTorProps = Omit<Extract<UserContextPayload, { type: 'disable-tor' }>, 'type'> & {
    onCancel: () => void;
};

export const DisableTor = ({ onCancel, decision }: DisableTorProps) => {
    const backends = useSelector(state => state.wallet.settings.backends);
    const { setBackend } = useActions({
        setBackend: setBackendAction,
    });
    const [coin, setCoin] = React.useState<Network['symbol']>();
    const onionBackends = Object.entries(backends)
        .filter(([_, settings]) => settings.urls.find(isOnionUrl))
        .map(([coin, settings]) => ({ coin: coin as Network['symbol'], ...settings }));

    const onDisableTor = () => {
        onionBackends.forEach(({ coin, type, urls }) =>
            setBackend({ coin, type, urls: urls.filter(url => !isOnionUrl(url)) }),
        );
        decision.resolve(true);
        onCancel();
    };

    return (
        <>
            <Modal
                cancelable
                onCancel={onCancel}
                heading={<Translation id="TR_TOR_DISABLE" />}
                bottomBar={
                    <ButtonRow>
                        <Button onClick={onCancel}>
                            <Translation id="TR_CANCEL" />
                        </Button>
                        <Button
                            variant={onionBackends.length ? 'secondary' : 'primary'}
                            onClick={onDisableTor}
                        >
                            <Translation
                                id={
                                    onionBackends.length
                                        ? 'TR_TOR_REMOVE_ONION_AND_DISABLE'
                                        : 'TR_TOR_DISABLE'
                                }
                            />
                        </Button>
                    </ButtonRow>
                }
            >
                {onionBackends.length ? (
                    <>
                        <Description>
                            <Translation id="TR_TOR_ONION_REMOVAL_NEEDED" />
                        </Description>
                        <BackendsWrapper>
                            {onionBackends.map(({ coin, urls }) => (
                                <BackendRow
                                    key={coin}
                                    coin={coin}
                                    urls={urls}
                                    onSettings={() => setCoin(coin)}
                                />
                            ))}
                        </BackendsWrapper>
                    </>
                ) : (
                    <Description>
                        <Translation id="TR_TOR_ONION_NO_MORE" />
                    </Description>
                )}
            </Modal>
            {coin && <AdvancedCoinSettings coin={coin} onCancel={() => setCoin(undefined)} />}
        </>
    );
};
