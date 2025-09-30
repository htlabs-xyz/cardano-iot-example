"use client";

import * as React from "react";
import { Search, Check, ChevronRight } from "lucide-react";
import Header from "@/app/(landing)/_layout/header";
import Footer from "@/app/(landing)/_layout/footer";
import { cn } from "@/utils";
import Head from "next/head";

// Step component (from your provided code, with minor styling tweaks)
interface StepProps {
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive, onClick }) => {
  return (
    <div
      className={cn(
        "flex items-center cursor-pointer transition-all duration-300 hover:bg-gray-800/50 p-2 rounded-md",
        isActive && "bg-gray-800/70"
      )}
      onClick={onClick}
      role="button"
      aria-label={`View details for ${title}`}
    >
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
            isCompleted
              ? "border-indigo-500 bg-indigo-500 text-white"
              : isActive
              ? "border-indigo-400 bg-indigo-400/20"
              : "border-gray-600 text-gray-400"
          )}
        >
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <span className="text-sm font-medium">{title[0]}</span>
          )}
        </div>
      </div>
      <div className="ml-4">
        <p
          className={cn(
            "text-sm font-medium",
            isActive || isCompleted ? "text-gray-100" : "text-gray-500"
          )}
        >
          {title}
        </p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
    </div>
  );
};

// Stepper component (from your provided code, with connecting line)
interface StepperProps {
  steps: Array<{ title: string; description?: string }>;
  currentStep: number;
  selectedStep: number;
  onStepClick: (index: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, selectedStep, onStepClick }) => {
  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-0 w-full h-1 bg-gray-700/50 md:block hidden" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <Step
              title={step.title}
              description={step.description}
              isCompleted={index < currentStep}
              isActive={index === selectedStep}
              onClick={() => onStepClick(index)}
            />
            {index < steps.length - 1 && (
              <ChevronRight className="hidden md:block text-gray-500" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};