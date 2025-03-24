import { CardanoWallet } from "./cardano-wallet";

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-8">
                {/* Welcome Heading */}
                <header>
                    <title>IOT 02 - The locker</title>
                    <meta name="description" content="Open electric lock with blockchain" />
                </header>
                <h1 className="text-3xl font-bold text-gray-800 text-center tracking-tight">
                    Welcome to IoT2-TheLocker
                </h1>

                {/* Instruction Text */}
                <p className="text-center text-gray-600 text-lg font-medium">
                    Connect your wallet to continue
                </p>

                {/* Wallet Button Container */}
                <div className="flex justify-center">
                    <CardanoWallet persist={true} />
                </div>
            </div>
        </div>
    );
}