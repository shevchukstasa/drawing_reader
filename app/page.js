'use client';

import { useState, useCallback, useRef } from 'react';

/* ───────── Confidence badge ───────── */
function ConfidenceBadge({ level }) {
  const c = {
    high:   { bg: '#0a2e1a', border: '#1a5c34', text: '#4ade80', label: '✓' },
    medium: { bg: '#2e2a0a', border: '#5c5a1a', text: '#facc15', label: '⚠' },
    low:    { bg: '#2e0a0a', border: '#5c1a1a', text: '#f87171', label: '✕' },
  }[level] || { bg: '#2e0a0a', border: '#5c1a1a', text: '#f87171', label: '?' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 15,
      fontWeight: 700, padding: '3px 10px', borderRadius: 4,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>{c.label}</span>
  );
}

/* ───────── Field row ───────── */
function FieldRow({ label, field, suffix = '' }) {
  if (!field || field.value === null || field.value === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a2e' }}>
        <span style={{ color: '#6b7280', fontSize: 18 }}>{label}</span>
        <span style={{ color: '#f87171', fontSize: 18, fontStyle: 'italic' }}>not specified</span>
      </div>
    );
  }
  const isObj = typeof field === 'object' && field.confidence;
  const val = isObj ? field.value : (typeof field === 'object' ? field.value : field);
  const conf = isObj ? field.confidence : null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a2e' }}>
      <span style={{ color: '#9ca3af', fontSize: 18, minWidth: 180 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 500, textAlign: 'right' }}>
          {String(val)}{suffix}
        </span>
        {conf && <ConfidenceBadge level={conf} />}
      </div>
    </div>
  );
}

/* ───────── Position card ───────── */
function PositionCard({ pos, index }) {
  const [expanded, setExpanded] = useState(index < 5);
  const hasQ = pos.questions_for_manager?.length > 0;

  return (
    <div style={{
      background: '#0d0d1a',
      border: hasQ ? '1px solid #92400e' : '1px solid #1e1e3a',
      borderRadius: 10, marginBottom: 16, overflow: 'hidden',
      boxShadow: hasQ ? '0 0 24px rgba(245,158,11,0.08)' : 'none',
    }}>
      <div onClick={() => setExpanded(!expanded)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', cursor: 'pointer',
        background: hasQ ? 'linear-gradient(135deg,#1a0f00,#0d0d1a)' : 'linear-gradient(135deg,#0f0f2a,#0d0d1a)',
        borderBottom: expanded ? '1px solid #1e1e3a' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 8, background: '#1e1e3a',
            color: '#818cf8', fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
          }}>{pos.position_number || index + 1}</span>
          <div>
            <span style={{ color: '#e5e7eb', fontSize: 20, fontWeight: 600 }}>
              {pos.zone_or_area || `Position ${pos.position_number || index + 1}`}
            </span>
            {pos.product_type?.value && (
              <span style={{ color: '#6366f1', fontSize: 16, marginLeft: 12 }}>
                {pos.product_type.value} · {pos.product_shape?.value || '—'}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasQ && (
            <span style={{ background: '#92400e', color: '#fbbf24', fontSize: 14, fontWeight: 700, padding: '5px 12px', borderRadius: 6 }}>
              {pos.questions_for_manager.length} question(s)
            </span>
          )}
          <span style={{ color: '#6b7280', fontSize: 24, transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
            <div>
              <div style={{ color: '#6366f1', fontSize: 14, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>For Calculator</div>
              <FieldRow label="Product Type" field={pos.product_type} />
              <FieldRow label="Shape" field={pos.product_shape} />
              <FieldRow label="Length" field={pos.length_cm} suffix=" cm" />
              <FieldRow label="Width" field={pos.width_cm} suffix=" cm" />
              <FieldRow label="Thickness" field={pos.thickness_cm} suffix=" cm" />
              <FieldRow label="Standard Size" field={{ value: pos.is_standard_size ? 'Yes' : 'No (custom)' }} />
              <FieldRow label="Glaze Placement" field={pos.glaze_placement} />
              <FieldRow label="Glaze Color" field={pos.glaze_color} />
              <FieldRow label="Custom Color" field={{ value: pos.is_custom_color ? 'Yes ⚠' : 'No (from palette)' }} />
              <FieldRow label="Application" field={pos.application} />
              <FieldRow label="Finishing" field={pos.finishing} />
            </div>
            <div>
              <div style={{ color: '#6366f1', fontSize: 14, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>Quantity & Additional Info</div>
              <FieldRow label="Quantity (pcs)" field={pos.quantity_pcs} />
              <FieldRow label="Area (m²)" field={pos.quantity_m2} />
              <FieldRow label="Glaze Colors" field={{ value: pos.num_glaze_colors || 1 }} />
              <FieldRow label="Edge Profile" field={{ value: pos.edge_profile || 'not specified' }} />
              <FieldRow label="Cutouts" field={{ value: pos.cutouts || 'none' }} />
              <FieldRow label="Stone Texture" field={{ value: pos.surface_texture || 'not specified' }} />
              {hasQ && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ color: '#fbbf24', fontSize: 14, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>⚠ Clarification Needed</div>
                  {pos.questions_for_manager.map((q, i) => (
                    <div key={i} style={{
                      background: '#1a1200', border: '1px solid #422006',
                      borderRadius: 8, padding: '12px 16px', marginBottom: 8,
                      color: '#fde68a', fontSize: 16, lineHeight: 1.6,
                    }}>{q}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Main app ───────── */
export default function Home() {
  const [provider, setProvider] = useState('anthropic');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [usedProvider, setUsedProvider] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f); setResult(null); setError(null);
    if (f.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = (e) => setPreview(e.target.result);
      r.readAsDataURL(f);
    } else { setPreview(null); }
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    setProgress('Preparing file...');

    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('File read error'));
        r.readAsDataURL(file);
      });

      setProgress(provider === 'anthropic' ? 'Analyzing with Claude Sonnet...' : 'Analyzing with GPT-4o...');

      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: file.type, provider }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Server error ${resp.status}`);

      setResult(data.result);
      setUsedProvider(data.provider);
      setProgress('');
    } catch (err) {
      setError(err.message);
      setProgress('');
    } finally { setLoading(false); }
  };

  const totalQ = result?.positions?.reduce((s, p) => s + (p.questions_for_manager?.length || 0), 0) || 0;

  return (
    <div style={{
      minHeight: '100vh', background: '#08081a', color: '#e5e7eb',
      fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        borderBottom: '1px solid #1e1e3a', padding: '18px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg,#0f0f2a,#08081a)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, color: '#fff',
          }}>◆</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Drawing Reader</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Lava Stone Spec Extractor</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {result && (
            <div style={{ display: 'flex', gap: 16, fontSize: 16, marginRight: 10 }}>
              <span style={{ color: '#818cf8' }}><b>{result.positions?.length || 0}</b> positions</span>
              {totalQ > 0 && <span style={{ color: '#fbbf24' }}><b>{totalQ}</b> questions</span>}
            </div>
          )}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a4a', fontSize: 15, fontWeight: 600 }}>
            <button onClick={() => setProvider('anthropic')} style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              background: provider === 'anthropic' ? '#4f46e5' : '#1e1e3a',
              color: provider === 'anthropic' ? '#fff' : '#6b7280',
            }}>Claude</button>
            <button onClick={() => setProvider('openai')} style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              borderLeft: '1px solid #2a2a4a',
              background: provider === 'openai' ? '#059669' : '#1e1e3a',
              color: provider === 'openai' ? '#fff' : '#6b7280',
            }}>GPT-4o</button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 36px' }}>

        {/* Upload area */}
        {!result && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#6366f1' : file ? '#1e40af' : '#2a2a4a'}`,
                borderRadius: 14, padding: file ? '24px' : '60px',
                textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(99,102,241,0.05)' : file ? 'rgba(30,64,175,0.05)' : 'transparent',
                transition: 'all 0.2s', marginBottom: 20,
              }}
            >
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {preview
                    ? <img src={preview} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid #2a2a4a' }} />
                    : <div style={{ width: 100, height: 100, borderRadius: 10, background: '#1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📄</div>
                  }
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#e5e7eb', fontSize: 20, fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 16, marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div style={{ color: '#818cf8', fontSize: 16, marginTop: 6 }}>Click to replace</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>📐</div>
                  <div style={{ color: '#e5e7eb', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Drag & drop your drawing here</div>
                  <div style={{ color: '#6b7280', fontSize: 17 }}>PDF, JPG, PNG · Blueprints, sketches, photos</div>
                </>
              )}
            </div>

            {/* Upload button */}
            {!file && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ color: '#6b7280', fontSize: 17 }}>or</span>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: '14px 32px', borderRadius: 10,
                      border: '1px solid #2a2a4a', background: '#1e1e3a',
                      color: '#818cf8', fontSize: 18, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.background = '#2a2a4a'; e.target.style.borderColor = '#6366f1'; }}
                    onMouseLeave={e => { e.target.style.background = '#1e1e3a'; e.target.style.borderColor = '#2a2a4a'; }}
                  >
                    📁 Upload File
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Analyze button */}
        {file && !result && (
          <button onClick={analyze} disabled={loading} style={{
            width: '100%', padding: '18px 28px', borderRadius: 10, border: 'none',
            background: loading ? 'linear-gradient(135deg,#1e1e3a,#2a2a4a)'
              : provider === 'anthropic' ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'linear-gradient(135deg,#047857,#059669)',
            color: '#fff', fontSize: 20, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 24,
          }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span className="spinner" /> {progress}
              </span>
            ) : `🔍 Analyze with ${provider === 'anthropic' ? 'Claude' : 'GPT-4o'}`}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#1a0505', border: '1px solid #5c1a1a', borderRadius: 10, padding: '18px 24px', marginBottom: 24, color: '#fca5a5', fontSize: 17 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {result.project && (
              <div style={{ background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#6366f1', fontSize: 14, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Project</div>
                    <div style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{result.project.name || 'Untitled'}</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                      {result.project.language && <span style={{ color: '#9ca3af', fontSize: 16 }}>Language: {result.project.language}</span>}
                      <span style={{ color: '#6b7280', fontSize: 16 }}>via {usedProvider === 'anthropic' ? 'Claude Sonnet' : 'GPT-4o'}</span>
                    </div>
                  </div>
                  {result.project.contractor_codes?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', maxWidth: '50%' }}>
                      {result.project.contractor_codes.slice(0, 10).map((c, i) => (
                        <span key={i} style={{ background: '#1e1e3a', color: '#a5b4fc', fontSize: 13, padding: '4px 10px', borderRadius: 5, fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
                      ))}
                      {result.project.contractor_codes.length > 10 && <span style={{ color: '#6b7280', fontSize: 13 }}>+{result.project.contractor_codes.length - 10}</span>}
                    </div>
                  )}
                </div>
                {result.project.notes && <div style={{ color: '#9ca3af', fontSize: 16, marginTop: 10, lineHeight: 1.6 }}>{result.project.notes}</div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { v: result.positions?.length || 0, l: 'Positions', c: '#818cf8' },
                { v: totalQ, l: 'Questions', c: totalQ > 0 ? '#fbbf24' : '#4ade80' },
                { v: result.positions?.filter(p => p.is_custom_color).length || 0, l: 'Custom Colors', c: '#e5e7eb' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, minWidth: 160, background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 10, padding: '18px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
                  <div style={{ fontSize: 15, color: '#6b7280', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
              <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} style={{
                minWidth: 160, background: '#1e1e3a', border: '1px solid #2a2a4a',
                borderRadius: 10, padding: '18px 20px', cursor: 'pointer',
                color: '#818cf8', fontSize: 17, fontWeight: 600, textAlign: 'center',
              }}>📐 New Drawing</button>
            </div>

            {result.summary?.warnings?.length > 0 && (
              <div style={{ background: '#1a0f00', border: '1px solid #422006', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                {result.summary.warnings.map((w, i) => <div key={i} style={{ color: '#fde68a', fontSize: 16, padding: '3px 0' }}>⚠ {w}</div>)}
              </div>
            )}

            {result.positions?.map((pos, i) => <PositionCard key={i} pos={pos} index={i} />)}

            <details style={{ marginTop: 24 }}>
              <summary style={{ color: '#6b7280', fontSize: 16, cursor: 'pointer', padding: '10px 0' }}>Show JSON Response</summary>
              <pre style={{ background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 10, padding: 20, overflow: 'auto', fontSize: 14, color: '#9ca3af', maxHeight: 500 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
