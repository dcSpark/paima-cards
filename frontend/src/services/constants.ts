export const CHAIN_URI: string = process.env.CHAIN_URI;
export const NATIVE_PROXY: string = process.env.NATIVE_PROXY;
export const NFT: string = process.env.NFT;
export const CARD_TRADE_NATIVE_PROXY: string =
  process.env.CARD_TRADE_NATIVE_PROXY;
export const CARD_TRADE_NFT: string = process.env.CARD_TRADE_NFT;
export const GENERIC_PAYMENT: string = process.env.GENERIC_PAYMENT;

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
