/**
 * useSuiportPayment Hook
 *
 * Main hook for managing payment state and flow
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    getQuote,
    getExecutionStatus,
    type QuoteResult,
    type StatusResult,
    type ExecutionStatus,
} from '../core/intents';
import {
    getSupportedChains,
    getSuiDestinationTokens,
    suiSUI,
    suiUSDC,
    type Token,
    type Chain,
} from '../core/tokens';
import type { PaymentState } from '../types';

export interface UseSuiportPaymentOptions {
    recipient: string;
    refundAddress?: string;
    destinationToken?: 'suiSUI' | 'suiUSDC';
    amount?: string;
    onSuccess?: (result: { txHash: string; amount: string }) => void;
    onError?: (error: Error) => void;
}

export interface UseSuiportPaymentReturn {
    // State
    paymentState: PaymentState;
    quote: QuoteResult | null;
    previewQuote: QuoteResult | null;
    isLoadingPreview: boolean;
    status: StatusResult | null;
    error: Error | null;

    // Selected values
    selectedChain: Chain | null;
    selectedToken: Token | null;
    amount: string;
    destinationToken: Token;

    // Data
    chains: Chain[];
    tokens: Token[];
    destinationTokens: Token[];

    // Actions
    setSelectedChain: (chain: Chain) => void;
    setSelectedToken: (token: Token) => void;
    setAmount: (amount: string) => void;
    fetchQuote: () => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    reset: () => void;
    copyToClipboard: (text: string) => Promise<boolean>;
}

export function useSuiportPayment(
    options: UseSuiportPaymentOptions
): UseSuiportPaymentReturn {
    const { recipient, refundAddress, destinationToken, onSuccess, onError } =
        options;

    // Get destination token
    const destToken = destinationToken === 'suiSUI' ? suiSUI : suiUSDC;

    // State
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [quote, setQuote] = useState<QuoteResult | null>(null);
    const [previewQuote, setPreviewQuote] = useState<QuoteResult | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [status, setStatus] = useState<StatusResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Selection state
    const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [amount, setAmountState] = useState('');

    // Refs
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const lastStatusRef = useRef<ExecutionStatus | null>(null);
    const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Get available chains/tokens
    const chains = getSupportedChains().filter((c) => c.id !== 'sui');
    const tokens = selectedChain?.tokens || [];
    const destinationTokens = getSuiDestinationTokens();

    // Handle amount change with debounced preview
    const setAmount = useCallback(
        (newAmount: string) => {
            setAmountState(newAmount);
            setPreviewQuote(null);

            // Clear existing debounce
            if (previewDebounceRef.current) {
                clearTimeout(previewDebounceRef.current);
            }

            // Only fetch preview if we have required fields
            if (newAmount && selectedToken && refundAddress) {
                setIsLoadingPreview(true);

                // Debounce 3 seconds
                previewDebounceRef.current = setTimeout(async () => {
                    try {
                        const result = await getQuote({
                            originToken: selectedToken,
                            destinationToken: destToken,
                            amount: newAmount,
                            recipient,
                            refundTo: refundAddress,
                            dry: true, // Dry run for preview
                        });
                        setPreviewQuote(result);
                    } catch (err) {
                        console.warn('Preview quote failed:', err);
                    } finally {
                        setIsLoadingPreview(false);
                    }
                }, 3000);
            } else {
                setIsLoadingPreview(false);
            }
        },
        [selectedToken, refundAddress, recipient, destToken]
    );

    // Handle chain selection
    const handleChainSelect = useCallback((chain: Chain) => {
        setSelectedChain(chain);
        setSelectedToken(chain.tokens[0] || null);
        setPaymentState('selecting');
        setPreviewQuote(null);
    }, []);

    // Handle token selection
    const handleTokenSelect = useCallback((token: Token) => {
        setSelectedToken(token);
        setPaymentState('selecting');
        setPreviewQuote(null);
    }, []);

    // Fetch quote (real, non-dry)
    const fetchQuote = useCallback(async () => {
        if (!selectedToken || !amount || !refundAddress) {
            setError(new Error('Missing required fields'));
            return;
        }

        setPaymentState('quoting');
        setError(null);

        try {
            const result = await getQuote({
                originToken: selectedToken,
                destinationToken: destToken,
                amount,
                recipient,
                refundTo: refundAddress,
                dry: false,
            });

            setQuote(result);
            setPaymentState('awaiting_deposit');
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error('Failed to get quote');
            setError(error);
            setPaymentState('error');
            onError?.(error);
        }
    }, [
        selectedToken,
        amount,
        refundAddress,
        recipient,
        destToken,
        onError,
    ]);

    // Poll for status
    const pollStatus = useCallback(async () => {
        if (!quote?.depositAddress) return;

        try {
            const result = await getExecutionStatus(
                quote.depositAddress,
                quote.memo
            );
            setStatus(result);

            if (result.status !== lastStatusRef.current) {
                lastStatusRef.current = result.status;

                if (result.status === 'PROCESSING') {
                    setPaymentState('processing');
                } else if (result.isSuccess) {
                    setPaymentState('success');
                    stopPolling();
                    onSuccess?.({
                        txHash: result.destinationTxHashes?.[0] || '',
                        amount: quote.amountOut,
                    });
                } else if (result.status === 'FAILED') {
                    setPaymentState('error');
                    stopPolling();
                    const err = new Error('Payment failed');
                    setError(err);
                    onError?.(err);
                }
            }
        } catch (err) {
            console.error('Status poll error:', err);
        }
    }, [quote, onSuccess, onError]);

    // Start polling
    const startPolling = useCallback(() => {
        if (pollingRef.current) return;
        pollStatus();
        pollingRef.current = setInterval(pollStatus, 3000);
    }, [pollStatus]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    // Copy to clipboard
    const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    }, []);

    // Reset state
    const reset = useCallback(() => {
        stopPolling();
        if (previewDebounceRef.current) {
            clearTimeout(previewDebounceRef.current);
        }
        setPaymentState('idle');
        setQuote(null);
        setPreviewQuote(null);
        setIsLoadingPreview(false);
        setStatus(null);
        setError(null);
        setSelectedChain(null);
        setSelectedToken(null);
        setAmountState('');
        lastStatusRef.current = null;
    }, [stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
            if (previewDebounceRef.current) {
                clearTimeout(previewDebounceRef.current);
            }
        };
    }, [stopPolling]);

    return {
        paymentState,
        quote,
        previewQuote,
        isLoadingPreview,
        status,
        error,
        selectedChain,
        selectedToken,
        amount,
        destinationToken: destToken,
        chains,
        tokens,
        destinationTokens,
        setSelectedChain: handleChainSelect,
        setSelectedToken: handleTokenSelect,
        setAmount,
        fetchQuote,
        startPolling,
        stopPolling,
        reset,
        copyToClipboard,
    };
}
