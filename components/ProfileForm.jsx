'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Upload, Sparkles, Mail, Save, X, CheckCircle, AlertCircle, Eye, EyeOff, File, RotateCcw } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.csv'];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ProfileForm({ dark }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tailoring, setTailoring] = useState(false);
  const [letterGen, setLetterGen] = useState(false);
  const [tailoredResult, setTailoredResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [showParsedPreview, setShowParsedPreview] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id, resumeText: JSON.stringify(profile), action: 'update' }),
      });
      setMessage('Profile saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const validateFile = useCallback((file) => {
    setUploadError('');
    if (!file) return false;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setUploadError(`Invalid file type "${ext}". Supported: PDF, DOCX, DOC, TXT, CSV`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File too large (${formatFileSize(file.size)}). Maximum size is 5MB.`);
      return false;
    }
    return true;
  }, []);

  const processFile = useCallback(async (file) => {
    if (!validateFile(file)) return;
    if (!profile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString(),
    });

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profile._id);
      formData.append('autoUpdate', 'true');

      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        setProfile(data.data);
        setParsedPreview(data.data);
        setUploadHistory(prev => [{
          name: file.name,
          size: file.size,
          pages: data.data.pages,
          skills: data.data.skills?.length || 0,
          timestamp: new Date().toLocaleString(),
        }, ...prev].slice(0, 5));
        setMessage(`Resume parsed successfully — ${data.data.pages || '?'} pages, ${data.data.skills?.length || 0} skills detected`);
        setTimeout(() => setMessage(''), 5000);
      } else {
        setUploadError(data.error || 'Upload failed');
        setUploadedFile(null);
      }
    } catch (e) {
      clearInterval(progressInterval);
      setUploadError('Network error — please check your connection and try again');
      setUploadedFile(null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [profile, validateFile]);

  const handleFileUpload = (e) => {
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

  const handleTailor = async (opportunity) => {
    setTailoring(true);
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id, action: 'tailor', opportunity }),
      });
      const data = await res.json();
      if (data.success) setTailoredResult(data.data);
    } catch (e) {
      console.error('Tailoring failed:', e);
    } finally {
      setTailoring(false);
    }
  };

  const handleCoverLetter = async (opportunity) => {
    setLetterGen(true);
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile._id, action: 'cover-letter', opportunity }),
      });
      const data = await res.json();
      if (data.success) setCoverLetter(data.data.coverLetter);
    } catch (e) {
      console.error('Cover letter generation failed:', e);
    } finally {
      setLetterGen(false);
    }
  };

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="text-center py-12 text-neutral-600 text-xs font-mono">Loading profile...</div>;
  if (!profile) return <div className="text-center py-12 text-neutral-600 text-xs font-mono">Profile not found</div>;

  const inputClass = `w-full px-4 py-2 text-sm rounded border transition-colors outline-none ${dark ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-500' : 'bg-neutral-50 border-neutral-200 text-[#0A0A0B] focus:border-blue-600'}`;
  const labelClass = 'text-xs font-mono uppercase font-bold text-neutral-400 block mb-2';

  return (
    <div className={`border rounded-lg p-8 transition-colors ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold tracking-tight">Universal Apply Dossier</h2>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono font-bold transition-all ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
      <p className="text-xs text-neutral-400 mb-8">This information supplies all auto-apply fields globally. Keep it structured and updated.</p>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-sm font-mono flex items-center gap-2 ${message.includes('Failed') || message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {message.includes('Failed') || message.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      {uploadError && (
        <div className="mb-4 px-4 py-2 rounded text-sm font-mono bg-red-500/10 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {uploadError}
          <button onClick={() => setUploadError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Applicant Full Name</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={profile.firstName || ''} onChange={(e) => updateField('firstName', e.target.value)} className={inputClass} placeholder="First Name" />
              <input value={profile.lastName || ''} onChange={(e) => updateField('lastName', e.target.value)} className={inputClass} placeholder="Last Name" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input value={profile.email || ''} onChange={(e) => updateField('email', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Phone</label>
            <input value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nationality</label>
            <input value={profile.nationality || ''} onChange={(e) => updateField('nationality', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Technical Core Stack</label>
          <input value={profile.coreStack || ''} onChange={(e) => updateField('coreStack', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Personal Biography / AI Prompt Guidance</label>
          <textarea rows={4} value={profile.bio || ''} onChange={(e) => updateField('bio', e.target.value)}
            className={`${inputClass} font-mono`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className={`p-4 rounded border ${dark ? 'border-neutral-900 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50'}`}>
            <h4 className="text-xs font-bold font-mono mb-2">Academic Credentials</h4>
            <div className="space-y-2">
              <input value={profile.gpa || ''} onChange={(e) => updateField('gpa', e.target.value)} className={`${inputClass} text-xs`} placeholder="GPA" />
              <input value={profile.ielts || ''} onChange={(e) => updateField('ielts', e.target.value)} className={`${inputClass} text-xs`} placeholder="IELTS Score" />
            </div>
          </div>
          <div className={`p-4 rounded border ${dark ? 'border-neutral-900 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50'}`}>
            <h4 className="text-xs font-bold font-mono mb-2">Migration Documents</h4>
            <input value={profile.passportNumber || ''} onChange={(e) => updateField('passportNumber', e.target.value)} className={`${inputClass} text-xs`} placeholder="Passport Number" />
          </div>
          <div className={`p-4 rounded border ${dark ? 'border-neutral-900 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50'}`}>
            <h4 className="text-xs font-bold font-mono mb-2">CV Master Draft</h4>
            <input type="file" ref={fileRef} accept=".pdf,.docx,.doc,.txt,.csv" onChange={handleFileUpload} className="hidden" />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                uploading ? 'pointer-events-none opacity-60' : ''
              } ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : uploadedFile
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : dark
                      ? 'border-neutral-700 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                      : 'border-neutral-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {uploading ? (
                <div className="space-y-2">
                  <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-xs font-mono text-cyan-400">Parsing resume...</p>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">{uploadProgress}%</p>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-1">
                  <File className="w-5 h-5 mx-auto text-emerald-400" />
                  <p className="text-xs font-mono text-emerald-400 font-bold truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-neutral-500">{formatFileSize(uploadedFile.size)}</p>
                  <p className="text-[10px] text-neutral-600">Click or drop to replace</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-neutral-500" />
                  <p className="text-xs font-medium">Upload PDF Resume</p>
                  <p className="text-[10px] text-neutral-500">Max 5MB</p>
                </div>
              )}
            </div>

            {parsedPreview && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowParsedPreview(!showParsedPreview); }}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono text-neutral-400 hover:text-cyan-400 transition-colors"
              >
                {showParsedPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showParsedPreview ? 'Hide' : 'Show'} parsed data
              </button>
            )}
          </div>
        </div>

        {showParsedPreview && parsedPreview && (
          <div className={`p-4 rounded border ${dark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-cyan-200 bg-cyan-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold font-mono text-cyan-400">Parsed Resume Data</h4>
              <button onClick={() => setShowParsedPreview(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div><span className="text-neutral-500">Name:</span> {parsedPreview.firstName} {parsedPreview.lastName}</div>
              <div><span className="text-neutral-500">Email:</span> {parsedPreview.email}</div>
              <div><span className="text-neutral-500">Phone:</span> {parsedPreview.phone}</div>
              <div><span className="text-neutral-500">Pages:</span> {parsedPreview.pages}</div>
              <div className="col-span-2"><span className="text-neutral-500">Skills:</span> {parsedPreview.skills?.join(', ') || 'None detected'}</div>
              <div className="col-span-2"><span className="text-neutral-500">Education:</span> {parsedPreview.education?.join('; ') || 'None detected'}</div>
              <div className="col-span-2"><span className="text-neutral-500">Experience:</span> {parsedPreview.experience?.join('; ') || 'None detected'}</div>
            </div>
          </div>
        )}

        {uploadHistory.length > 0 && (
          <div className={`p-3 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/30' : 'border-neutral-200 bg-neutral-50'}`}>
            <h4 className="text-[10px] font-bold font-mono text-neutral-500 mb-2 uppercase">Recent Uploads</h4>
            <div className="space-y-1.5">
              {uploadHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span>{item.pages}p, {item.skills} skills</span>
                  <span>{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900">
          <h4 className="text-xs font-bold font-mono text-neutral-400 mb-3">AI-Powered Tools</h4>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleTailor({ title: 'Sample Position', institution: 'Sample Org', type: 'Job', country: 'Global' })}
              disabled={tailoring}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold border transition-colors ${dark ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10' : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'}`}>
              <Sparkles className="w-3.5 h-3.5" /> {tailoring ? 'Tailoring...' : 'Tailor Resume'}
            </button>
            <button onClick={() => handleCoverLetter({ title: 'Sample Position', institution: 'Sample Org' })}
              disabled={letterGen}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold border transition-colors ${dark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'}`}>
              <Mail className="w-3.5 h-3.5" /> {letterGen ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>
        </div>

        {tailoredResult && (
          <div className={`p-4 rounded border ${dark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
            <h4 className="text-xs font-bold font-mono text-indigo-400 mb-2">Tailored Resume Summary</h4>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{tailoredResult.summary}</p>
          </div>
        )}

        {coverLetter && (
          <div className={`p-4 rounded border ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
            <h4 className="text-xs font-bold font-mono text-emerald-400 mb-2">Generated Cover Letter</h4>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{coverLetter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
