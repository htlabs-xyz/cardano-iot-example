"use client";

import * as React from "react";
import { Search, Check, ChevronRight } from "lucide-react";
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
              metadata: unknown;
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

// Step component with text wrapping and enhanced styling
interface StepProps {
    title: string;
    description?: string;
    isCompleted?: boolean;
    isActive?: boolean;
    hasTransaction?: boolean;
    onClick?: () => void;
}

const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive, hasTransaction, onClick }) => {
    return (
        <div
            className={cn(
                "flex items-center cursor-pointer transition-all duration-300 hover:bg-gray-800/50 p-3 rounded-lg w-full md:w-auto",
                isActive && "bg-gray-800/70 shadow-md shadow-indigo-500/20",
                !hasTransaction && "opacity-50 cursor-not-allowed",
            )}
            onClick={hasTransaction ? onClick : undefined}
            role="button"
            aria-label={`View details for ${title}`}
        >
            <div className="relative flex items-center justify-center flex-shrink-0">
                <div
                    className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isCompleted
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : isActive
                              ? "border-indigo-400 bg-indigo-400/30 text-indigo-200"
                              : "border-gray-600 text-gray-400",
                    )}
                >
                    {isCompleted ? (
                        <Check className="w-6 h-6" />
                    ) : (
                        <span className="text-base font-semibold">{title[0]}</span>
                    )}
                </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <p
                    className={cn(
                        "text-base font-semibold text-wrap break-words",
                        isActive || isCompleted ? "text-gray-100" : "text-gray-500",
                    )}
                >
                    {title}
                </p>
                {description && <p className="text-sm text-gray-400 text-wrap break-words">{description}</p>}
            </div>
        </div>
    );
};

// Stepper component with connecting line
interface StepperProps {
    steps: Array<{ title: string; description?: string }>;
    currentStep: number;
    selectedStep: number;
    onStepClick: (index: number) => void;
    transactionLocations: string[];
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, selectedStep, onStepClick, transactionLocations }) => {
    return (
        <div className="w-full max-w-5xl mx-auto relative">
            <div className="absolute top-6 left-0 w-full h-1 bg-gradient-to-r from-gray-700/50 to-indigo-500/50 md:block hidden" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                        <Step
                            title={step.title}
                            description={step.description}
                            isCompleted={index < currentStep}
                            isActive={index === selectedStep}
                            hasTransaction={transactionLocations.includes(step.title)}
                            onClick={() => onStepClick(index)}
                        />
                        {index < steps.length - 1 && <ChevronRight className="hidden md:block text-gray-400 w-5 h-5" />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default function TrackingPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedStep, setSelectedStep] = React.useState(0);

    // Fetch data using react-query
    const { data, isLoading, error } = useQuery<TrackingData | undefined>({
        queryKey: ["tracking", searchQuery],
        queryFn: () =>
            getTracking({
                unit:
                    searchQuery || "5147554ecaa8931fb9730e2707d75384e12087e45334acdc006b0595000643b050726f647563742031",
            }),
        enabled: !!searchQuery, // Only fetch when searchQuery is non-empty
    });

    // Generate steps from waypoints
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
        description: `Reached ${location}`,
    }));

    // Get valid transaction locations
    const transactionLocations = React.useMemo(() => {
        if (!data?.transaction_history) return [];
        return data.transaction_history
            .filter((tx): tx is NonNullable<typeof tx> => !!tx && !!tx.location)
            .map((tx) => tx.location);
    }, [data]);

    // Set currentStep based on the latest location
    const currentStep = React.useMemo(() => {
        if (!data?.metadata?.location) return 0;
        const index = waypoints.indexOf(data.metadata.location);
        return index !== -1 ? index : 0;
    }, [data, waypoints]);

    // Update selectedStep when currentStep changes
    React.useEffect(() => {
        setSelectedStep(currentStep);
    }, [currentStep]);

    // Find transaction for the selected step
    const selectedTransaction = React.useMemo(() => {
        if (!data?.transaction_history || selectedStep >= steps.length) return null;
        const selectedLocation = steps[selectedStep]?.title;
        return data.transaction_history.find(
            (tx): tx is NonNullable<typeof tx> => !!tx && tx.location === selectedLocation,
        );
    }, [data, selectedStep, steps]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleStepClick = (index: number) => {
        setSelectedStep(index);
    };

    if (!searchQuery) {
        return (
            <main className="relative px-4 overflow-x-hidden bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        NFT Journey Tracking
                    </h2>
                    <p className="text-gray-300 max-w-2xl text-lg sm:text-xl mx-auto leading-relaxed mb-6">
                        Enter an NFT unit to track its journey on the Cardano blockchain.
                    </p>
                    <div className="w-full max-w-xl mx-auto">
                        <div className="relative flex items-center gap-2">
                            <span className="absolute left-4 text-gray-400">
                                <Search aria-hidden="true" className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Enter NFT unit (e.g., policyID + assetName)"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full rounded-full pl-12 pr-4 py-3 text-gray-700 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 transition-all duration-300"
                                aria-label="Search by NFT unit"
                            />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error || !data) {
        return (
            <main className="relative px-4 overflow-x-hidden bg-gray-900 min-h-screen flex items-center justify-center">
                <p className="text-red-400 text-lg">
                    {error ? `Error: ${error.message}` : "No data available for this unit"}
                </p>
            </main>
        );
    }

    return (
        <main className="relative px-4 overflow-x-hidden bg-gray-900 min-h-screen">
            <Head>
                <title>Hydra Pact Tracking | Journey on Cardano</title>
                <meta
                    name="description"
                    content="Track the journey of your NFT on the Cardano blockchain with Hydra Pact."
                />
            </Head>
            <Header />
            <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-[50px] pt-[150px]">
                <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        NFT Journey Tracking
                    </h2>
                    <p className="text-gray-300 max-w-2xl text-lg sm:text-xl mx-auto leading-relaxed text-wrap break-words">
                        Follow the journey of your NFT from{" "}
                        <span className="text-indigo-400">{data.metadata.startLocation || "Unknown"}</span> to{" "}
                        <span className="text-indigo-400">{data.metadata.endLocation || "Unknown"}</span> on the Cardano
                        blockchain. Current location:{" "}
                        <span className="text-purple-400 font-semibold">{data.metadata.location || "Unknown"}</span>.
                    </p>
                </div>
                <div className="mt-6 w-full max-w-xl">
                    <div className="relative flex items-center gap-2">
                        <span className="absolute left-4 text-gray-400">
                            <Search aria-hidden="true" className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Enter NFT unit (e.g., policyID + assetName)"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full rounded-full pl-12 pr-4 py-3 text-gray-700 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 transition-all duration-300"
                            aria-label="Search by NFT unit"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-10 text-center text-gray-100">Journey Progress</h1>
                {steps.length > 0 ? (
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        selectedStep={selectedStep}
                        onStepClick={handleStepClick}
                        transactionLocations={[""]}
                    />
                ) : (
                    <p className="text-center text-gray-400">No journey data available.</p>
                )}

                {/* Transaction Details for Selected Step */}
                {selectedTransaction ? (
                    <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-indigo-500/30 transition-all duration-300">
                        <h3 className="text-xl font-semibold text-gray-100 mb-4 text-wrap break-words">
                            Details for {selectedTransaction.location}
                        </h3>
                        <p className="text-gray-300 text-wrap break-words">
                            <span className="font-medium">Transaction Hash:</span>{" "}
                            <a
                                href={`https://cardanoscan.io/transaction/${selectedTransaction.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:underline break-all"
                            >
                                {selectedTransaction.txHash.slice(0, 8)}...
                            </a>
                        </p>
                        <p className="text-gray-300">
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(selectedTransaction.datetime * 1000).toLocaleString()}
                        </p>
                        <p className="text-gray-300">
                            <span className="font-medium">Fee:</span> {selectedTransaction.fee} lovelace
                        </p>
                        <p className="text-gray-300">
                            <span className="font-medium">Status:</span> {selectedTransaction.status}
                        </p>
                        <p className="text-gray-300">
                            <span className="font-medium">Action:</span> {selectedTransaction.action}
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-indigo-500/30 text-center text-gray-400">
                        No transaction details available for {steps[selectedStep]?.title || "this step"}.
                    </div>
                )}

                {/* Transaction History */}
                {transactionLocations.length > 0 && (
                    <div className="mt-12 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-indigo-500/30">
                        <h3 className="text-xl font-semibold text-gray-100 mb-4">Transaction History</h3>
                        <ul className="space-y-6">
                            {data.transaction_history
                                .filter((tx): tx is NonNullable<typeof tx> => !!tx && !!tx.location)
                                .map((tx, index) => (
                                    <li
                                        key={index}
                                        className="text-gray-300 border-b border-gray-700/50 pb-4 last:border-b-0"
                                    >
                                        <p className="text-wrap break-words">
                                            <span className="font-medium">Location:</span> {tx.location}
                                        </p>
                                        <p className="text-wrap break-words">
                                            <span className="font-medium">Transaction Hash:</span>{" "}
                                            <a
                                                href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-400 hover:underline break-all"
                                            >
                                                {tx.txHash.slice(0, 8)}...
                                            </a>
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span>{" "}
                                            {new Date(tx.datetime * 1000).toLocaleString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">Fee:</span> {tx.fee} lovelace
                                        </p>
                                        <p>
                                            <span className="font-medium">Status:</span> {tx.status}
                                        </p>
                                        <p>
                                            <span className="font-medium">Action:</span> {tx.action}
                                        </p>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
                {transactionLocations.length === 0 && (
                    <p className="text-center text-gray-400 mt-8">No transaction history available.</p>
                )}
            </div>

            <Footer />
        </main>
    );
}
