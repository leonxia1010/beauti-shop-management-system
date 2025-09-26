import React from 'react';
import { cn } from '../../lib/utils';

interface StepperProps {
  currentStep: number;
  steps: Array<{
    id: number;
    title: string;
    description?: string;
  }>;
  className?: string;
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <nav className={cn('flex items-center justify-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200',
                {
                  'border-teal-600 bg-teal-600 text-white':
                    step.id <= currentStep,
                  'border-gray-300 bg-white text-gray-400':
                    step.id > currentStep,
                }
              )}
            >
              {step.id <= currentStep ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="ml-3 text-left">
              <div
                className={cn('text-sm font-medium', {
                  'text-teal-600': step.id <= currentStep,
                  'text-gray-400': step.id > currentStep,
                })}
              >
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-gray-500">{step.description}</div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn('mx-6 h-px w-20 transition-colors duration-200', {
                'bg-teal-600': step.id < currentStep,
                'bg-gray-300': step.id >= currentStep,
              })}
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

interface StepperFormProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperForm({ children, className }: StepperFormProps) {
  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      {children}
    </div>
  );
}

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className }: StepContentProps) {
  return (
    <div className={cn('mt-8 transition-all duration-300', className)}>
      {children}
    </div>
  );
}
