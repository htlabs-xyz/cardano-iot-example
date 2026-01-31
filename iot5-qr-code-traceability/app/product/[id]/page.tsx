/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Head from "next/head";
import {
  Check,
  MapPin,
  Package,
  Truck,
  Leaf,
  Coffee,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";



const fakeTrackingData = {
  metadata: {
    startLocation: "Ea Ktur Coffee Farm, Cư Kuin, Đắk Lắk",
    waypoints:
      "Buôn Ma Thuột Processing Plant, Ho Chi Minh City Transit Warehouse, BigC Supermarket Hanoi",
    endLocation:
      "Coffee House Store - 123 Lê Lợi, District 1, Ho Chi Minh City",
    location: "BigC Supermarket Hanoi",
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
    altitude: "1200–1500m",
    origin: "Đắk Lắk, Vietnam",
    description:
      "Hand-picked Arabica coffee, wet-processed, medium roast.",
  },
};

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

const Step = ({
  title,
  description,
  icon,
  isCompleted,
  isActive,
  isLast,
  onClick,
  clickable,
}: any) => {
  return (
    <div className="relative flex items-center">
      <div
        onClick={clickable ? onClick : undefined}
        className={cn(
          "flex flex-col items-center transition-all duration-300",
          clickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        )}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-md transition-all",
            isCompleted
              ? "bg-green-500 border-green-400 text-white"
              : isActive
              ? "bg-gradient-to-br from-blue-500 to-green-500 border-blue-400 text-white scale-110"
              : "bg-white border-gray-300 text-gray-400",
            clickable && "hover:scale-110 hover:shadow-lg"
          )}
        >
          {isCompleted ? <Check className="w-7 h-7" /> : icon}
        </div>

        <div className="mt-4 text-center max-w-[180px]">
          <p
            className={cn(
              "font-semibold text-sm",
              isActive || isCompleted
                ? "text-gray-900"
                : "text-gray-500"
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1 hidden md:block">
              {description}
            </p>
          )}
        </div>
      </div>

      {!isLast && (
        <div
          className={cn(
            "w-16 h-1 mx-4 hidden md:block",
            isCompleted
              ? "bg-gradient-to-r from-green-400 to-blue-400"
              : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function ProductTraceabilityTracking() {
  const data = fakeTrackingData;
  const [selectedStep, setSelectedStep] = React.useState(0);

  const waypoints = React.useMemo(() => {
    const { startLocation, waypoints, endLocation } = data.metadata;
    return Array.from(
      new Set([
        startLocation,
        ...(waypoints ? waypoints.split(",").map((w) => w.trim()) : []),
        endLocation,
      ])
    );
  }, [data]);

  const transactionLocations = data.transaction_history.map(
    (t) => t.metadata.location
  );

  const currentIndex = waypoints.indexOf(data.metadata.location);

  React.useEffect(() => {
    setSelectedStep(currentIndex);
  }, [currentIndex]);

  const selectedTx = data.transaction_history.find(
    (tx) => tx.metadata.location === waypoints[selectedStep]
  );

  const iconForLocation = (loc: string) => {
    if (loc.includes("Farm")) return <Leaf className="w-7 h-7" />;
    if (loc.includes("Processing")) return <Coffee className="w-7 h-7" />;
    if (loc.includes("Warehouse")) return <Package className="w-7 h-7" />;
    if (loc.includes("Transit")) return <Truck className="w-7 h-7" />;
    return <MapPin className="w-7 h-7" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800">
      <Head>
        <title>Traceability | {data.metadata.productName}</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
            <BadgeCheck className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">
              Verified on Blockchain
            </span>
          </div>

          <h1 className="text-5xl font-extrabold mb-6">
            Product{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              Traceability
            </span>{" "}
            Journey
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            Batch Code:{" "}
            <span className="font-semibold">
              {data.metadata.batchCode}
            </span>
          </p>

          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            From{" "}
            <span className="text-green-600 font-medium">
              {data.metadata.startLocation}
            </span>{" "}
            → Currently at{" "}
            <span className="text-blue-600 font-semibold">
              {data.metadata.location}
            </span>{" "}
            → {data.metadata.endLocation}
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Supply Chain Journey
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {waypoints.map((loc, index) => (
              <Step
                key={loc}
                title={loc}
                description=""
                icon={iconForLocation(loc)}
                isCompleted={index < currentIndex}
                isActive={index === selectedStep}
                isLast={index === waypoints.length - 1}
                clickable={transactionLocations.includes(loc)}
                onClick={() => setSelectedStep(index)}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-600" />
              Stage Details
            </h3>

            {selectedTx ? (
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  {new Date(
                    selectedTx.datetime * 1000
                  ).toLocaleString()}
                </div>
                <p>
                  <strong>Action:</strong> {selectedTx.action}
                </p>
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {selectedTx.status.toUpperCase()}
                </span>
              </div>
            ) : (
              <p className="text-gray-500">
                No transaction recorded yet.
              </p>
            )}
          </div>

          <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-600" />
              Transaction History
            </h3>

            <div className="space-y-4">
              {data.transaction_history.map((tx, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-2xl border"
                >
                  <p className="font-medium text-gray-800">
                    {tx.metadata.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      tx.datetime * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">{tx.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="p-10 bg-gradient-to-r from-blue-100 to-green-100 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-center">
              On-Chain Product Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(data.onchain_metadata).map(
                ([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-500 capitalize">
                      {key.replace("_", " ")}
                    </p>
                    <p className="font-medium">{value as string}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
