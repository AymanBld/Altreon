import { useState } from 'react';

export default function ReporterWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [passwordEntered, setPasswordEntered] = useState(null);
  const [extraDetails, setExtraDetails] = useState('');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Simulate completion or go to further steps if there were any
      onComplete?.();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 bg-[#f7faf6] overflow-y-auto">
      <main className="w-full max-w-[720px] flex flex-col gap-8 my-auto">
        <header className="flex justify-center items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#1b6b4f]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <span className="text-3xl font-bold text-[#181c1a]">CyberBase</span>
        </header>

        {step === 1 && (
          <div className="bg-[#f7faf6]/80 backdrop-blur-2xl border border-[#bec9c2]/30 rounded-[32px] shadow-[0_16px_48px_rgba(27,107,79,0.08)] p-6 sm:p-10 flex flex-col gap-8">
            {/* Progress Indicator */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#3f4943]">Step 1 of 2</span>
                <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#3f4943]">Initial Description</span>
              </div>
              <div className="w-full bg-[#e0e3df] rounded-full h-2 overflow-hidden">
                <div className="bg-[#1b6b4f] w-1/2 h-full rounded-full transition-all duration-500 ease-out"></div>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 text-center mt-4">
              <h1 className="text-4xl font-bold tracking-tight text-[#181c1a]">What's happening in your workspace?</h1>
              <p className="text-base text-[#3f4943]">Describe what you're noticing in your own words. Don't worry about technical terms—just tell us what's different.</p>
            </div>

            {/* Main Content: Text Area */}
            <div className="flex flex-col gap-1">
              <label className="sr-only" htmlFor="incident-description">Incident Description</label>
              <textarea 
                className="w-full bg-white border border-[#bec9c2]/50 shadow-sm rounded-2xl p-6 text-base text-[#181c1a] focus:border-[#1b6b4f] focus:ring-4 focus:ring-[#1b6b4f]/10 focus:outline-none transition-all resize-none placeholder:text-[#3f4943]/50" 
                id="incident-description" 
                name="incident-description" 
                placeholder="e.g., I'm seeing a weird popup, or my files won't open..." 
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Bottom Action */}
            <div className="flex justify-end pt-6 mt-2 border-t border-[#bec9c2]/30">
              <button 
                onClick={handleNext}
                className="bg-[#1b6b4f] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#1b6b4f]/90 transition-colors shadow-lg shadow-[#1b6b4f]/20 flex items-center gap-2" 
                type="button"
              >
                Continue
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/70 backdrop-blur-xl border border-[#e0e3df] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-10 flex flex-col gap-12">
            {/* Progress Indicator */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm font-medium text-[#3f4943]">Step 2 of 2</span>
                <span className="font-mono text-sm font-medium text-[#3f4943]">Incident Context</span>
              </div>
              <div className="w-full bg-[#e0e3df] rounded-full h-2 overflow-hidden">
                <div className="bg-[#1b6b4f] w-full h-full rounded-full transition-all duration-500 ease-out"></div>
              </div>
            </div>

            {/* Question Section */}
            <div className="flex flex-col gap-6 text-center">
              <div className="mx-auto w-16 h-16 bg-[#a7f3d0] flex items-center justify-center rounded-full mb-2">
                <span className="material-symbols-outlined text-[32px] text-[#247156]" style={{ fontVariationSettings: "'FILL' 0" }}>password</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[#181c1a]">Did you enter your password on the site?</h1>
              <p className="text-base text-[#3f4943] max-w-[500px] mx-auto">
                Take a deep breath. It happens. We just need to know so we can secure your account properly.
              </p>
            </div>

            {/* Toggles / Action Selection */}
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => setPasswordEntered(true)}
                className={`flex-1 flex flex-col items-center justify-center p-6 bg-white/50 border ${passwordEntered === true ? 'border-[#1b6b4f] bg-[#a7f3d0]/20 ring-2 ring-[#1b6b4f]' : 'border-[#bec9c2]'} rounded-[24px] hover:border-[#1b6b4f] hover:bg-[#a7f3d0]/20 focus:outline-none focus:ring-2 focus:ring-[#1b6b4f] transition-all duration-200 group shadow-sm`} 
                type="button"
              >
                <span className={`material-symbols-outlined text-[32px] ${passwordEntered === true ? 'text-[#1b6b4f]' : 'text-[#3f4943]'} group-hover:text-[#1b6b4f] mb-2 transition-colors`}>keyboard</span>
                <span className={`text-2xl font-bold ${passwordEntered === true ? 'text-[#1b6b4f]' : 'text-[#181c1a]'} group-hover:text-[#1b6b4f]`}>Yes, I entered it</span>
              </button>
              
              <button 
                onClick={() => setPasswordEntered(false)}
                className={`flex-1 flex flex-col items-center justify-center p-6 bg-white/50 border ${passwordEntered === false ? 'border-[#1b6b4f] bg-[#a7f3d0]/20 ring-2 ring-[#1b6b4f]' : 'border-[#bec9c2]'} rounded-[24px] hover:border-[#1b6b4f] hover:bg-[#a7f3d0]/20 focus:outline-none focus:ring-2 focus:ring-[#1b6b4f] transition-all duration-200 group shadow-sm`} 
                type="button"
              >
                <span className={`material-symbols-outlined text-[32px] ${passwordEntered === false ? 'text-[#1b6b4f]' : 'text-[#3f4943]'} group-hover:text-[#1b6b4f] mb-2 transition-colors`}>ads_click</span>
                <span className={`text-2xl font-bold ${passwordEntered === false ? 'text-[#1b6b4f]' : 'text-[#181c1a]'} group-hover:text-[#1b6b4f]`}>No, I just clicked</span>
              </button>
            </div>

            {/* Optional Details Area */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-sm text-[#3f4943]" htmlFor="extra_details">
                Optional: Add any extra details (e.g., the name of the sender).
              </label>
              <textarea 
                className="w-full bg-white/50 border border-[#bec9c2] rounded-xl p-4 text-base text-[#181c1a] focus:border-[#1b6b4f] focus:ring-2 focus:ring-[#1b6b4f]/50 focus:outline-none transition-all resize-none placeholder:text-[#3f4943]/50 shadow-sm" 
                id="extra_details" 
                name="extra_details" 
                placeholder="I noticed the email was from someone claiming to be HR..." 
                rows="3"
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 mt-2 border-t border-[#e0e3df]">
              <button 
                onClick={handleNext}
                className="bg-[#1b6b4f] text-white font-mono text-sm font-medium px-6 py-3 rounded-full hover:bg-[#1b6b4f]/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50" 
                type="button"
                disabled={passwordEntered === null}
              >
                Submit to IT Securely
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white/70 backdrop-blur-xl border border-[#e0e3df] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-10 flex flex-col gap-8 text-center items-center justify-center">
            <div className="w-24 h-24 bg-[#a7f3d0] flex items-center justify-center rounded-full mb-2">
              <span className="material-symbols-outlined text-[48px] text-[#247156]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-[#181c1a]">Report Submitted Successfully</h1>
              <p className="text-base text-[#3f4943] max-w-[500px] mx-auto">
                Thank you for reporting this. Our security operations team has been notified and is currently reviewing the details.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-[#e0e3df] w-full flex justify-center">
              <button 
                onClick={handleNext}
                className="bg-[#1b6b4f] text-white font-mono text-sm font-medium px-8 py-3 rounded-full hover:bg-[#1b6b4f]/90 transition-colors shadow-sm" 
                type="button"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
