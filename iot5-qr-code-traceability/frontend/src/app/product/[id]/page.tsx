/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import { Check, MapPin, Package, Truck, Leaf, Coffee, Calendar, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Head from "next/head";

// Fake data in English
const fakeTrackingData = {
  metadata: {
    startLocation: "Ea Ktur Coffee Farm, Cư Kuin, Đắk Lắk",
    waypoints: "Buôn Ma Thuột Processing Plant, Ho Chi Minh City Transit Warehouse, BigC Supermarket Hanoi",
    endLocation: "Coffee House Store - 123 Lê Lợi, District 1, Ho Chi Minh City",
    location: "BigC Supermarket Hanoi", // current location
    productName: "Đắk Lắk Specialty Arabica Coffee - Batch 2025",
    batchCode: "LO20250101-ABC",
  },
  transaction_history: [
    {
      metadata: { location: "Ea Ktur Coffee Farm, Cư Kuin, Đắk Lắk" },
      datetime: 1728979200,
      action: "Harvested & Origin Recorded",
      status: "success",
    },
    {
      metadata: { location: "Buôn Ma Thuột Processing Plant" },
      datetime: 1729238400,
      action: "Roasted, Ground & Packaged",
      status: "success",
    },
    {
      metadata: { location: "Ho Chi Minh City Transit Warehouse" },
      datetime: 1730073600,
      action: "Received at Transit Warehouse",
      status: "success",
    },
    {
      metadata: { location: "BigC Supermarket Hanoi" },
      datetime: 1731283200,
      action: "Distributed to Retail Point",
      status: "success",
    },
  ],
  onchain_metadata: {
    name: "Đắk Lắk Specialty Arabica Coffee - Batch 2025",
    variety: "Arabica Catimor",
    altitude: "1200-1500m",
    origin: "Đắk Lắk, Vietnam",
    description: "Hand-picked Arabica coffee, wet-processed, medium roast.",
  },
};

const Step: React.FC<{
  title: string;
  description?: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  isLast: boolean;
  onClick?: () => void;
  clickable: boolean;
}> = ({ title, description, icon, isCompleted, isActive, isLast, onClick, clickable }) => {
  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          "flex flex-col items-center cursor-pointer transition-all duration-500 group",
          !clickable && "cursor-not-allowed opacity-60"
        )}
        onClick={clickable ? onClick : undefined}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-500",
            "border-4",
            isCompleted
              ? "bg-emerald-500 border-emerald-400 text-white scale-110"
              : isActive
              ? "bg-gradient-to-br from-emerald-500 to-cyan-500 border-emerald-300 text-white shadow-2xl shadow-emerald-500/50"
              : "bg-slate-800/80 border-slate-600 text-slate-400",
            clickable && "hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/40"
          )}
        >
          {isCompleted ? <Check className="w-8 h-8" /> : icon}
        </div>
        <div className="mt-4 text-center max-w-48">
          <p className={cn("font-semibold text-sm lg:text-base transition-colors", isActive || isCompleted ? "text-white" : "text-slate-400")}>
            {title}
          </p>
          {description && <p className="text-xs text-slate-500 mt-1 hidden lg:block">{description}</p>}
        </div>
      </div>

      {!isLast && (
        <div
          className={cn(
            "w-full h-1 mx-4 hidden md:block transition-all duration-700",
            isCompleted ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-700"
          )}
        />
      )}
    </div>
  );
};

export default function ProductTraceabilityTracking() {
  const [selectedStep, setSelectedStep] = React.useState(0);
  const data = fakeTrackingData;

  const waypoints = React.useMemo(() => {
    const { startLocation, waypoints: wp, endLocation } = data.metadata;
    return [startLocation, ...(wp ? wp.split(",").map((w) => w.trim()) : []), endLocation].filter(Boolean);
  }, []);

  const stepIcons = [Leaf, Coffee, Package, Truck, MapPin];

  const steps = waypoints.map((loc, i) => ({
    title: loc,
    icon: React.createElement(stepIcons[i] || Package, { className: "w-7 h-7" }),
    description:
      loc.includes("Farm") ? "Harvesting" :
      loc.includes("Processing") ? "Processing" :
      loc.includes("Warehouse") ? "Storage" :
      loc.includes("Supermarket") || loc.includes("Store") ? "Retail Distribution" : "Transportation",
  }));

  const transactionLocations = data.transaction_history.map((t) => t.metadata.location);
  const currentLocationIndex = waypoints.indexOf(data.metadata.location);
  const currentStep = currentLocationIndex >= 0 ? currentLocationIndex + 1 : 0;

  React.useEffect(() => {
    setSelectedStep(currentLocationIndex);
  }, [currentLocationIndex]);

  const selectedTx = data.transaction_history.find((tx) => tx.metadata.location === waypoints[selectedStep]);

  const handleStepClick = (index: number) => {
    if (transactionLocations.includes(waypoints[index])) {
      setSelectedStep(index);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 text-white overflow-hidden">
      <Head>
        <title>Traceability | {data.metadata.productName}</title>
        <meta name="description" content="Track the journey of your coffee from farm to cup – transparent on blockchain." />
      </Head>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto pt-20 pb-16 px-6">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Product Traceability Journey
          </h1>
          <p className="text-2xl font-bold mb-4">Batch Code: {data.metadata.batchCode}</p>
          <p className="text-xl text-slate-300 max-w-5xl mx-auto">
            From <span className="text-emerald-400 font-medium">{data.metadata.startLocation}</span> →{" "}
            <span className="text-emerald-400 font-bold">Currently at: {data.metadata.location}</span> →{" "}
            <span className="text-emerald-400 font-medium">{data.metadata.endLocation}</span>
          </p>
        </div>

        {/* Timeline / Journey Progress */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Journey Stages</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isCompleted={index < currentStep}
                isActive={index === selectedStep}
                isLast={index === steps.length - 1}
                onClick={() => handleStepClick(index)}
                clickable={transactionLocations.includes(waypoints[index])}
              />
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Current Stage Details */}
          <div className="p-8 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-emerald-500/30 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <MapPin className="w-7 h-7 text-emerald-400" />
              Details at: {waypoints[selectedStep]}
            </h3>
            {selectedTx ? (
              <div className="space-y-5 text-slate-300">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-medium text-white">Timestamp:</span>{" "}
                    {new Date(selectedTx.datetime * 1000).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-white">Action:</span> {selectedTx.action}
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium text-white">Status:</span>{" "}
                  <span className="ml-2 px-4 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                    {selectedTx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No transaction recorded at this stage yet.</p>
            )}
          </div>

          {/* Transaction History */}
          <div className="p-8 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-emerald-500/30 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Truck className="w-7 h-7 text-emerald-400" />
              Transaction History
            </h3>
            <div className="space-y-4">
              {data.transaction_history.map((tx, index) => (
                <div key={index} className="p-5 bg-slate-700/40 rounded-2xl border border-slate-600/50">
                  <p className="font-medium text-emerald-300">{tx.metadata.location}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(tx.datetime * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">Action: {tx.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="p-10 bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 backdrop-blur-xl rounded-3xl border border-emerald-500/50 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">On-Chain Product Information</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-200">
              <div>
                <p className="text-sm text-slate-400">Product Name</p>
                <p className="text-lg font-medium">{data.onchain_metadata.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Variety</p>
                <p className="text-lg font-medium">{data.onchain_metadata.variety}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Altitude</p>
                <p className="text-lg font-medium">{data.onchain_metadata.altitude}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Origin</p>
                <p className="text-lg font-medium">{data.onchain_metadata.origin}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Description</p>
                <p className="text-lg font-medium">{data.onchain_metadata.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}