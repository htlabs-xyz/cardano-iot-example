"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";
import Header from "@/app/(landing)/_layout/header";
import Footer from "@/app/(landing)/_layout/footer";
import { Stepper } from "@/components/ui/stepper";

const steps = [
  { title: "Step 1", description: "Create your account" },
  { title: "Step 2", description: "Verify your email" },
  { title: "Step 3", description: "Add your details" },
  { title: "Step 4", description: "Confirm and finish" },
];

export default function DownloadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <main className="relative px-4 overflow-x-hidden">
      <Header />

      <div className="flex flex-col items-center justify-center px-auto pb-[50px] pt-[150px]">
        <div className="text-center mb-4">
          <h2 className="text-5xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Hydra Pact Features
          </h2>
          <p className="text-gray-300 max-w-2xl text-xl mx-auto leading-relaxed">
            Discover the cutting-edge tools and capabilities of Hydra Pact, designed to empower DeFi on Cardano.
          </p>
        </div>
        <div className="mt-6 w-full max-w-xl">
          <div className="relative flex items-center gap-2">
            <span className="absolute left-4 text-gray-400">
              <Search aria-hidden="true" />
            </span>
            <input
              type="text"
              placeholder="Search fundraisers"
              className="w-full rounded-full pl-12 pr-4 py-3 text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Search fundraisers"
            />
          </div>
        </div>
      </div>

      {/* stepper */}

      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-8 text-center">Stepper Demo</h1>
        <Stepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />
        <div className="mt-8 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Current Step Content</h2>
          <p>{steps[currentStep].description}</p>
        </div>
      </div>

      {/* stepper */}

      <Footer />
      {/* footer-end */}
    </main>
  );
}
