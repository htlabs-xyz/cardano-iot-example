"use server";

import { blockfrostFetcher } from "@/lib/cardano";
import { AssetDetails, SpecialTransaction, TransactionAsset, TransactionHistory } from "@/types";
import { datumToJson } from "@/lib/utils";
import { isNil } from "lodash";

// export async function getTracking({ unit }: { unit: string }) {
//     const assetDetails: AssetDetails = await blockfrostFetcher.fetchSpecificAsset(unit);
//     const userAssetsDetails = await blockfrostFetcher.fetchSpecificAsset(unit.replace("000643b0", "000de140"));
//     if (isNil(assetDetails)) {
//         throw new Error("Asset not found");
//     }

//     assetDetails.quantity = userAssetsDetails.quantity;

//     if (isNil(assetDetails)) {
//         throw new Error("Asset not found");
//     }
//     const assetTxs: TransactionAsset[] = await blockfrostFetcher.fetchAssetTransactions(unit);
//     const transaction = await blockfrostFetcher.fetchTransactionsUTxO(assetTxs[0].tx_hash);

//     const assetOutput = transaction.outputs.find(function (output) {
//         const asset = output.amount.find(function (amt) {
//             return amt.unit === unit;
//         });
//         return asset !== undefined;
//     });

//     const metadata = assetOutput?.inline_datum
//         ? ((await datumToJson(assetOutput.inline_datum, {
//               contain_pk: true,
//           })) as Record<string, string>)
//         : {};
//     const assetTransactions: TransactionHistory[] = await blockfrostFetcher.fetchAssetTransactions(unit);

//     const transaction_history = await Promise.all(
//         assetTransactions.map(async function ({ tx_hash }) {
//             const specialTransaction: SpecialTransaction = await blockfrostFetcher.fetchSpecialTransaction(tx_hash);
//             const transaction = await blockfrostFetcher.fetchTransactionsUTxO(tx_hash);

//             const assetInput = transaction.inputs.find(function (input) {
//                 const asset = input.amount.find(function (amt) {
//                     return amt.unit === unit;
//                 });
//                 return asset !== undefined;
//             });

//             const assetOutput = transaction.outputs.find(function (output) {
//                 const asset = output.amount.find(function (amt) {
//                     return amt.unit === unit;
//                 });
//                 return asset !== undefined;
//             });

//             if (!assetInput && assetOutput) {
//                 return {
//                     metadata: assetOutput.inline_datum ? await datumToJson(assetOutput.inline_datum) : {},
//                     txHash: tx_hash,
//                     datetime: specialTransaction.block_time,
//                     fee: specialTransaction.fees,
//                     status: "Completed",
//                     action: "Mint",
//                 };
//             }

//             if (!assetOutput && assetInput) {
//                 return {
//                     metadata: assetInput.inline_datum ? await datumToJson(assetInput.inline_datum) : {},
//                     txHash: tx_hash,
//                     datetime: specialTransaction.block_time,
//                     fee: specialTransaction.fees,
//                     status: "Completed",
//                     action: "Burn",
//                 };
//             }

//             if (assetInput && assetOutput) {
//                 return {
//                     metadata: assetOutput.inline_datum ? await datumToJson(assetOutput.inline_datum) : {},
//                     txHash: tx_hash,
//                     datetime: specialTransaction.block_time,
//                     fee: specialTransaction.fees,
//                     status: "Completed",
//                     action: "Update",
//                 };
//             }
//         }),
//     );

//     const data = {
//         ...assetDetails,
//         metadata: metadata,
//         transaction_history: transaction_history.reverse(),
//     };

//     return data;
// }



export const fakeTrackingData = {
  metadata: {
    startLocation: "Vườn cà phê Ea Ktur, Cư Kuin, Đắk Lắk",
    waypoints: "Nhà máy chế biến Buôn Ma Thuột, Kho trung chuyển TP.HCM, Siêu thị BigC Hà Nội",
    endLocation: "Cửa hàng Coffee House - 123 Lê Lợi, Quận 1, TP.HCM",
    location: "Siêu thị BigC Hà Nội", // vị trí hiện tại của lô hàng
    productName: "Cà phê Arabica Đặc sản",
    batchCode: "LO20250101-ABC",
    harvestDate: "2025-10-15",
  },
  transaction_history: [
    {
      metadata: {
        location: "Vườn cà phê Ea Ktur, Cư Kuin, Đắk Lắk",
      },
      txHash: "tx1_abc123...",
      datetime: 1728979200, // 15/10/2025 00:00:00 UTC
      fee: "0.0017 ADA",
      status: "success",
      action: "Thu hoạch & ghi nhận nguồn gốc",
    },
    {
      metadata: {
        location: "Nhà máy chế biến Buôn Ma Thuột",
      },
      txHash: "tx2_def456...",
      datetime: 1729238400, // 18/10/2025
      fee: "0.0021 ADA",
      status: "success",
      action: "Rang xay & đóng gói",
    },
    {
      metadata: {
        location: "Kho trung chuyển TP.HCM",
      },
      txHash: "tx3_ghi789...",
      datetime: 1730073600, // 28/10/2025
      fee: "0.0018 ADA",
      status: "success",
      action: "Nhập kho trung chuyển",
    },
    {
      metadata: {
        location: "Siêu thị BigC Hà Nội",
      },
      txHash: "tx4_jkl012...",
      datetime: 1731283200, // 11/11/2025
      fee: "0.0020 ADA",
      status: "success",
      action: "Phân phối đến điểm bán",
    },
  ],
  asset: "asset1xyz...",
  policy_id: "f0ff48bbb7cbf04f2c4c2fc8a9b2b3d4b5e6f7g8h9i0j1k2l3m4n5o6",
  asset_name: "COFFEE20250101ABC",
  fingerprint: "asset1abcd1234efgh5678...",
  quantity: "500",
  initial_mint_tx_hash: "mint_tx_001",
  mint_or_burn_count: 1,
  onchain_metadata: {
    name: "Cà phê Arabica Đặc sản Đắk Lắk - Lô 2025",
    description: "Cà phê Arabica được thu hoạch thủ công từ vườn Ea Ktur, chế biến ướt, rang medium.",
    image: "ipfs://QmExampleImageHash123456789",
    origin: "Đắk Lắk, Việt Nam",
    variety: "Arabica Catimor",
    altitude: "1200-1500m",
  },
  onchain_metadata_standard: {},
  onchain_metadata_extra: {},
};



export async function getTracking({ unit }: { unit: string }) {
  // Giả lập delay như gọi API thật
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Bạn có thể thêm logic giả lập lỗi nếu muốn test error state
  // if (unit === "error") throw new Error("Không tìm thấy sản phẩm");

  return fakeTrackingData;
}