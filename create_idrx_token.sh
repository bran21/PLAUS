#!/bin/bash
echo "Creating IDRX Mock Token..."
IDRX_OUTPUT=$(spl-token create-token --decimals 6)
IDRX_MINT=$(echo "$IDRX_OUTPUT" | grep "Creating token" | awk '{print $3}')
if [ -z "$IDRX_MINT" ]; then
    echo "Failed to create IDRX token. Output: $IDRX_OUTPUT"
    exit 1
fi
echo "IDRX Mint: $IDRX_MINT"
spl-token create-account $IDRX_MINT
spl-token mint $IDRX_MINT 100000000

echo "Done."
echo "IDRX: $IDRX_MINT"
