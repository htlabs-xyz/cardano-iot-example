/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import { Check, MapPin, Package, Truck, Leaf, Coffee, Calendar, BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Head from "next/head";

// Fake data (English)
const fakeTrackingData = {
  metadata: {
    startLocation: "Ea Ktur Coffee Farm, Cư Kuin, Đắk Lắk",
    waypoints: "Buôn Ma Thuột Processing Plant, Ho Chi Minh City Transit Warehouse, BigC Supermarket Hanoi",
    endLocation: "Coffee House Store - 123 Lê Lợi, District 1, Ho Chi Minh City",
    location: "BigC Supermarket Hanoi",
    productName: "Đắk Lắk Specialty Arabica Coffee - Batch 2025",
    batchCode: "LO20250101-ABC",
  },
  transaction_history: [
    { metadata: { location: "Ea Ktur Coffee Farm, Cư Kuin, Đắk Lắk" }, datetime: 1728979200, action: "Harvested & Origin Recorded", status: "success" },
    { metadata: { location: "Buôn Ma Thuột Processing Plant" }, datetime: 1729238400, action: "Roasted, Ground & Packaged", status: "success" },
    { metadata: { location: "Ho Chi Minh City Transit Warehouse" }, datetime: 1730073600, action: "Received at Transit Warehouse", status: "success" },
    { metadata: { location: "BigC Supermarket Hanoi" }, datetime: 1731283200, action: "Distributed to Retail Point", status: "success" },
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
    <div className="relative flex flex-col items-center">
      <button
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        className={cn(
          "group flex flex-col items-center transition-all duration-500",
          !clickable && "cursor-not-allowed opacity-60"
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-700",
            "border-4 border-white/50 backdrop-blur-sm",
            isCompleted
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-110 shadow-xl"
              : isActive
              ? "bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-2xl ring-4 ring-blue-300/50"
              : "bg-white/80 text-slate-600",
            clickable && "hover:scale-110 hover:shadow-2xl"
          )}
        >
          {isCompleted ? <Check className="w-10 h-10" /> : icon}
        </div>

        <div className="mt-6 text-center max-w-56">
          <p className={cn(
            "font-semibold text-base lg:text-lg transition-colors",
            isActive || isCompleted ? "text-slate-800" : "text-slate-500"
          )}>
            {title}
          </p>
          {description && (
            <p className="text-sm text-slate-500 mt-2 hidden md:block">{description}</p>
          )}
        </div>
      </button>

      {!isLast && (
        <div
          className={cn(
            "w-full h-1 mt-10 mx-8 hidden md:block transition-all duration-1000",
            isCompleted ? "bg-gradient-to-r from-blue-500 to-emerald-500" : "bg-slate-300"
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
    title: loc.split(",")[0], // Chỉ lấy phần chính để ngắn gọn
    fullTitle: loc,
    icon: React.createElement(stepIcons[i] || Package, { className: "w-10 h-10" }),
    description:
      loc.includes("Farm") ? "Harvesting & Origin" :
      loc.includes("Processing") ? "Processing & Packaging" :
      loc.includes("Warehouse") ? "Transit Storage" :
      loc.includes("Supermarket") || loc.includes("Store") ? "Retail Distribution" : "Transportation",
  }));

  const transactionLocations = data.transaction_history.map((t) => t.metadata.location);
  const currentLocationIndex = waypoints.indexOf(data.metadata.location);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 text-slate-800 overflow-hidden relative">
      <Head>
        <title>Traceability | {data.metadata.productName}</title>
        <meta name="description" content="Track the journey of your coffee from farm to cup – transparent on blockchain." />
      </Head>

      {/* Subtle animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-ping" />
      </div>

      <div className="relative max-w-7xl mx-auto pt-20 pb-16 px-6">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-white/90 backdrop-blur-sm border border-white/60 rounded-full shadow-lg">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-700 font-medium">Blockchain-Powered Traceability</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Product Journey<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600">
              Fully Transparent
            </span>
          </h1>

          <p className="text-2xl font-bold mb-4 text-slate-700">Batch Code: {data.metadata.batchCode}</p>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            From <span className="font-semibold text-blue-600">{data.metadata.startLocation}</span> →{" "}
            <span className="font-bold text-emerald-600">Currently at: {data.metadata.location}</span> →{" "}
            <span className="font-semibold text-blue-600">{data.metadata.endLocation}</span>
          </p>
        </div>

        {/* Journey Timeline */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">Journey Stages</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0">
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isCompleted={index < currentLocationIndex}
                isActive={index === selectedStep}
                isLast={index === steps.length - 1}
                onClick={() => handleStepClick(index)}
                clickable={transactionLocations.includes(waypoints[index])}
              />
            ))}
          </div>
        </div>

        {/* Details & History Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Current Stage Details */}
          <div className="p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 hover:shadow-3xl transition-shadow duration-500">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-4 text-slate-800">
              <MapPin className="w-8 h-8 text-blue-600" />
              Current Location: {waypoints[selectedStep]}
            </h3>
            {selectedTx ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="text-sm text-slate-500">Timestamp</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedTx.datetime * 1000).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Action Performed</p>
                  <p className="text-lg font-medium text-slate-700">{selectedTx.action}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-7 h-7 text-emerald-600" />
                  <span className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                    VERIFIED ON-CHAIN
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No recorded transaction at this stage yet.</p>
            )}
          </div>

          {/* Transaction History */}
          <div className="p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 hover:shadow-3xl transition-shadow duration-500">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-4 text-slate-800">
              <Truck className="w-8 h-8 text-emerald-600" />
              Transaction History
            </h3>
            <div className="space-y-5">
              {data.transaction_history.map((tx, i) => (
                <div key={i} className="p-5 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-white/70">
                  <p className="font-semibold text-slate-700">{tx.metadata.location.split(",")[0]}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(tx.datetime * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{tx.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* On-Chain Product Info */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="p-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70">
            <h3 className="text-3xl font-bold text-center mb-10 text-slate-800">
              On-Chain Product Details
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-slate-700">
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500">Product Name</p>
                <p className="text-xl font-bold mt-1">{data.onchain_metadata.name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500">Variety</p>
                <p className="text-xl font-bold mt-1">{data.onchain_metadata.variety}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500">Altitude</p>
                <p className="text-xl font-bold mt-1">{data.onchain_metadata.altitude}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500">Origin</p>
                <p className="text-xl font-bold mt-1">{data.onchain_metadata.origin}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm uppercase tracking-wider text-slate-500">Description</p>
                <p className="text-lg font-medium mt-2 leading-relaxed">{data.onchain_metadata.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-slate-500">
          <p className="text-sm font-medium">© 2026 Product Traceability System • Secure • Transparent • Trusted Worldwide</p>
        </div>
      </div>
    </main>
  );
}