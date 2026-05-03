import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function ResolutionReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/incident/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to load incident (${response.status})`);
      }
      const data = await response.json();
      setIncident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!resolutionSummary.trim()) {
      setError('Please enter a resolution summary before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: Number(id),
          final_admin_report: resolutionSummary.trim(),
          status: 'resolved',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit resolution (${response.status})`);
      }

      setSuccess('Resolution saved and incident state updated.');
      await fetchIncident();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const severity = incident?.final_severity || incident?.initial_severity || 'Medium';

  if (loading) {
    return (
      <main className="flex-1 pt-8 p-6 md:p-8 xl:p-10 max-w-7xl mx-auto w-full font-sans">
        <div className="text-[#bec9c2] text-center py-10">Loading incident...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-8 p-6 md:p-8 xl:p-10 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="mb-8 border-b border-[#323633] pb-4 flex justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[#ffb4ab] bg-[#ffb4ab]/10 px-2 py-0.5 rounded-sm font-mono text-[11px] uppercase tracking-wider border border-[#ffb4ab]/20">
              {severity}
            </span>
            <span className="text-[#bec9c2] font-mono text-[11px] uppercase tracking-wider">INC-{incident?.id || id}</span>
          </div>
          <h1 className="text-4xl font-bold text-[#e0e3df]">Incident Resolution Report</h1>
          <p className="text-[#bec9c2] text-sm mt-2">{incident?.description || 'No incident description available.'}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-[#a6f2cf]/10 border border-[#a6f2cf]/30 text-[#a6f2cf] rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Form Grid */}
      <form className="grid grid-cols-1 lg:grid-cols-12 gap-6" onSubmit={handleSubmit}>
        {/* Left Column: Primary Inputs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Resolution Summary */}
          <div className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)]">
            <div className="flex items-center gap-2 border-b border-[#323633] pb-2 mb-4">
              <span className="material-symbols-outlined text-[#bec9c2]">build_circle</span>
              <h2 className="text-xl font-semibold text-[#e0e3df]">Resolution Summary</h2>
            </div>
            <p className="text-sm text-[#bec9c2] mb-4">Outline the definitive actions taken to neutralize the threat and restore normal operations.</p>
            <textarea 
              className="w-full h-32 bg-[#272b28] border border-[#3f4943] focus:border-[#a6f2cf] focus:ring-1 focus:ring-[#a6f2cf] rounded-lg p-4 text-[#e0e3df] font-mono text-[14px] resize-y outline-none transition-all duration-200" 
              placeholder="Summarize resolution actions..."
              value={resolutionSummary}
              onChange={(event) => setResolutionSummary(event.target.value)}
            ></textarea>
          </div>

        </div>

        {/* Right Column: Meta & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#1c201e]/70 backdrop-blur-[16px] border border-[#3f4943]/50 rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)]">
            <h3 className="text-lg font-semibold text-[#e0e3df] mb-4">Current Incident Snapshot</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[#bec9c2] uppercase tracking-wider font-mono text-[11px]">Reporter</div>
                <div className="text-[#e0e3df]">{incident?.source_name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-[#bec9c2] uppercase tracking-wider font-mono text-[11px]">Device IP</div>
                <div className="text-[#e0e3df] font-mono">{incident?.device_ip || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[#bec9c2] uppercase tracking-wider font-mono text-[11px]">Final Severity</div>
                <div className="text-[#e0e3df]">{incident?.final_severity || incident?.initial_severity || 'Medium'}</div>
              </div>
            </div>
          </div>

          {/* Final Status & Submission */}
          <div className="bg-[rgba(10,30,51,0.7)] backdrop-blur-[16px] border border-[rgba(137,147,140,0.1)] rounded-xl p-6 shadow-[0_24px_48px_-12px_rgba(2,8,16,0.8)] mt-auto">
            <button
              className="w-full bg-[#A7F3D0] hover:bg-[#8bd6b4] text-[#051424] text-xl font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Submit'}
            </button>
            <p className="text-sm text-[#bec9c2] mt-2 text-center">This action will append to the immutable audit log.</p>
            <button
              className="w-full mt-3 bg-[#323633] text-[#e0e3df] text-sm font-semibold py-3 px-6 rounded-lg border border-[#3f4943] hover:bg-[#3f4943] transition-colors"
              type="button"
              onClick={() => navigate('/admin/compliance')}
            >
              Back to Compliance Vault
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
