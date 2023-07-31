export const CHAIN_URI: string = process.env.CHAIN_URI;
export const NATIVE_PROXY: string = process.env.NATIVE_PROXY;
export const NFT: string = process.env.NFT;
export const CARD_PACK_NATIVE_PROXY: string =
  process.env.CARD_PACK_NATIVE_PROXY;
export const CARD_PACK_NFT: string = process.env.CARD_PACK_NFT;
export const GENERIC_PAYMENT: string = process.env.GENERIC_PAYMENT;

if (CHAIN_URI == null || NATIVE_PROXY == null || NFT == null)
  throw new Error("ERROR: Did you forget to fill out .env?");
