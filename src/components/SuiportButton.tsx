/**
 * SuiportButton Component
 *
 * Drop-in button that opens the SuiPort payment modal
 *
 * @example
 * ```tsx
 * import { SuiportButton } from 'suiport-sdk'
 *
 * <SuiportButton
 *   recipient="0x..."
 *   destinationToken="suiUSDC"
 *   onSuccess={(result) => console.log('Paid!', result)}
 * />
 * ```
 */

import React, { useState } from 'react';
import { SuiportModal } from './SuiportModal';
import type { SuiportButtonProps } from '../types';

const buttonStyles = {
    default: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'white',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    } as React.CSSProperties,
    compact: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'white',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    } as React.CSSProperties,
    outline: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#4F46E5',
        background: 'transparent',
        border: '2px solid #4F46E5',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    } as React.CSSProperties,
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    } as React.CSSProperties,
};

export function SuiportButton({
    recipient,
    refundAddress,
    destinationToken = 'suiUSDC',
    amount,
    label = 'Pay with Crypto',
    variant = 'default',
    disabled = false,
    className,
    onSuccess,
    onError,
    onOpenChange,
}: SuiportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        if (!disabled) {
            setIsOpen(true);
            onOpenChange?.(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        onOpenChange?.(false);
    };

    const style = {
        ...buttonStyles[variant],
        ...(disabled ? buttonStyles.disabled : {}),
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={className}
                style={style}
            >
                <SuiportIcon />
                {label}
            </button>

            <SuiportModal
                open={isOpen}
                onClose={handleClose}
                recipient={recipient}
                refundAddress={refundAddress}
                destinationToken={destinationToken}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
            />
        </>
    );
}

function SuiportIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
