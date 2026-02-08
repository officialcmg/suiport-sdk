/**
 * SuiportModal Component
 *
 * Premium payment modal with chain/token selection and QR code display
 * Based on Aura.build design with glassmorphism and animations
 */

import React, { useEffect, useCallback, useState } from 'react';
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
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
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
    // QR container - dark background, no white box
    qrContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '24px',
        background: 'transparent',
        marginBottom: '16px',
    },
    // Address with copy button
    addressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
    },
    addressText: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        wordBreak: 'break-all' as const,
        textAlign: 'center' as const,
        fontFamily: 'monospace',
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
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
    loadingDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#818CF8',
        animation: 'suiport-pulse 1s ease infinite',
    },
    tokenBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)',
        fontSize: '11px',
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
            50% { opacity: 0.3; }
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
    const [copied, setCopied] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    // Inject styles on mount
    useEffect(() => {
        injectStyles();
    }, []);

    // Start polling when awaiting deposit
    useEffect(() => {
        if (payment.paymentState === 'awaiting_deposit') {
            payment.startPolling();
        }
    }, [payment.paymentState]);

    // Stop polling on unmount only
    useEffect(() => {
        return () => payment.stopPolling();
    }, []);

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

    // Copy address handler
    const handleCopy = useCallback(async () => {
        if (payment.quote?.depositAddress) {
            const success = await payment.copyToClipboard(payment.quote.depositAddress);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    }, [payment]);

    if (!open) return null;

    const canSubmit =
        payment.selectedToken && payment.amount && refundAddress;
    const isProcessing =
        payment.paymentState === 'quoting' ||
        payment.paymentState === 'processing';
    const showQR = payment.paymentState === 'awaiting_deposit' || payment.paymentState === 'processing';
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

                {/* Success State - Full Daimo-style */}
                {isSuccess ? (
                    <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                        <h2 style={{ ...styles.title, marginBottom: '32px', fontSize: '20px' }}>
                            Payment Successful
                        </h2>

                        {/* Large Checkmark Circle */}
                        <div
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'rgba(22, 22, 30, 0.9)',
                                border: '3px solid #10B981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                            }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <p style={{ color: 'white', fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
                            Payment Completed
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
                            {payment.amount} {payment.selectedToken?.symbol} → ~{payment.quote?.amountOutFormatted || ''} {payment.destinationToken.symbol} on Sui
                        </p>

                        {/* Show Receipt Link */}
                        <button
                            onClick={() => setShowReceipt(!showReceipt)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', marginBottom: showReceipt ? '16px' : '0' }}
                        >
                            {showReceipt ? 'Hide receipt' : 'Show receipt'}
                        </button>

                        {/* Receipt Details */}
                        {showReceipt && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginTop: '8px' }}>
                                {payment.status?.originTxHashes?.map((hash, i) => (
                                    <div key={`origin-${i}`} style={{ marginBottom: '12px' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Source TX ({payment.selectedChain?.name})</p>
                                        <a href={payment.selectedChain?.id === 'base' ? `https://basescan.org/tx/${hash}` : payment.selectedChain?.id === 'arb' ? `https://arbiscan.io/tx/${hash}` : `https://etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', fontSize: '13px', textDecoration: 'none', fontFamily: 'monospace' }}>
                                            {hash.slice(0, 10)}...{hash.slice(-8)} ↗
                                        </a>
                                    </div>
                                ))}
                                {payment.status?.destinationTxHashes?.map((hash, i) => (
                                    <div key={`dest-${i}`}>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Destination TX (Sui)</p>
                                        <a href={`https://suiscan.xyz/mainnet/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', fontSize: '13px', textDecoration: 'none', fontFamily: 'monospace' }}>
                                            {hash.slice(0, 10)}...{hash.slice(-8)} ↗
                                        </a>
                                    </div>
                                ))}
                                {!payment.status?.originTxHashes?.length && !payment.status?.destinationTxHashes?.length && (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Transaction details loading...</p>
                                )}
                            </div>
                        )}

                        {/* Done Button */}
                        <button onClick={handleClose} style={{ ...styles.button, marginTop: '24px', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header - only when not success */}
                        <div style={styles.header}>
                            <div style={styles.headerIcon}>
                                <CardIcon />
                            </div>
                            <h2 style={styles.title}>
                                {showQR ? 'Send Payment' : 'Pay with any token'}
                            </h2>
                            <p style={styles.subtitle}>
                                {showQR ? 'Scan QR or copy address below' : 'Secure, gasless transactions'}
                            </p>
                        </div>

                        {/* QR Code State */}
                        {showQR && payment.quote && (
                            <>
                                {/* QR Code - white on dark background */}
                                <div style={styles.qrContainer}>
                                    <QRCodeSVG
                                        value={payment.quote.depositAddress}
                                        size={180}
                                        level="M"
                                        bgColor="transparent"
                                        fgColor="white"
                                    />
                                </div>

                                {/* Address with copy button */}
                                <div style={styles.addressContainer}>
                                    <span style={styles.addressText}>
                                        {payment.quote.depositAddress.slice(0, 8)}...
                                        {payment.quote.depositAddress.slice(-8)}
                                    </span>
                                    <button
                                        style={styles.copyButton}
                                        onClick={handleCopy}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                        }}
                                    >
                                        {copied ? <CheckSmallIcon /> : <CopyIcon />}
                                    </button>
                                </div>

                                {/* Details with chain/token info */}
                                <div style={{ ...styles.details, marginTop: '20px' }}>
                                    <div style={styles.detailRow}>
                                        <span>Status</span>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                ...styles.processingBadge,
                                            }}
                                        >
                                            <PulseIcon /> {payment.paymentState === 'processing' ? 'Processing deposit...' : 'Waiting for deposit'}
                                        </span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span>Amount to send</span>
                                        <span style={styles.detailValue}>
                                            {payment.amount} {payment.selectedToken?.symbol}
                                            <span style={styles.tokenBadge}>
                                                {payment.selectedChain?.name}
                                            </span>
                                        </span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span>You receive</span>
                                        <span style={styles.detailValue}>
                                            ~{payment.quote.amountOutFormatted}{' '}
                                            {payment.destinationToken.symbol}
                                            <span style={styles.tokenBadge}>Sui</span>
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

                                {/* Details - only show "You receive" after amount entered */}
                                <div style={styles.details}>
                                    {payment.amount && (
                                        <div style={styles.detailRow}>
                                            <span>You receive</span>
                                            {payment.isLoadingPreview ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <div style={styles.loadingDot} />
                                                    <div style={{ ...styles.loadingDot, animationDelay: '0.2s' }} />
                                                    <div style={{ ...styles.loadingDot, animationDelay: '0.4s' }} />
                                                </div>
                                            ) : payment.previewQuote ? (
                                                <span style={styles.detailValue}>
                                                    ~{payment.previewQuote.amountOutFormatted}{' '}
                                                    {payment.destinationToken.symbol}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                    Enter amount...
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                    </>
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
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}




function CheckSmallIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
        >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    );
}

function PulseIcon() {
    return (
        <svg width="8" height="8" viewBox="0 0 8 8">
            <circle
                cx="4"
                cy="4"
                r="4"
                fill="#818CF8"
                style={{ animation: 'suiport-pulse 1s ease infinite' }}
            />
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
            style={{ animation: 'spin 1s linear infinite' }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
            />
            <path
                d="M12 2a10 10 0 019.95 9"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
