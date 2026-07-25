'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Globe, Settings, Rocket, CheckCircle, ChevronRight, ChevronLeft, File, X, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 'welcome', title: 'Welcome to AI Career Copilot', icon: Rocket },
  { id: 'upload', title: 'Upload Your Resume', icon: Upload },
  { id: 'countries', title: 'Select Target Countries', icon: Globe },
  { id: 'preferences', title: 'Configure Preferences', icon: Settings },
  { id: 'ready', title: 'You\'re All Set!', icon: CheckCircle },
];

const COUNTRIES = [
  { id: 'DE', name: 'Germany', flag: '🇩🇪' },
  { id: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { id: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { id: 'US', name: 'United States', flag: '🇺🇸' },
  { id: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'CA', name: 'Canada', flag: '🇨🇦' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵' },
  { id: 'SG', name: 'Singapore', flag: '🇸🇬' },
];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function OnboardingWizard({ dark, onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedCountries, setSelectedCountries] = useState(['DE', 'NL', 'CH']);
  const [persona, setPersona] = useState('engineer');
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const toggleCountry = (id) => {
    setSelectedCountries(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const next = () => setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prev = () => setStep(prev => Math.max(prev - 1, 0));

  const validateFile = useCallback((file) => {
    setUploadError('');
    if (!file) return false;
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (ext !== '.pdf') {
      setUploadError(`Invalid file type "${ext}". Only PDF files are accepted.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File too large (${formatFileSize(file.size)}). Maximum size is 5MB.`);
      return false;
    }
    return true;
  }, []);

  const processFile = useCallback(async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadedFile({
      name: file.name,
      size: file.size,
    });

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('autoUpdate', 'true');

      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        setUploaded(true);
        setParsedData(data.data);
      } else {
        setUploadError(data.error || 'Upload failed');
        setUploadedFile(null);
      }
    } catch (e) {
      clearInterval(progressInterval);
      setUploadError('Network error — please try again');
      setUploadedFile(null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [validateFile]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const inputClass = `w-full px-4 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B]'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-[#0A0A0B]' : 'bg-[#F8F9FA]'}`}>
      <div className={`max-w-2xl w-full rounded-xl border p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? 'bg-cyan-500 text-neutral-950' : dark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-200 text-neutral-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-cyan-500' : dark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 0 && (
            <div className="text-center">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
              <h2 className="text-2xl font-bold mb-3">Welcome to AI Career Copilot</h2>
              <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                Your autonomous career assistant. We'll help you discover and apply to scholarships,
                jobs, and work permits worldwide using AI-powered automation.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className={`p-4 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-bold">Scholarships</div>
                  <div className="text-xs text-neutral-500">DAAD, Chevening, Fulbright</div>
                </div>
                <div className={`p-4 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                  <div className="text-2xl mb-2">💼</div>
                  <div className="font-bold">Jobs</div>
                  <div className="text-xs text-neutral-500">LinkedIn, Indeed, Direct</div>
                </div>
                <div className={`p-4 rounded-lg ${dark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                  <div className="text-2xl mb-2">🛂</div>
                  <div className="font-bold">Work Permits</div>
                  <div className="text-xs text-neutral-500">IND, UKVI, USCIS</div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
              <h2 className="text-xl font-bold mb-3">Upload Your Resume</h2>
              <p className="text-neutral-400 mb-6 text-sm">Upload a PDF resume to auto-populate your profile. You can skip this and fill in manually.</p>

              {uploadError && (
                <div className="mb-4 px-4 py-2 rounded text-sm font-mono bg-red-500/10 text-red-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </div>
              )}

              <input type="file" ref={fileRef} accept=".pdf" onChange={handleFileSelect} className="hidden" />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
                  uploading ? 'pointer-events-none opacity-60' : ''
                } ${
                  dragActive
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : uploaded
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : dark
                        ? 'border-neutral-700 hover:border-cyan-500/50'
                        : 'border-neutral-300 hover:border-blue-500'
                }`}
              >
                {uploading ? (
                  <div className="space-y-3">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm font-mono text-cyan-400">Parsing resume...</p>
                    <div className="w-48 mx-auto bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">{uploadProgress}%</p>
                  </div>
                ) : uploaded ? (
                  <div className="space-y-2">
                    <File className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="text-sm font-mono text-emerald-400 font-bold">{uploadedFile?.name}</p>
                    <p className="text-xs text-neutral-500">{formatFileSize(uploadedFile?.size || 0)}</p>
                    {parsedData && (
                      <p className="text-xs text-emerald-400">
                        {parsedData.pages} pages, {parsedData.skills?.length || 0} skills detected
                      </p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploaded(false); setUploadedFile(null); setParsedData(null); }}
                      className="text-xs text-neutral-500 hover:text-neutral-300 underline mt-1"
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-neutral-500" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-neutral-500">PDF files only, max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Select Target Countries</h2>
              <p className="text-neutral-400 mb-6 text-sm">Choose where you want to apply. We'll prioritize opportunities in these countries.</p>
              <div className="grid grid-cols-3 gap-3">
                {COUNTRIES.map(country => (
                  <button key={country.id} onClick={() => toggleCountry(country.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedCountries.includes(country.id)
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : dark ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                    <span className="text-lg">{country.flag}</span>
                    <div className="text-sm font-medium mt-1">{country.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Configure Your Profile</h2>
              <p className="text-neutral-400 mb-6 text-sm">Tell us about yourself so our AI can tailor applications perfectly.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase font-bold text-neutral-400 block mb-2">Primary Role</label>
                  <select value={persona} onChange={(e) => setPersona(e.target.value)} className={inputClass}>
                    <option value="engineer">Software / AI Engineer</option>
                    <option value="researcher">Researcher / Academic</option>
                    <option value="designer">Product Designer</option>
                    <option value="manager">Engineering Manager</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase font-bold text-neutral-400 block mb-2">GPA</label>
                    <input placeholder="3.8" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase font-bold text-neutral-400 block mb-2">IELTS Score</label>
                    <input placeholder="8.0" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-2xl font-bold mb-3">You're All Set!</h2>
              <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                Your AI Career Copilot is configured and ready. You can now:
              </p>
              <div className="grid grid-cols-1 gap-3 text-left max-w-sm mx-auto">
                {['Create your first application campaign', 'Discover new opportunities worldwide', 'Let AI tailor your resume per application'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-900">
          <button onClick={prev} disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              step === 0 ? 'opacity-0 cursor-default' : dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded text-sm transition-colors">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onComplete}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded text-sm transition-colors">
              Launch Copilot
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
