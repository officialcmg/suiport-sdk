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

## Features

- 🌐 Accept payments from 22+ blockchains
- ⚡ Powered by NEAR Intents (sub-minute settlement)
- 💎 Premium glassmorphism UI
- 🔧 Fully customizable via hooks

## API

### Components

- `SuiportButton` - Drop-in payment button
- `SuiportModal` - Payment modal component

### Hooks

- `useSuiportPayment` - Full control over payment flow

### Core Functions

- `initSuiport(config)` - Initialize SDK
- `getQuote(options)` - Get swap quote
- `getExecutionStatus(depositAddress)` - Check status

## License

MIT
