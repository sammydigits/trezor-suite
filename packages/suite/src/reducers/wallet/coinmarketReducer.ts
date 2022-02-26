import produce from 'immer';
import type { WalletAction, Account } from '@wallet-types';
import type { PrecomposedTransactionFinal } from '@wallet-types/sendForm';

import type {
    BuyTrade,
    BuyTradeQuoteRequest,
    ExchangeTradeQuoteRequest,
    ExchangeTrade,
    ExchangeCoinInfo,
    SellFiatTrade,
    SellFiatTradeQuoteRequest,
} from 'invity-api';
import type { BuyInfo } from '@wallet-actions/coinmarketBuyActions';
import type { ExchangeInfo } from '@wallet-actions/coinmarketExchangeActions';
import {
    COINMARKET_BUY,
    COINMARKET_EXCHANGE,
    COINMARKET_COMMON,
    COINMARKET_SELL,
    COINMARKET_SAVINGS,
} from '@wallet-actions/constants';
import { STORAGE } from '@suite-actions/constants';
import type { Action as SuiteAction } from '@suite-types';
import type { SellInfo } from '@wallet-actions/coinmarketSellActions';
import type { SavingsInfo } from '@wallet-actions/coinmarketSavingsActions';
import type { FeeLevel } from 'trezor-connect';
import type { Trade } from '@wallet-types/coinmarketCommonTypes';
import type {
    SavingsKYCStatus,
    SavingsProviderInfo,
    SavingsTrade,
    SavingsTradePlannedPayment,
} from '@suite-services/invityAPI';
import type { InvityAuthentication } from '@wallet-types/invity';

export interface ComposedTransactionInfo {
    composed?: Pick<
        PrecomposedTransactionFinal,
        'feePerByte' | 'estimatedFeeLimit' | 'feeLimit' | 'token' | 'fee'
    >;
    selectedFee?: FeeLevel['label'];
}

interface Buy {
    buyInfo?: BuyInfo;
    isFromRedirect: boolean;
    quotesRequest?: BuyTradeQuoteRequest;
    quotes: BuyTrade[] | undefined;
    transactionId?: string;
    cachedAccountInfo: {
        accountType?: Account['accountType'];
        index?: Account['index'];
        symbol?: Account['symbol'];
        shouldSubmit?: boolean;
    };
    alternativeQuotes?: BuyTrade[];
    addressVerified?: string;
}

interface Exchange {
    exchangeInfo?: ExchangeInfo;
    exchangeCoinInfo?: ExchangeCoinInfo[];
    quotesRequest?: ExchangeTradeQuoteRequest;
    fixedQuotes: ExchangeTrade[] | undefined;
    floatQuotes: ExchangeTrade[] | undefined;
    dexQuotes: ExchangeTrade[] | undefined;
    transactionId?: string;
    addressVerified?: string;
}

interface Sell {
    sellInfo?: SellInfo;
    showLeaveModal: boolean;
    quotesRequest?: SellFiatTradeQuoteRequest;
    quotes: SellFiatTrade[] | undefined;
    alternativeQuotes?: SellFiatTrade[];
    transactionId?: string;
    isFromRedirect: boolean;
}

interface Savings {
    countryEffective?: string;
    selectedProvider?: SavingsProviderInfo;
    savingsInfo?: SavingsInfo;
    savingsTrade?: SavingsTrade;
    savingsTradePayments?: SavingsTradePlannedPayment[];
    isSavingsTradeLoading: boolean;
    kycFinalStatus?: SavingsKYCStatus;
    isWatchingKYCStatus: boolean;
    watchingKYCMetadata: {
        intervalId: number;
        timeoutId: number;
    };
}

export interface State {
    buy: Buy;
    exchange: Exchange;
    sell: Sell;
    savings: Savings;
    composedTransactionInfo: ComposedTransactionInfo;
    trades: Trade[];
    isLoading: boolean;
    lastLoadedTimestamp: number;
    invityAuthentication?: InvityAuthentication;
    isInvityAuthenticationLoading: boolean;
}

export const initialState = {
    buy: {
        transactionId: undefined,
        isFromRedirect: false,
        buyInfo: undefined,
        quotesRequest: undefined,
        cachedAccountInfo: {
            accountType: undefined,
            index: undefined,
            symbol: undefined,
            shouldSubmit: false,
        },
        quotes: [],
        alternativeQuotes: undefined,
        addressVerified: undefined,
    },
    exchange: {
        exchangeInfo: undefined,
        exchangeCoinInfo: undefined,
        transactionId: undefined,
        quotesRequest: undefined,
        fixedQuotes: [],
        floatQuotes: [],
        dexQuotes: [],
        addressVerified: undefined,
    },
    sell: {
        showLeaveModal: false,
        sellInfo: undefined,
        quotesRequest: undefined,
        quotes: [],
        alternativeQuotes: [],
        transactionId: undefined,
        isFromRedirect: false,
    },
    savings: {
        countryEffective: undefined,
        selectedProvider: undefined,
        savingsInfo: undefined,
        savingsTrade: undefined,
        savingsTradePayments: undefined,
        isSavingsTradeLoading: false,
        kycFinalStatus: undefined,
        isWatchingKYCStatus: false,
        watchingKYCMetadata: {
            intervalId: 0,
            timeoutId: 0,
        },
    },
    composedTransactionInfo: {},
    trades: [],
    isLoading: false,
    lastLoadedTimestamp: 0,
    invityAuthentication: undefined,
    isInvityAuthenticationLoading: false,
};

const coinmarketReducer = (
    state: State = initialState,
    action: WalletAction | SuiteAction,
): State =>
    produce(state, draft => {
        switch (action.type) {
            case COINMARKET_BUY.SAVE_BUY_INFO:
                draft.buy.buyInfo = action.buyInfo;
                break;
            case COINMARKET_BUY.SET_IS_FROM_REDIRECT:
                draft.buy.isFromRedirect = action.isFromRedirect;
                break;
            case COINMARKET_BUY.SAVE_QUOTE_REQUEST:
                draft.buy.quotesRequest = action.request;
                break;
            case COINMARKET_BUY.SAVE_TRANSACTION_DETAIL_ID:
                draft.buy.transactionId = action.transactionId;
                break;
            case COINMARKET_BUY.SAVE_QUOTES:
                draft.buy.quotes = action.quotes;
                draft.buy.alternativeQuotes = action.alternativeQuotes;
                break;
            case COINMARKET_BUY.CLEAR_QUOTES:
                draft.buy.quotes = undefined;
                draft.buy.alternativeQuotes = undefined;
                break;
            case COINMARKET_BUY.VERIFY_ADDRESS:
                draft.buy.addressVerified = action.addressVerified;
                break;
            case COINMARKET_BUY.SAVE_CACHED_ACCOUNT_INFO:
                draft.buy.cachedAccountInfo = {
                    symbol: action.symbol,
                    index: action.index,
                    accountType: action.accountType,
                    shouldSubmit: action.shouldSubmit,
                };
                break;
            case COINMARKET_BUY.DISPOSE:
                draft.buy.addressVerified = undefined;
                break;
            case COINMARKET_COMMON.SAVE_TRADE:
                if (action.key) {
                    const trades = state.trades.filter(t => t.key !== action.key);
                    const { type, ...trade } = action;
                    trades.push(trade);
                    draft.trades = trades;
                }
                break;
            case COINMARKET_EXCHANGE.SAVE_EXCHANGE_INFO:
                draft.exchange.exchangeInfo = action.exchangeInfo;
                break;
            case COINMARKET_EXCHANGE.SAVE_EXCHANGE_COIN_INFO:
                draft.exchange.exchangeCoinInfo = action.exchangeCoinInfo;
                break;
            case COINMARKET_EXCHANGE.SAVE_QUOTE_REQUEST:
                draft.exchange.quotesRequest = action.request;
                break;
            case COINMARKET_EXCHANGE.SAVE_QUOTES:
                draft.exchange.fixedQuotes = action.fixedQuotes;
                draft.exchange.floatQuotes = action.floatQuotes;
                draft.exchange.dexQuotes = action.dexQuotes;
                break;
            case COINMARKET_EXCHANGE.CLEAR_QUOTES:
                draft.exchange.fixedQuotes = undefined;
                draft.exchange.floatQuotes = undefined;
                break;
            case COINMARKET_EXCHANGE.VERIFY_ADDRESS:
                draft.exchange.addressVerified = action.addressVerified;
                break;
            case COINMARKET_EXCHANGE.SAVE_TRANSACTION_ID:
                draft.exchange.transactionId = action.transactionId;
                break;
            case COINMARKET_COMMON.SAVE_COMPOSED_TRANSACTION_INFO:
                draft.composedTransactionInfo = action.info;
                break;
            case STORAGE.LOADED:
                return action.payload.wallet.coinmarket;
            case COINMARKET_SELL.SAVE_SELL_INFO:
                draft.sell.sellInfo = action.sellInfo;
                break;
            case COINMARKET_SELL.SAVE_QUOTE_REQUEST:
                draft.sell.quotesRequest = action.request;
                break;
            case COINMARKET_SELL.SAVE_QUOTES:
                draft.sell.quotes = action.quotes;
                draft.sell.alternativeQuotes = action.alternativeQuotes;
                break;
            case COINMARKET_SELL.CLEAR_QUOTES:
                draft.sell.quotes = undefined;
                draft.sell.alternativeQuotes = undefined;
                break;
            case COINMARKET_SELL.SHOW_LEAVE_MODAL:
                draft.sell.showLeaveModal = action.showLeaveModal;
                break;
            case COINMARKET_SELL.SET_IS_FROM_REDIRECT:
                draft.sell.isFromRedirect = action.isFromRedirect;
                break;
            case COINMARKET_SELL.SAVE_TRANSACTION_ID:
                draft.sell.transactionId = action.transactionId;
                break;
            case COINMARKET_SAVINGS.SAVE_SAVINGS_INFO:
                draft.savings.savingsInfo = action.savingsInfo;
                // TODO: remove after more providers and "selector control" implementation
                draft.savings.selectedProvider = action.savingsInfo.savingsList?.providers[0];
                break;
            case COINMARKET_SAVINGS.SAVE_SAVINGS_TRADE_RESPONSE:
                draft.savings.savingsTrade = action.response.trade;
                draft.savings.savingsTradePayments = action.response.payments;
                // TODO: later set also "savings payments"
                break;
            case COINMARKET_SAVINGS.SET_SAVINGS_TRADE_RESPONSE_LOADING:
                draft.savings.isSavingsTradeLoading = action.isSavingsTradeLoading;
                break;
            case COINMARKET_COMMON.SET_LOADING:
                draft.isLoading = action.isLoading;
                draft.lastLoadedTimestamp = action.lastLoadedTimestamp;
                break;
            case COINMARKET_COMMON.SAVE_INVITY_AUTHENTICATION:
                draft.invityAuthentication = action.invityAuthentication;
                break;
            case COINMARKET_COMMON.CLEAR_INVITY_AUTHENTICATION:
                draft.invityAuthentication = undefined;
                break;
            case COINMARKET_COMMON.SET_INVITY_AUTHENTICATION_LOADING:
                draft.isInvityAuthenticationLoading = action.isInvityAuthenticationLoading;
                break;
            case COINMARKET_SAVINGS.START_WATCHING_KYC_STATUS:
                draft.savings.isWatchingKYCStatus = true;
                break;
            case COINMARKET_SAVINGS.STOP_WATCHING_KYC_STATUS:
                draft.savings.kycFinalStatus = action.kycFinalStatus;
                draft.savings.isWatchingKYCStatus = false;
                break;
            case COINMARKET_SAVINGS.SET_USER_COUNTRY_EFFECTIVE:
                draft.savings.countryEffective = action.countryEffective;
                break;
            // no default
        }
    });

export default coinmarketReducer;
