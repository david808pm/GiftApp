const STEP_LABELS = ['Identificación', 'Selección', 'Revisión', 'Finalizar'];

export default function ProgressStepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEP_LABELS.map((label, i) => {
        const state =
          i < currentStep ? 'completed' : i === currentStep ? 'active' : '';
        return (
          <div key={label} className="stepper-step">
            {i > 0 && (
              <div
                className={`stepper-line ${
                  i <= currentStep ? 'completed' : ''
                }`}
              />
            )}
            <div className={`stepper-circle ${state}`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`stepper-label ${state}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
