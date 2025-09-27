"use client";
import * as React from "react";
import { useUnitContext } from "@/contexts/unit";
import { BasicStep, ResultStep, TransactionStep } from "../../../_components/burn-steps";
import StepperNav from "../../../_components/burn-steps/stepper-nav";

export default function Page() {
  const { burnStepper } = useUnitContext();

  return (
    <div className="py-8 px-10 m-auto flex flex-col">
      <div className="rounded-xl p-6 bg-section shadow-md flex flex-col gap-3">
        <StepperNav />
        <div className="space-y-4">
          {burnStepper.switch({
            basic: () => <BasicStep />,
            transaction: () => <TransactionStep />,
            result: () => <ResultStep />,
          })}
        </div>
      </div>
    </div>
  );
}
