# suiport-sdk

Cross-chain payment SDK for Sui. Accept payments from any blockchain.

## Installation

```bash
npm install suiport-sdk
```

## Quick Start

```tsx
import { initSuiport, SuiportButton } from 'suiport-sdk'

// Initialize once at app startup
initSuiport({
  apiKey: 'your-near-api-key',
})

// Add the button anywhere
function PaymentPage() {
  return (
    <SuiportButton
      recipient="0x..." // Sui wallet address
      destinationToken="suiUSDC"
      onSuccess={(result) => {
        console.log('Payment complete!', result.txHash)
      }}
    />
  )
}
```

## Components

### SuiportButton

Drop-in payment button that opens the payment modal. This is the recommended way to use Suiport in your app.

```tsx
<SuiportButton
  recipient="0x620cf72c..."
  refundAddress="0x2527D02599Ba..."
  destinationToken="suiUSDC"
  amount="10"
  label="Pay Now"
  variant="default"
  disabled={false}
  className="my-custom-class"
  onSuccess={(result) => console.log(result)}
  onError={(error) => console.error(error)}
  onOpenChange={(open) => console.log('Modal open:', open)}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recipient` | `string` | ✅ | - | Sui wallet address to receive payment |
| `refundAddress` | `string` | ❌ | - | Address for refunds if payment fails |
| `destinationToken` | `'suiUSDC' \| 'suiSUI'` | ❌ | `'suiUSDC'` | Token to receive on Sui |
| `amount` | `string` | ❌ | - | Fixed amount to request (user can select if omitted) |
| `label` | `string` | ❌ | `'Pay with Crypto'` | Button text |
| `variant` | `'default' \| 'compact' \| 'outline'` | ❌ | `'default'` | Button style variant |
| `disabled` | `boolean` | ❌ | `false` | Disable the button |
| `className` | `string` | ❌ | - | Custom CSS class |
| `onSuccess` | `(result: { txHash: string, amount: string }) => void` | ❌ | - | Called when payment completes |
| `onError` | `(error: Error) => void` | ❌ | - | Called when payment fails |
| `onOpenChange` | `(open: boolean) => void` | ❌ | - | Called when modal opens/closes |

#### Button Variants

- **`default`** - Gradient purple button with shadow (recommended)
- **`compact`** - Smaller version for tight spaces
- **`outline`** - Transparent with purple border

### SuiportModal

For custom implementations, use the modal directly:

```tsx
import { SuiportModal } from 'suiport-sdk'

<SuiportModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  recipient="0x..."
  destinationToken="suiUSDC"
  onSuccess={handleSuccess}
/>
```

## Hooks

### useSuiportPayment

Full control over the payment flow:

```tsx
import { useSuiportPayment } from 'suiport-sdk'

const payment = useSuiportPayment({
  recipient: '0x...',
  destinationToken: 'suiUSDC',
  onSuccess: (result) => console.log('Done!', result),
})

// Access state
payment.paymentState  // 'idle' | 'quoting' | 'awaiting_deposit' | 'processing' | 'success' | 'error'
payment.quote         // Quote details with deposit address
payment.status        // Execution status with tx hashes
payment.error         // Error if payment failed

// Actions
payment.selectToken(token)   // Select source token
payment.setAmount(amount)    // Set amount
payment.getPreview()         // Get quote preview
payment.execute()            // Execute the payment
payment.reset()              // Reset to initial state
```

## Core Functions

```tsx
import { initSuiport, getQuote, getExecutionStatus } from 'suiport-sdk'

// Initialize SDK (required once)
initSuiport({ apiKey: 'your-api-key' })

// Get a quote
const quote = await getQuote({
  srcToken: 'base:usdc',
  destToken: 'sui:usdc',
  amount: '10000000', // 10 USDC (6 decimals)
  recipient: '0x...',
})

// Check execution status
const status = await getExecutionStatus(quote.depositAddress, quote.memo)
```

## Supported Chains & Tokens

**Source Chains:** Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, BSC, and more (22+ chains)

**Destination Tokens on Sui:**
- `suiUSDC` - USDC on Sui
- `suiSUI` - Native SUI token

## Features

- 🌐 Accept payments from 22+ blockchains
- ⚡ Powered by NEAR Intents (sub-minute settlement)
- 💎 Premium glassmorphism UI
- 🔧 Fully customizable via hooks
- 📱 Mobile-responsive modal

## License

MIT
