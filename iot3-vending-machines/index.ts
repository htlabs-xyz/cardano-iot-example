// Lấy địa chỉ ví
const walletAddress = "addr_test1qrfmuzchdsna28wrmna0x8jwfmsyreswaews6v68pm337detpu74wqfm2rcagu4chz3pzua7f42j6f8wn9dewnpm9a6syuwkxr";
console.log('Đang theo dõi địa chỉ:', walletAddress);
console.log('=====================================');

// Biến lưu danh sách UTXO trước đó để so sánh
let previousUtxos: Set<string> = new Set();

/**
 * Hàm chuyển đổi lovelace sang ADA
 */
function lovelaceToAda(lovelace: string): string {
    return (parseInt(lovelace) / 1_000_000).toFixed(6);
}

/**
 * Tạo ID duy nhất cho UTXO (từ txHash và outputIndex)
 */
function getUtxoId(utxo: any): string {
    return `${utxo.tx_hash}#${utxo.output_index}`;
}

/**
 * Hàm kiểm tra UTXO mới
 */
async function checkForNewUtxos() {
    try {
        // Lấy tất cả UTXOs hiện tại
        const response = await fetch(`https://cardano-preprod.blockfrost.io/api/v0/addresses/${walletAddress}/utxos?count=100&page=1&order=asc`, {
            headers: {
                project_id: 'irfz44n'
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }
        const utxos: any[] = await response.json();
        const currentUtxos = new Set<string>();
        const newUtxos: any[] = [];

        // Kiểm tra từng UTXO
        for (const utxo of utxos) {
            const utxoId = getUtxoId(utxo);
            currentUtxos.add(utxoId);

            // Nếu UTXO này chưa có trong danh sách trước đó => UTXO mới
            if (previousUtxos.size > 0 && !previousUtxos.has(utxoId)) {
                newUtxos.push(utxo);
            }
        }

        // Nếu có UTXO mới, hiển thị thông báo chi tiết
        if (newUtxos.length > 0) {
            const timestamp = new Date().toLocaleString('vi-VN');

            console.log('\n🔔 ===== PHÁT HIỆN UTXO MỚI! =====');
            console.log(`⏰ Thời gian: ${timestamp}`);
            console.log(`📦 Số lượng UTXO mới: ${newUtxos.length}`);
            console.log('=====================================');

            // Hiển thị chi tiết từng UTXO mới
            for (let i = 0; i < newUtxos.length; i++) {
                const utxo = newUtxos[i];
                const lovelaceAsset = utxo.amount.find((asset: any) => asset.unit === 'lovelace');
                const lovelaceAmount = lovelaceAsset ? lovelaceAsset.quantity : '0';

                console.log(`\n📦 UTXO #${i + 1}:`);
                console.log(`   🆔 Transaction Hash: ${utxo.tx_hash}`);
                console.log(`   📍 Output Index: ${utxo.output_index}`);
                console.log(`   💰 Số tiền: ${lovelaceToAda(lovelaceAmount)} ADA (${lovelaceAmount} lovelace)`);

                const tokens = utxo.amount.filter((asset: any) => asset.unit !== 'lovelace');
                if (tokens.length > 0) {
                    console.log(`   🪙 Native Tokens:`);
                    tokens.forEach((token: any) => {
                        console.log(`      - ${token.unit}: ${token.quantity}`);
                    });
                }
            }

            console.log('\n=========================================\n');
        }

        // Tính tổng số dư
        let totalBalance = 0;
        for (const utxo of utxos) {
            const lovelace = utxo.amount.find((asset: any) => asset.unit === 'lovelace');
            if (lovelace) {
                totalBalance += parseInt(lovelace.quantity);
            }
        }

        // Hiển thị thông tin lần đầu
        if (previousUtxos.size === 0) {
            console.log(`💼 Số dư ban đầu: ${lovelaceToAda(totalBalance.toString())} ADA`);
            console.log(`📦 Tổng số UTXO: ${utxos.length}`);
            console.log('🔍 Bắt đầu theo dõi UTXO mới...\n');
        }

        // Cập nhật danh sách UTXO
        previousUtxos = currentUtxos;

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra UTXO:', error);
    }
}

// Kiểm tra UTXO ngay lập tức
await checkForNewUtxos();

// Thiết lập kiểm tra định kỳ mỗi 10 giây
const CHECK_INTERVAL = 10000; // 10 giây
console.log(`⏱️  Kiểm tra mỗi ${CHECK_INTERVAL / 1000} giây...\n`);

setInterval(async () => {
    await checkForNewUtxos();
}, CHECK_INTERVAL);