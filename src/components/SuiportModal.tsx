/**
 * SuiportModal Component
 *
 * Premium payment modal with chain/token selection and QR code display
 * Based on Aura.build design with glassmorphism and animations
 */

import React, { useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSuiportPayment } from '../hooks/useSuiportPayment';
import type { SuiportModalProps } from '../types';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'suiport-fade-in 0.2s ease',
    },
    modal: {
        position: 'relative' as const,
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(22, 22, 30, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        animation: 'suiport-slide-up 0.3s ease',
    },
    header: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        marginBottom: '24px',
    },
    headerIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 500,
        color: 'white',
        margin: 0,
        textShadow: '0 0 15px rgba(255,255,255,0.3)',
    },
    subtitle: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        marginTop: '4px',
        fontWeight: 300,
        letterSpacing: '0.5px',
    },
    closeButton: {
        position: 'absolute' as const,
        top: '16px',
        right: '16px',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    selectorsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
    },
    selector: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    selectorHover: {
        background: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectorIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#1c1c26',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    selectorLabel: {
        fontSize: '10px',
        textTransform: 'uppercase' as const,
        letterSpacing: '1.5px',
        color: 'rgba(255,255,255,0.3)',
        fontWeight: 500,
    },
    selectorValue: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 500,
    },
    amountInput: {
        width: '100%',
        textAlign: 'center' as const,
        fontSize: '48px',
        fontWeight: 500,
        color: 'white',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        marginBottom: '24px',
        caretColor: '#4F46E5',
    },
    details: {
        marginBottom: '20px',
        padding: '0 4px',
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '8px',
    },
    detailValue: {
        fontWeight: 500,
        color: 'rgba(255,255,255,0.7)',
    },
    button: {
        width: '100%',
        position: 'relative' as const,
        overflow: 'hidden',
        borderRadius: '16px',
        padding: '2px',
        background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #4F46E5)',
        backgroundSize: '200% 200%',
        animation: 'suiport-gradient 3s ease infinite',
        border: 'none',
        cursor: 'pointer',
    },
    buttonInner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        height: '48px',
        borderRadius: '14px',
        background: '#0A0A0F',
        color: 'white',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'background 0.3s',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    qrContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '24px',
        background: 'white',
        borderRadius: '16px',
        marginBottom: '16px',
    },
    depositAddress: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        wordBreak: 'break-all' as const,
        textAlign: 'center' as const,
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        marginTop: '12px',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
    },
    successBadge: {
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#10B981',
    },
    processingBadge: {
        background: 'rgba(79, 70, 229, 0.2)',
        color: '#818CF8',
    },
    dropdown: {
        position: 'absolute' as const,
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        background: 'rgba(22, 22, 30, 0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        maxHeight: '200px',
        overflowY: 'auto' as const,
        zIndex: 10,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
};

// CSS Keyframes (injected once)
const injectStyles = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('suiport-styles')) return;

    const style = document.createElement('style');
    style.id = 'suiport-styles';
    style.textContent = `
        @keyframes suiport-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes suiport-slide-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes suiport-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes suiport-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SuiportModal({
    open,
    onClose,
    recipient,
    refundAddress,
    destinationToken = 'suiUSDC',
    amount: initialAmount,
    onSuccess,
    onError,
}: SuiportModalProps) {
    const payment = useSuiportPayment({
        recipient,
        refundAddress,
        destinationToken,
        amount: initialAmount,
        onSuccess,
        onError,
    });

    const [chainDropdownOpen, setChainDropdownOpen] = React.useState(false);
    const [tokenDropdownOpen, setTokenDropdownOpen] = React.useState(false);

    // Inject styles on mount
    useEffect(() => {
        injectStyles();
    }, []);

    // Start polling when awaiting deposit
    useEffect(() => {
        if (payment.paymentState === 'awaiting_deposit') {
            payment.startPolling();
        }
        return () => payment.stopPolling();
    }, [payment.paymentState]);

    // Reset on close
    const handleClose = useCallback(() => {
        payment.reset();
        onClose();
    }, [payment, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        if (open) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [open, handleClose]);

    if (!open) return null;

    const canSubmit =
        payment.selectedToken && payment.amount && refundAddress;
    const isProcessing =
        payment.paymentState === 'quoting' ||
        payment.paymentState === 'processing';
    const showQR = payment.paymentState === 'awaiting_deposit';
    const isSuccess = payment.paymentState === 'success';

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    style={styles.closeButton}
                    onClick={handleClose}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                            'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                            'rgba(255,255,255,0.05)';
                    }}
                >
                    <CloseIcon />
                </button>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerIcon}>
                        <CardIcon />
                    </div>
                    <h2 style={styles.title}>
                        {isSuccess
                            ? 'Payment Complete!'
                            : showQR
                                ? 'Send Payment'
                                : 'Pay with any token'}
                    </h2>
                    <p style={styles.subtitle}>
                        {isSuccess
                            ? 'Your transaction was successful'
                            : showQR
                                ? 'Scan QR or copy address below'
                                : 'Secure, gasless transactions'}
                    </p>
                </div>

                {/* Success State */}
                {isSuccess && (
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(16, 185, 129, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}
                        >
                            <CheckIcon />
                        </div>
                        <p
                            style={{
                                color: '#10B981',
                                fontSize: '14px',
                                fontWeight: 500,
                            }}
                        >
                            Payment received successfully!
                        </p>
                    </div>
                )}

                {/* QR Code State */}
                {showQR && payment.quote && (
                    <>
                        <div style={styles.qrContainer}>
                            <QRCodeSVG
                                value={payment.quote.depositAddress}
                                size={180}
                                level="M"
                                bgColor="white"
                                fgColor="#0A0A0F"
                            />
                        </div>
                        <div style={styles.depositAddress}>
                            {payment.quote.depositAddress}
                        </div>
                        <div
                            style={{
                                ...styles.details,
                                marginTop: '16px',
                            }}
                        >
                            <div style={styles.detailRow}>
                                <span>Status</span>
                                <span
                                    style={{
                                        ...styles.statusBadge,
                                        ...styles.processingBadge,
                                    }}
                                >
                                    <PulseIcon /> Waiting for deposit
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span>Amount to send</span>
                                <span style={styles.detailValue}>
                                    {payment.amount} {payment.selectedToken?.symbol}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span>You receive</span>
                                <span style={styles.detailValue}>
                                    ~{payment.quote.amountOutFormatted}{' '}
                                    {payment.destinationToken.symbol}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* Selection State */}
                {!showQR && !isSuccess && (
                    <>
                        {/* Chain & Token Selectors */}
                        <div style={styles.selectorsRow}>
                            {/* Chain Selector */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={styles.selector}
                                    onClick={() => {
                                        setChainDropdownOpen(!chainDropdownOpen);
                                        setTokenDropdownOpen(false);
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        }}
                                    >
                                        <div style={styles.selectorIcon}>
                                            {payment.selectedChain ? (
                                                <img
                                                    src={payment.selectedChain.icon}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            ) : (
                                                <GlobeIcon />
                                            )}
                                        </div>
                                        <div>
                                            <div style={styles.selectorLabel}>
                                                Chain
                                            </div>
                                            <div style={styles.selectorValue}>
                                                {payment.selectedChain?.name ||
                                                    'Select'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronIcon />
                                </div>

                                {/* Chain Dropdown */}
                                {chainDropdownOpen && (
                                    <div style={styles.dropdown}>
                                        {payment.chains.map((chain) => (
                                            <div
                                                key={chain.id}
                                                style={styles.dropdownItem}
                                                onClick={() => {
                                                    payment.setSelectedChain(chain);
                                                    setChainDropdownOpen(false);
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        'transparent';
                                                }}
                                            >
                                                <img
                                                    src={chain.icon}
                                                    alt=""
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        color: 'white',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {chain.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Token Selector */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        ...styles.selector,
                                        opacity: payment.selectedChain ? 1 : 0.5,
                                        pointerEvents: payment.selectedChain
                                            ? 'auto'
                                            : 'none',
                                    }}
                                    onClick={() => {
                                        if (payment.selectedChain) {
                                            setTokenDropdownOpen(!tokenDropdownOpen);
                                            setChainDropdownOpen(false);
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        }}
                                    >
                                        <div style={styles.selectorIcon}>
                                            {payment.selectedToken ? (
                                                <img
                                                    src={payment.selectedToken.icon}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            ) : (
                                                <DollarIcon />
                                            )}
                                        </div>
                                        <div>
                                            <div style={styles.selectorLabel}>
                                                Token
                                            </div>
                                            <div style={styles.selectorValue}>
                                                {payment.selectedToken?.symbol ||
                                                    'Select'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronIcon />
                                </div>

                                {/* Token Dropdown */}
                                {tokenDropdownOpen && (
                                    <div style={styles.dropdown}>
                                        {payment.tokens.map((token) => (
                                            <div
                                                key={token.assetId}
                                                style={styles.dropdownItem}
                                                onClick={() => {
                                                    payment.setSelectedToken(token);
                                                    setTokenDropdownOpen(false);
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        'transparent';
                                                }}
                                            >
                                                <img
                                                    src={token.icon}
                                                    alt=""
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        color: 'white',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {token.symbol}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount Input */}
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={payment.amount}
                            onChange={(e) => payment.setAmount(e.target.value)}
                            style={styles.amountInput}
                        />

                        {/* Details */}
                        <div style={styles.details}>
                            <div style={styles.detailRow}>
                                <span>You receive</span>
                                <div
                                    style={{
                                        height: '12px',
                                        width: '64px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                    }}
                                />
                            </div>
                            <div style={styles.detailRow}>
                                <span>Destination</span>
                                <span style={styles.detailValue}>
                                    {payment.destinationToken.symbol} on Sui
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            style={{
                                ...styles.button,
                                ...(!canSubmit || isProcessing
                                    ? styles.buttonDisabled
                                    : {}),
                            }}
                            disabled={!canSubmit || isProcessing}
                            onClick={() => payment.fetchQuote()}
                        >
                            <div style={styles.buttonInner}>
                                {isProcessing ? (
                                    <>
                                        <SpinnerIcon /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Payment
                                        <ArrowIcon />
                                    </>
                                )}
                            </div>
                        </button>
                    </>
                )}

                {/* Close button for success */}
                {isSuccess && (
                    <button
                        style={styles.button}
                        onClick={handleClose}
                    >
                        <div style={styles.buttonInner}>Done</div>
                    </button>
                )}

                {/* Powered by */}
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.3)',
                        marginTop: '16px',
                    }}
                >
                    Powered by SuiPort • NEAR Intents
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// ICONS
// ============================================================================

function CloseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CardIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
        >
            <path d="M3 10h18M7 15h2m4 0h4M6 19h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#818CF8"
            strokeWidth="1.5"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    );
}

function DollarIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="1.5"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M15 9.5a3 3 0 00-3-2.5h-1a2.5 2.5 0 000 5h2a2.5 2.5 0 010 5H12a3 3 0 01-3-2.5" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

function SpinnerIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
        >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

function PulseIcon() {
    return (
        <span
            style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#818CF8',
                animation: 'suiport-pulse 1.5s ease infinite',
            }}
        />
    );
}
