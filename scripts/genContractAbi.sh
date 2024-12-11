#!/usr/bin/env bash

set -euo pipefail

CONTRACT_PROJ_BRANCH="${CONTRACT_PROJ_BRANCH:-main}"

# -----------------------------------------------------------

# https://github.com/foundry-rs/foundry/blob/d45f2a0bd4c99422abec628b224cace520b0f80b/foundryup/install#L53-L55
if [[ "$OSTYPE" =~ ^darwin ]] && [[ ! -f /usr/local/opt/libusb/lib/libusb-1.0.0.dylib && ! -f /opt/homebrew/opt/libusb/lib/libusb-1.0.0.dylib ]]; then
  echo && echo "Warning: libusb not found. You may need to install it manually on MacOS via Homebrew (brew install libusb)."
fi

if ! command -v direnv &> /dev/null; then
  echo && echo "Error: direnv not found. You need to install it firstly."
  exit 1
fi

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.."

CONTRACT_PROJ_PATH="vendors/aki-contracts"

if [ ! -e "$CONTRACT_PROJ_PATH" ]; then
  git clone git@github.com:Aki-Protocol/aki-contracts.git "$CONTRACT_PROJ_PATH"
fi

# ======= vendors/aki-contracts =======
pushd "$CONTRACT_PROJ_PATH"

git fetch origin
git reset --hard "origin/$CONTRACT_PROJ_BRANCH"

eval "$(direnv export bash)"
if ! command -v forge &> /dev/null; then
  foundryup
fi
yarn
forge install
hardhat compile

popd

# ======= project root =======
ARTIFACTS_PATH="$CONTRACT_PROJ_PATH/artifacts"
FRONTEND_ABI_PATH="src/__generated__/smartContracts"
CONTRACT_FILES=(
  "contracts/AkiMembershipNFT.sol"
)

echo "======= START! ======="
for i in "${CONTRACT_FILES[@]}"; do
  echo "Generating file for $i"
  mkdir -p "$FRONTEND_ABI_PATH/$(dirname "$i")"
  cat <<EOF > "$FRONTEND_ABI_PATH/$(dirname "$i")/$(basename "$i" .sol).ts"
export default $(cat "$ARTIFACTS_PATH/$i/$(basename "$i" .sol).json") as const
EOF
done
echo "======= DONE! ======="