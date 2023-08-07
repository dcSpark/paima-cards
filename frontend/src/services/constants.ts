export const CHAIN_URI = process.env.CHAIN_URI as string;
export const NATIVE_PROXY = process.env.NATIVE_PROXY as string;
export const NFT = process.env.NFT as string;
export const CARD_TRADE_NATIVE_PROXY = process.env
  .CARD_TRADE_NATIVE_PROXY as string;
export const CARD_TRADE_NFT = process.env.CARD_TRADE_NFT as string;
export const GENERIC_PAYMENT = process.env.GENERIC_PAYMENT as string;

if (
  CHAIN_URI == null ||
  NATIVE_PROXY == null ||
  NFT == null ||
  CARD_TRADE_NATIVE_PROXY == null ||
  CARD_TRADE_NFT == null ||
  GENERIC_PAYMENT == null
)
  throw new Error(
    "ERROR: Did you forget to fill out .env or webpack.plugins.js?"
  );
