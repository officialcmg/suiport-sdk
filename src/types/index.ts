/**
 * SuiPort SDK Types
 *
 * Component props and UI state types
 */

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/** Props for the SuiportButton component */
export interface SuiportButtonProps {
    /** Recipient address on Sui */
    recipient: string;
    /** Refund address (optional, will use connected wallet if not provided) */
    refundAddress?: string;
    /** Destination token on Sui (default: suiUSDC) */
    destinationToken?: 'suiSUI' | 'suiUSDC';
    /** Request a specific amount (in destination token units) */
    amount?: string;
    /** Button label */
    label?: string;
    /** Button variant */
    variant?: 'default' | 'compact' | 'outline';
    /** Disable the button */
    disabled?: boolean;
    /** Class name for custom styling */
    className?: string;
    /** Callback when payment completes */
    onSuccess?: (result: { txHash: string; amount: string }) => void;
    /** Callback when payment fails */
    onError?: (error: Error) => void;
    /** Callback when modal opens/closes */
    onOpenChange?: (open: boolean) => void;
}

/** Props for the SuiportModal component */
export interface SuiportModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** Recipient address on Sui */
    recipient: string;
    /** Optional refund address */
    refundAddress?: string;
    /** Destination token */
    destinationToken?: 'suiSUI' | 'suiUSDC';
    /** Amount to request */
    amount?: string;
    /** Callback when payment completes */
    onSuccess?: (result: { txHash: string; amount: string }) => void;
    /** Callback when payment fails */
    onError?: (error: Error) => void;
}

/** Payment state for UI */
export type PaymentState =
    | 'idle'
    | 'selecting'
    | 'quoting'
    | 'awaiting_deposit'
    | 'processing'
    | 'success'
    | 'error';
