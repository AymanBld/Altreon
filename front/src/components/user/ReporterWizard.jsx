import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function ReporterWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [botReply, setBotReply] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [incidentId, setIncidentId] = useState(null);
  const [finalInstructions, setFinalInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = () => setStep(1);

  const sendChatMessage = async (message, history) => {
    const response = await fetch(`${API_BASE_URL}/employee/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed (${response.status})`);
    }

    const data = await response.json();
    return {
      response: typeof data?.response === 'string' ? data.response : 'Thanks, can you provide more details?',
      choices: Array.isArray(data?.choices) ? data.choices : [],
      is_complete: Boolean(data?.is_complete),
      extracted_data: data?.extracted_data || {},
    };
  };

  const submitFinalReport = async (chatResult, historyWithLatest) => {
    const extractedData = chatResult?.extracted_data || {};
    const payload = {
      source_type: 'user',
      source_name: 'employee',
      device_ip: extractedData.device_ip || 'unknown',
      description: extractedData.description || description.trim(),
      base_severity: 'Medium',
      conversation_log: historyWithLatest,
    };

    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Report submission failed (${response.status})`);
    }

    const data = await response.json();
    setIncidentId(data?.incident_id || null);
  };

  const startChatFlow = async () => {
    const firstMessage = description.trim();
    if (!firstMessage) {
      setError('Please describe what happened before continuing.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const chatResult = await sendChatMessage(firstMessage, []);
      const updatedHistory = [
        { role: 'user', content: firstMessage },
        { role: 'assistant', content: chatResult.response },
      ];

      setConversationHistory(updatedHistory);
      setBotReply(chatResult);
      setQuestionCount(1);

      if (chatResult.is_complete) {
        await submitFinalReport(chatResult, updatedHistory);
        setFinalInstructions(chatResult?.extracted_data?.user_instructions || '');
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err?.message || 'Could not start the AI chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitFollowUpAnswer = async () => {
    const details = extraDetails.trim();
    const answer = selectedChoice || details;

    if (!answer) {
      setError('Choose an option or type your answer before sending.');
      return;
    }

    const composedMessage = selectedChoice && details
      ? `${selectedChoice}. Additional details: ${details}`
      : answer;

    setIsLoading(true);
    setError('');

    try {
      const chatResult = await sendChatMessage(composedMessage, conversationHistory);
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: composedMessage },
        { role: 'assistant', content: chatResult.response },
      ];

      setConversationHistory(updatedHistory);
      setBotReply(chatResult);
      setSelectedChoice('');
      setExtraDetails('');
      setQuestionCount((count) => count + 1);

      if (chatResult.is_complete) {
        await submitFinalReport(chatResult, updatedHistory);
        setFinalInstructions(chatResult?.extracted_data?.user_instructions || '');
        setStep(3);
      }
    } catch (err) {
      setError(err?.message || 'Could not send your answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 bg-[#f7faf6] overflow-y-auto">
      <main className="w-full max-w-[720px] flex flex-col gap-8 my-auto">
        <header className="flex justify-center items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#1b6b4f]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <span className="text-3xl font-bold text-[#181c1a]">Altreon</span>
        </header>

        {step === 0 && (
          <div className="bg-[#f7faf6]/80 backdrop-blur-2xl border border-[#bec9c2]/30 rounded-[32px] shadow-[0_16px_48px_rgba(27,107,79,0.08)] p-6 sm:p-12 flex flex-col gap-10 text-center items-center">
            {/* Hero Icon */}
            <div className="w-24 h-24 bg-[#1b6b4f]/10 flex items-center justify-center rounded-[32px] rotate-3">
              <span className="material-symbols-outlined text-[48px] text-[#1b6b4f] -rotate-3" style={{ fontVariationSettings: "'FILL' 0" }}>verified_user</span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl font-bold tracking-tight text-[#181c1a]">Secure Reporting Hub</h1>
              <p className="text-lg text-[#3f4943] max-w-[540px] mx-auto leading-relaxed">
                Spotted something suspicious? Report it quickly and securely. 
                Our AI-guided assistant will help you document the incident in under 60 seconds.
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-6 w-full flex justify-center">
              <button 
                onClick={handleStart}
                className="group relative w-full sm:w-auto bg-[#1b6b4f] text-white text-lg font-bold px-12 py-4 rounded-full hover:bg-[#1b6b4f]/90 transition-all shadow-[0_12px_24px_rgba(27,107,79,0.25)] flex items-center justify-center gap-3 overflow-hidden" 
                type="button"
              >
                <span className="relative z-10">Start New Report</span>
                <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#247156] to-[#1b6b4f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
            
            <p className="text-xs text-[#3f4943]/60 font-mono uppercase tracking-widest">Powered by Altreon Incident AI</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-[#f7faf6]/80 backdrop-blur-2xl border border-[#bec9c2]/30 rounded-[32px] shadow-[0_16px_48px_rgba(27,107,79,0.08)] p-6 sm:p-10 flex flex-col gap-8">
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
                onClick={startChatFlow}
                className="bg-[#1b6b4f] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#1b6b4f]/90 transition-colors shadow-lg shadow-[#1b6b4f]/20 flex items-center gap-2 disabled:opacity-60" 
                type="button"
                disabled={isLoading}
              >
                {isLoading ? 'Starting AI Chat...' : 'Continue'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {error && (
              <p className="text-sm text-[#9f1d1d] bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/70 backdrop-blur-xl border border-[#e0e3df] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-10 flex flex-col gap-12">
            {/* Question Section */}
            <div className="flex flex-col gap-6 text-center">
              <div className="mx-auto w-16 h-16 bg-[#a7f3d0] flex items-center justify-center rounded-full mb-2">
                <span className="material-symbols-outlined text-[32px] text-[#247156]" style={{ fontVariationSettings: "'FILL' 0" }}>password</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[#181c1a]">{botReply?.response || 'Can you share a bit more context?'}</h1>
              <p className="text-base text-[#3f4943] max-w-[500px] mx-auto">
                Pick one option below or type your own answer. We keep your report structured and secure.
              </p>
            </div>

            {/* Toggles / Action Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(botReply?.choices || []).map((choice) => (
                <button
                  key={choice}
                  onClick={() => setSelectedChoice(choice)}
                  className={`flex flex-col items-center justify-center p-6 bg-white/50 border ${selectedChoice === choice ? 'border-[#1b6b4f] bg-[#a7f3d0]/20 ring-2 ring-[#1b6b4f]' : 'border-[#bec9c2]'} rounded-[24px] hover:border-[#1b6b4f] hover:bg-[#a7f3d0]/20 focus:outline-none focus:ring-2 focus:ring-[#1b6b4f] transition-all duration-200 group shadow-sm text-center`}
                  type="button"
                >
                  <span className={`text-xl font-bold ${selectedChoice === choice ? 'text-[#1b6b4f]' : 'text-[#181c1a]'} group-hover:text-[#1b6b4f]`}>
                    {choice}
                  </span>
                </button>
              ))}
            </div>

            {/* Optional Details Area */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-sm text-[#3f4943]" htmlFor="extra_details">
                Optional: Add extra details or type your own answer.
              </label>
              <textarea 
                className="w-full bg-white/50 border border-[#bec9c2] rounded-xl p-4 text-base text-[#181c1a] focus:border-[#1b6b4f] focus:ring-2 focus:ring-[#1b6b4f]/50 focus:outline-none transition-all resize-none placeholder:text-[#3f4943]/50 shadow-sm" 
                id="extra_details" 
                name="extra_details" 
                placeholder="Type any additional context here..." 
                rows="3"
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 mt-2 border-t border-[#e0e3df]">
              <button 
                onClick={submitFollowUpAnswer}
                className="bg-[#1b6b4f] text-white font-mono text-sm font-medium px-6 py-3 rounded-full hover:bg-[#1b6b4f]/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50" 
                type="button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Answer'}
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>

            {error && (
              <p className="text-sm text-[#9f1d1d] bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3">
                {error}
              </p>
            )}
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
              {incidentId && (
                <p className="text-sm font-mono text-[#1b6b4f]">Incident ID: {incidentId}</p>
              )}
                {finalInstructions && (
                  <div className="mt-4 text-left bg-[#f8faf8] border border-[#dbeee3] rounded-lg p-4">
                    <h3 className="font-semibold text-[#1b6b4f] mb-2">While we review — Immediate steps</h3>
                    <p className="text-sm text-[#2f4f3f] whitespace-pre-wrap">{finalInstructions}</p>
                  </div>
                )}
            </div>
            <div className="pt-6 mt-4 border-t border-[#e0e3df] w-full flex justify-center">
              <button 
                onClick={() => onComplete?.()}
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
