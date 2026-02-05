/**
 * SuiPort Intents Service
 *
 * Core functions for cross-chain swaps via 1Click SDK
 */

import {
    OpenAPI,
    OneClickService,
    QuoteRequest,
    ApiError,
} from '@defuse-protocol/one-click-sdk-typescript';
import type { Token } from './tokens';
import { getConfig, isInitialized } from './config';

// ============================================================================
// TYPES
// ============================================================================

/** Swap type options */
export type SwapType =
    | 'EXACT_INPUT'
    | 'EXACT_OUTPUT'
    | 'FLEX_INPUT'
    | 'ANY_INPUT';

/** Quote request options */
export interface QuoteOptions {
    /** Origin token (source chain) */
    originToken: Token;
    /** Destination token (target chain) */
    destinationToken: Token;
    /** Amount in human-readable format (e.g., "1.5" for 1.5 USDC) */
    amount: string;
    /** Recipient address on destination chain */
    recipient: string;
    /** Refund address on origin chain (if swap fails) */
    refundTo: string;
    /** Slippage tolerance in basis points (100 = 1%) */
    slippageTolerance?: number;
    /** Swap type (default: EXACT_INPUT) */
    swapType?: SwapType;
    /** Deadline for the swap (default: 1 hour from now) */
    deadline?: Date;
    /** Dry run - get quote without creating deposit address */
    dry?: boolean;
    /** Referral identifier for tracking */
    referral?: string;
}

/** Quote result with deposit info */
export interface QuoteResult {
    /** Unique deposit address to send funds */
    depositAddress: string;
    /** Memo (required for some chains like Stellar) */
    memo?: string;
    /** Expected input amount (smallest units) */
    amountIn: string;
    /** Expected output amount (smallest units) */
    amountOut: string;
    /** Human-readable output amount */
    amountOutFormatted: string;
    /** Estimated USD value of output */
    amountOutUsd?: string;
    /** Deadline for the swap */
    deadline?: string;
    /** When the quote becomes inactive */
    timeWhenInactive?: string;
    /** Correlation ID for tracking */
    correlationId: string;
}

/** Execution status */
export type ExecutionStatus =
    | 'PENDING_DEPOSIT'
    | 'KNOWN_DEPOSIT_TX'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'INCOMPLETE_DEPOSIT'
    | 'REFUNDED'
    | 'FAILED';

/** Status result */
export interface StatusResult {
    /** Current status */
    status: ExecutionStatus;
    /** Whether the swap is complete (success or failed) */
    isComplete: boolean;
    /** Whether the swap succeeded */
    isSuccess: boolean;
    /** Correlation ID for tracking */
    correlationId: string;
    /** Destination chain transaction hashes (if available) */
    destinationTxHashes?: string[];
    /** Origin chain transaction hashes (if available) */
    originTxHashes?: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert human-readable amount to smallest units
 */
export function toSmallestUnits(amount: string, decimals: number): string {
    const [whole, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    return `${whole}${paddedFraction}`.replace(/^0+/, '') || '0';
}

/**
 * Convert smallest units to human-readable amount
 */
export function fromSmallestUnits(amount: string, decimals: number): string {
    const padded = amount.padStart(decimals + 1, '0');
    const whole = padded.slice(0, -decimals) || '0';
    const fraction = padded.slice(-decimals).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
}

/**
 * Generate a deadline timestamp
 */
export function generateDeadline(hoursFromNow = 1): string {
    const deadline = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    return deadline.toISOString();
}

// ============================================================================
// CORE SERVICE FUNCTIONS
// ============================================================================

function ensureInitialized() {
    if (!isInitialized()) {
        throw new Error(
            'SuiPort SDK not initialized. Call initSuiport() first.'
        );
    }
}

/**
 * Get a quote for a cross-chain swap
 */
export async function getQuote(options: QuoteOptions): Promise<QuoteResult> {
    ensureInitialized();
    const config = getConfig();

    const {
        originToken,
        destinationToken,
        amount,
        recipient,
        refundTo,
        slippageTolerance = 100, // 1% default
        swapType = 'EXACT_INPUT',
        deadline,
        dry = false,
        referral = config.referral || 'suiport',
    } = options;

    const amountInSmallestUnits = toSmallestUnits(amount, originToken.decimals);

    const quoteRequest: QuoteRequest = {
        dry,
        swapType: QuoteRequest.swapType[swapType],
        slippageTolerance,
        originAsset: originToken.assetId,
        depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
        destinationAsset: destinationToken.assetId,
        amount: amountInSmallestUnits,
        refundTo,
        refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
        recipient,
        recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
        deadline: deadline?.toISOString() || generateDeadline(1),
        referral,
    };

    try {
        const response = await OneClickService.getQuote(quoteRequest);
        const quote = response.quote;

        return {
            depositAddress: quote.depositAddress || '',
            memo: quote.depositMemo,
            amountIn: quote.amountIn,
            amountOut: quote.amountOut,
            amountOutFormatted: quote.amountOutFormatted,
            amountOutUsd: quote.amountOutUsd,
            deadline: quote.deadline,
            timeWhenInactive: quote.timeWhenInactive,
            correlationId: response.correlationId,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(
                `Quote failed (${error.status}): ${JSON.stringify(error.body)}`
            );
        }
        throw error;
    }
}

/**
 * Submit a deposit transaction hash to speed up processing
 */
export async function submitDepositTx(params: {
    txHash: string;
    depositAddress: string;
    memo?: string;
    nearSenderAccount?: string;
}): Promise<void> {
    ensureInitialized();

    const { txHash, depositAddress, memo, nearSenderAccount } = params;

    try {
        await OneClickService.submitDepositTx({
            txHash,
            depositAddress,
            memo,
            nearSenderAccount,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(
                `Submit deposit failed (${error.status}): ${JSON.stringify(error.body)}`
            );
        }
        throw error;
    }
}

/**
 * Get the execution status of a swap
 */
export async function getExecutionStatus(
    depositAddress: string,
    memo?: string
): Promise<StatusResult> {
    ensureInitialized();

    try {
        const response = await OneClickService.getExecutionStatus(
            depositAddress,
            memo
        );

        const status = response.status as ExecutionStatus;
        const isComplete = ['SUCCESS', 'REFUNDED', 'FAILED'].includes(status);
        const isSuccess = status === 'SUCCESS';

        const swapDetails = response.swapDetails;
        const destinationTxHashes =
            swapDetails?.destinationChainTxHashes?.map((tx) => tx.hash);
        const originTxHashes = swapDetails?.originChainTxHashes?.map(
            (tx) => tx.hash
        );

        return {
            status,
            isComplete,
            isSuccess,
            correlationId: response.correlationId,
            destinationTxHashes,
            originTxHashes,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(
                `Status check failed (${error.status}): ${JSON.stringify(error.body)}`
            );
        }
        throw error;
    }
}

/**
 * Poll execution status until complete
 */
export async function pollExecutionStatus(
    depositAddress: string,
    options?: {
        memo?: string;
        interval?: number;
        timeout?: number;
        onStatusChange?: (status: StatusResult) => void;
    }
): Promise<StatusResult> {
    const {
        memo,
        interval = 5000,
        timeout = 600000,
        onStatusChange,
    } = options || {};

    const startTime = Date.now();
    let lastStatus: ExecutionStatus | null = null;

    while (Date.now() - startTime < timeout) {
        const status = await getExecutionStatus(depositAddress, memo);

        if (status.status !== lastStatus) {
            lastStatus = status.status;
            onStatusChange?.(status);
        }

        if (status.isComplete) {
            return status;
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Timeout waiting for swap completion after ${timeout}ms`);
}

// Re-export for convenience
export { OpenAPI, OneClickService, ApiError };
