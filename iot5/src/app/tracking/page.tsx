/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Search, Check, MapPin } from "lucide-react";
import Header from "@/app/(landing)/_layout/header";
import Footer from "@/app/(landing)/_layout/footer";
import { cn } from "@/utils";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { getTracking } from "@/services/blockchain/get-tracking";
import Loading from "../(loading)/loading";

// Type definition for TrackingData
interface TrackingData {
    metadata: Record<string, string>;
    transaction_history: (
        | {
              metadata: Record<string, string>;
              txHash: string;
              datetime: number;
              fee: string;
              status: string;
              action: string;
              location?: string;
          }
        | undefined
    )[];
    asset: string;
    policy_id: string;
    asset_name: string;
    fingerprint: string;
    quantity: string;
    initial_mint_tx_hash: string;
    mint_or_burn_count: number;
    onchain_metadata: Record<string, string>;
    onchain_metadata_standard: Record<string, string>;
    onchain_metadata_extra: Record<string, string>;
}

// Step component
interface StepProps {
    title: string;
    description?: string;
    isCompleted?: boolean;
    isActive?: boolean;
    hasTransaction?: boolean;
    onClick?: () => void;
    isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive, hasTransaction, onClick, isLast }) => {
    return (
        <div className="flex items-center w-full relative">
            <button
                className={cn(
                    "flex items-center cursor-pointer transition-all duration-300 hover:bg-[#13161B]/70 p-3 rounded-lg flex-1 z-10",
                    isActive && "bg-[#ff9345]/30 shadow-lg shadow-[#ff9345]/30 ring-1 ring-[#ff9345]/50",
                    !hasTransaction && "opacity-60 cursor-not-allowed",
                )}
                onClick={hasTransaction ? onClick : undefined}
            >
                <div className="relative flex items-center justify-center flex-shrink-0">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-[#13161B]",
                            isCompleted
                                ? "border-[#ff9345] bg-[#ff9345] text-[#fff]"
                                : isActive
                                  ? "border-[#ff9345]/80 bg-[#ff9345]/30 text-[#ff9345]"
                                  : "border-gray-600 text-gray-400",
                        )}
                    >
                        {isCompleted ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <span className="text-sm font-semibold">{title[0].toUpperCase()}</span>
                        )}
                    </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <p
                        className={cn(
                            "text-sm font-semibold text-wrap break-words",
                            isActive || isCompleted ? "text-[#fff]" : "text-[rgb(119,119,118)]",
                        )}
                    >
                        {title}
                    </p>
                    {description && (
                        <p className="text-xs text-[rgb(119,119,118)] text-wrap break-words">{description}</p>
                    )}
                </div>
            </button>
            {!isLast && (
                <div className="hidden md:block text-[rgb(119,119,118)] w-4 h-4 mx-2 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </div>
    );
};

// Stepper component
interface StepperProps {
    steps: Array<{ title: string; description?: string }>;
    currentStep: number;
    selectedStep: number;
    onStepClick: (index: number) => void;
    transactionLocations: string[];
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, selectedStep, onStepClick, transactionLocations }) => {
    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Desktop: Horizontal with line */}
            <div className="hidden md:flex items-center justify-between relative mb-10">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gradient-to-r from-[#13161B] to-[#ff9345]/50 z-0" />
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        title={step.title}
                        description={step.description}
                        isCompleted={index < currentStep}
                        isActive={index === selectedStep}
                        hasTransaction={transactionLocations.includes(step.title)}
                        onClick={() => onStepClick(index)}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
            {/* Mobile: Vertical with line */}
            <div className="md:hidden flex flex-col gap-6 relative">
                <div className="absolute left-5 top-0 w-0.5 h-full bg-gradient-to-b from-[#13161B] to-[#ff9345]/50 z-0" />
                {steps.map((step, index) => (
                    <Step
                        key={step.title}
                        title={step.title}
                        description={step.description}
                        isCompleted={index < currentStep}
                        isActive={index === selectedStep}
                        hasTransaction={transactionLocations.includes(step.title)}
                        onClick={() => onStepClick(index)}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default function TrackingPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedStep, setSelectedStep] = React.useState(0);

    const { data, isLoading, error } = useQuery<TrackingData | undefined>({
        queryKey: ["tracking", searchQuery],
        queryFn: async () => {
            const result = await getTracking({
                unit:
                    searchQuery || "5147554ecaa8931fb9730e2707d75384e12087e45334acdc006b0595000643b050726f647563742031",
            });
            return result as TrackingData | undefined; // Type assertion to match TrackingData
        },
        enabled: !!searchQuery,
    });

    const waypoints = React.useMemo(() => {
        if (!data?.metadata) return [];
        const { startLocation, waypoints: waypointsString, endLocation } = data.metadata;
        return [
            startLocation || "Unknown Start",
            ...(waypointsString ? waypointsString.split(",").map((wp) => wp.trim()) : []),
            endLocation || "Unknown End",
        ].filter(Boolean);
    }, [data]);

    const steps = waypoints.map((location) => ({
        title: location,
        description: `At ${location}`,
    }));

    // Transaction locations (use tx.location instead of tx.metadata)
    const transactionLocations = React.useMemo(() => {
        if (!data?.transaction_history) return [];
        return data.transaction_history
            .filter((tx): tx is NonNullable<typeof tx> => !!tx && !!tx.metadata.location)
            .map((tx) => tx.location!);
    }, [data]);

    // Current step
    const currentStep = React.useMemo(() => {
        if (!data?.metadata?.location || waypoints.length === 0) return 0;
        const index = waypoints.indexOf(data.metadata.location);
        return index !== -1 ? index : 0;
    }, [data, waypoints]);

    // Update selectedStep
    React.useEffect(() => {
        if (steps.length > 0) {
            setSelectedStep(Math.min(currentStep, steps.length - 1));
        }
    }, [currentStep, steps.length]);

    // Selected transaction
    const selectedTransaction = React.useMemo(() => {
        if (!data?.transaction_history || selectedStep >= steps.length) return null;
        const selectedLocation = steps[selectedStep]?.title;
        return (
            data.transaction_history.find(
                (tx): tx is NonNullable<typeof tx> => !!tx && tx.metadata.location === selectedLocation,
            ) || null
        );
    }, [data, selectedStep, steps]);

    console.log(selectedTransaction);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedStep(0);
    };

    const handleStepClick = (index: number) => {
        console.log(transactionLocations.includes(steps[index].title));
        if (transactionLocations.includes(steps[index].title)) {
            setSelectedStep(index);
        }
    };

    if (!searchQuery) {
        return (
            <main className="relative min-h-screen overflow-x-hidden bg-[#0d0e12] flex flex-col items-center justify-center">
                <Header />
                <div className="text-center mt-20 pt-24 max-w-2xl mx-auto">
                    <MapPin className="w-12 h-12 text-[#ff9345] mx-auto mb-4" />
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#ff9345] to-[#ff9345]/50">
                        NFT Journey Tracking
                    </h2>
                    <p className="text-[#fff] text-lg sm:text-xl mx-auto leading-relaxed mb-6">
                        Enter an NFT unit to track its journey on the Cardano blockchain.
                    </p>
                    <div className="w-full max-w-md mx-auto">
                        <div className="relative flex items-center gap-2">
                            <Search className="absolute left-4 text-[rgb(119,119,118)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Enter NFT unit (e.g., policyID + assetName)"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full rounded-full pl-12 pr-4 py-3 text-[#fff] placeholder-[rgb(119,119,118)] border border-[rgb(119,119,118)] focus:outline-none focus:ring-2 focus:ring-[#ff9345] bg-[#13161B] transition-all"
                                aria-label="Search by NFT unit"
                            />
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data) {
        return (
            <main className="relative min-h-screen overflow-x-hidden bg-[#13161B] flex flex-col items-center justify-center">
                <Header />
                <div className="text-center mt-20 pt-24">
                    <MapPin className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 text-lg">
                        {error ? `Error: ${(error as Error).message}` : "No data available for this unit"}
                    </p>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="mt-6 px-6 py-2 bg-[#ff9345] hover:bg-[#ff9345]/80 rounded-full text-[#fff] transition-colors"
                    >
                        Search Again
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-[#13161B] flex flex-col">
            <Head>
                <title>Hydra Pact Tracking | Journey on Cardano</title>
                <meta
                    name="description"
                    content="Track the journey of your NFT on the Cardano blockchain with Hydra Pact."
                />
            </Head>
            <Header />
            <div className="max-w-[1200px] mx-auto mt-20 pt-24 flex flex-col flex-1 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff9345] to-[#ff9345]/50">
                        NFT Journey Tracking
                    </h2>
                    <p className="text-[#fff] text-sm sm:text-base mx-auto leading-relaxed max-w-3xl">
                        From <span className="text-[#ff9345]">{data.metadata.startLocation || "Unknown"}</span> to{" "}
                        <span className="text-[#ff9345]">{data.metadata.endLocation || "Unknown"}</span>. Current:{" "}
                        <span className="text-[#ff9345] font-semibold">{data.metadata.location || "Unknown"}</span>.
                    </p>
                    <div className="mt-6 w-full max-w-md mx-auto">
                        <div className="relative flex items-center gap-2">
                            <Search className="absolute left-4 text-[rgb(119,119,118)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Update NFT unit"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full rounded-full pl-12 pr-4 py-2 text-[#fff] placeholder-[rgb(119,119,118)] border border-[rgb(119,119,118)] focus:outline-none focus:ring-2 focus:ring-[#ff9345] bg-[#13161B] transition-all"
                                aria-label="Update search by NFT unit"
                            />
                        </div>
                    </div>
                </div>

                {/* Journey Progress */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold mb-6 text-center text-[#fff]">Journey Progress</h3>
                    {steps.length > 0 ? (
                        <Stepper
                            steps={steps}
                            currentStep={currentStep}
                            selectedStep={selectedStep}
                            onStepClick={handleStepClick}
                            transactionLocations={transactionLocations}
                        />
                    ) : (
                        <p className="text-center text-[rgb(119,119,118)]">No journey data available.</p>
                    )}
                </div>

                {/* Selected Transaction Details */}
                <div className=" grid md:grid-cols-2 gap-8 mb-12">
                    <div className="p-6 bg-[#13161B] rounded-lg shadow-lg border border-[#ff9345]/30">
                        <h3 className="text-lg font-semibold text-[#fff] mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#ff9345]" />
                            Details for {steps[selectedStep]?.title || "Selected Step"}
                        </h3>
                        {selectedTransaction ? (
                            <div className="space-y-2 text-sm text-[#fff]">
                                <p>
                                    <span className="font-medium">Tx Hash:</span>{" "}
                                    <a
                                        href={`https://cardanoscan.io/transaction/${selectedTransaction.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#ff9345] hover:underline break-all"
                                        title={selectedTransaction.txHash}
                                    >
                                        {selectedTransaction.txHash.slice(0, 10)}...
                                        {selectedTransaction.txHash.slice(-6)}
                                    </a>
                                </p>
                                <p>
                                    <span className="font-medium">Date:</span>{" "}
                                    {new Date(selectedTransaction.datetime * 1000).toLocaleString()}
                                </p>
                                <p>
                                    <span className="font-medium">Fee:</span> {selectedTransaction.fee} lovelace
                                </p>
                                <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    <span className="capitalize">{selectedTransaction.status}</span>
                                </p>
                                <p>
                                    <span className="font-medium">Action:</span> {selectedTransaction.action}
                                </p>
                            </div>
                        ) : (
                            <p className="text-[rgb(119,119,118)] text-sm">
                                No transaction details available for this step.
                            </p>
                        )}
                    </div>

                    {/* Transaction History */}
                    <div className="p-6 bg-[#13161B] rounded-lg shadow-lg border border-[#ff9345]/30 overflow-x-auto">
                        <h3 className="text-lg font-semibold text-[#fff] mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[rgb(119,119,118)]" />
                            Transaction History
                        </h3>
                        {transactionLocations.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <table className="hidden md:table w-full text-sm text-[#fff]">
                                    <thead>
                                        <tr className="border-b border-[rgb(119,119,118)]">
                                            <th className="text-left py-2">Location</th>
                                            <th className="text-left py-2">Tx Hash</th>
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.transaction_history
                                            .filter(
                                                (tx): tx is NonNullable<typeof tx> => !!tx && !!tx.metadata?.location,
                                            )
                                            .map((tx, index) => (
                                                <tr key={index} className="border-b border-[rgb(119,119,118)]/50">
                                                    <td className="py-2">{tx.metadata?.location}</td>
                                                    <td className="py-2">
                                                        <a
                                                            href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#ff9345] hover:underline"
                                                            title={tx.txHash}
                                                        >
                                                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                                                        </a>
                                                    </td>
                                                    <td className="py-2">
                                                        {new Date(tx.datetime * 1000).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-2">{tx.fee}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {/* Mobile List */}
                                <ul className="md:hidden space-y-4 text-sm text-[#fff]">
                                    {data.transaction_history
                                        .filter((tx): tx is NonNullable<typeof tx> => !!tx && !!tx.location)
                                        .map((tx, index) => (
                                            <li
                                                key={index}
                                                className="border-b border-[rgb(119,119,118)]/50 pb-4 last:border-b-0"
                                            >
                                                <p>
                                                    <span className="font-medium">Location:</span> {tx.location}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Tx:</span>{" "}
                                                    <a
                                                        href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#ff9345] hover:underline"
                                                        title={tx.txHash}
                                                    >
                                                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                                                    </a>
                                                </p>
                                                <p>
                                                    <span className="font-medium">Date:</span>{" "}
                                                    {new Date(tx.datetime * 1000).toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Fee:</span> {tx.fee} lovelace
                                                </p>
                                            </li>
                                        ))}
                                </ul>
                            </>
                        ) : (
                            <p className="text-[rgb(119,119,118)] text-sm">No transaction history available.</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
