interface Props {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isCompleted
                    ? 'text-white border-transparent'
                    : isActive
                    ? 'text-white border-transparent'
                    : 'text-gray-400 border-gray-300 bg-white'
                }`}
                style={
                  isCompleted || isActive
                    ? { backgroundColor: '#667EEA', borderColor: '#667EEA' }
                    : {}
                }
              >
                {isCompleted ? '✓' : step}
              </div>
              <span
                className={`text-xs mt-1 font-medium hidden sm:block ${
                  isActive ? 'text-[#667EEA]' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="w-12 sm:w-20 h-0.5 mx-1 transition-all"
                style={{ backgroundColor: isCompleted ? '#667EEA' : '#e5e7eb' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
