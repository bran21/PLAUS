#!/bin/bash
echo "Creating CROP Mock Token..."
CROP_OUTPUT=$(spl-token create-token --decimals 6)
CROP_MINT=$(echo "$CROP_OUTPUT" | grep "Creating token" | awk '{print $3}')
if [ -z "$CROP_MINT" ]; then
    echo "Failed to create CROP token. Output: $CROP_OUTPUT"
    exit 1
fi
echo "CROP Mint: $CROP_MINT"
spl-token create-account $CROP_MINT
spl-token mint $CROP_MINT 1000000

echo "Creating USDC Mock Token..."
USDC_OUTPUT=$(spl-token create-token --decimals 6)
USDC_MINT=$(echo "$USDC_OUTPUT" | grep "Creating token" | awk '{print $3}')
if [ -z "$USDC_MINT" ]; then
    echo "Failed to create USDC token. Output: $USDC_OUTPUT"
    exit 1
fi
echo "USDC Mint: $USDC_MINT"
spl-token create-account $USDC_MINT
spl-token mint $USDC_MINT 1000000

echo "Done."
echo "CROP: $CROP_MINT"
echo "USDC: $USDC_MINT"
