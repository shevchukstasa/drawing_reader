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
      display: 'inline-flex', alignItems: 'center', fontSize: 10,
      fontWeight: 700, padding: '2px 6px', borderRadius: 3,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>{c.label}</span>
  );
}

/* ───────── Field row ───────── */
function FieldRow({ label, field, suffix = '' }) {
  if (!field || field.value === null || field.value === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a2e' }}>
        <span style={{ color: '#6b7280', fontSize: 13 }}>{label}</span>
        <span style={{ color: '#f87171', fontSize: 13, fontStyle: 'italic' }}>не указано</span>
      </div>
    );
  }
  const isObj = typeof field === 'object' && field.confidence;
  const val = isObj ? field.value : (typeof field === 'object' ? field.value : field);
  const conf = isObj ? field.confidence : null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1a1a2e' }}>
      <span style={{ color: '#9ca3af', fontSize: 13, minWidth: 140 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>
          {String(val)}{suffix}
        </span>
        {conf && <ConfidenceBadge level={conf} />}
      </div>
    </div>
  );
}

/* ───────── Position card ───────── */
function PositionCard({ pos, index }) {
  const [expanded, setExpanded] = useState(index < 5); // auto-expand first 5
  const hasQ = pos.questions_for_manager?.length > 0;

  return (
    <div style={{
      background: '#0d0d1a',
      border: hasQ ? '1px solid #92400e' : '1px solid #1e1e3a',
      borderRadius: 8, marginBottom: 12, overflow: 'hidden',
      boxShadow: hasQ ? '0 0 20px rgba(245,158,11,0.08)' : 'none',
    }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', cursor: 'pointer',
        background: hasQ ? 'linear-gradient(135deg,#1a0f00,#0d0d1a)' : 'linear-gradient(135deg,#0f0f2a,#0d0d1a)',
        borderBottom: expanded ? '1px solid #1e1e3a' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6, background: '#1e1e3a',
            color: '#818cf8', fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
          }}>{pos.position_number || index + 1}</span>
          <div>
            <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>
              {pos.zone_or_area || `Позиция ${pos.position_number || index + 1}`}
            </span>
            {pos.product_type?.value && (
              <span style={{ color: '#6366f1', fontSize: 12, marginLeft: 10 }}>
                {pos.product_type.value} · {pos.product_shape?.value || '—'}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasQ && (
            <span style={{ background: '#92400e', color: '#fbbf24', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
              {pos.questions_for_manager.length} вопрос(ов)
            </span>
          )}
          <span style={{ color: '#6b7280', fontSize: 18, transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▾</span>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
            <div>
              <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Для калькулятора</div>
              <FieldRow label="Тип изделия" field={pos.product_type} />
              <FieldRow label="Форма" field={pos.product_shape} />
              <FieldRow label="Длина" field={pos.length_cm} suffix=" см" />
              <FieldRow label="Ширина" field={pos.width_cm} suffix=" см" />
              <FieldRow label="Толщина" field={pos.thickness_cm} suffix=" см" />
              <FieldRow label="Стандартный размер" field={{ value: pos.is_standard_size ? 'Да' : 'Нет (кастом)' }} />
              <FieldRow label="Глазурь (где)" field={pos.glaze_placement} />
              <FieldRow label="Цвет глазури" field={pos.glaze_color} />
              <FieldRow label="Кастомный цвет" field={{ value: pos.is_custom_color ? 'Да ⚠' : 'Нет (из палитры)' }} />
              <FieldRow label="Нанесение" field={pos.application} />
              <FieldRow label="Финишинг" field={pos.finishing} />
            </div>
            <div>
              <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>Количество и доп. информация</div>
              <FieldRow label="Количество (шт)" field={pos.quantity_pcs} />
              <FieldRow label="Площадь (м²)" field={pos.quantity_m2} />
              <FieldRow label="Кол-во цветов" field={{ value: pos.num_glaze_colors || 1 }} />
              <FieldRow label="Кромка" field={{ value: pos.edge_profile || 'не указано' }} />
              <FieldRow label="Вырезы" field={{ value: pos.cutouts || 'нет' }} />
              <FieldRow label="Текстура камня" field={{ value: pos.surface_texture || 'не указано' }} />
              {hasQ && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>⚠ Требуется уточнение</div>
                  {pos.questions_for_manager.map((q, i) => (
                    <div key={i} style={{
                      background: '#1a1200', border: '1px solid #422006',
                      borderRadius: 6, padding: '8px 12px', marginBottom: 6,
                      color: '#fde68a', fontSize: 12, lineHeight: 1.5,
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
    setProgress('Подготовка файла...');

    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Ошибка чтения'));
        r.readAsDataURL(file);
      });

      setProgress(provider === 'anthropic' ? 'Анализ через Claude Sonnet...' : 'Анализ через GPT-4o...');

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
        borderBottom: '1px solid #1e1e3a', padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg,#0f0f2a,#08081a)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff',
          }}>◆</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Drawing Parser</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Lava Stone Spec Extractor</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {result && (
            <div style={{ display: 'flex', gap: 14, fontSize: 12, marginRight: 8 }}>
              <span style={{ color: '#818cf8' }}><b>{result.positions?.length || 0}</b> позиций</span>
              {totalQ > 0 && <span style={{ color: '#fbbf24' }}><b>{totalQ}</b> вопросов</span>}
            </div>
          )}
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #2a2a4a', fontSize: 11, fontWeight: 600 }}>
            <button onClick={() => setProvider('anthropic')} style={{
              padding: '6px 14px', border: 'none', cursor: 'pointer',
              background: provider === 'anthropic' ? '#4f46e5' : '#1e1e3a',
              color: provider === 'anthropic' ? '#fff' : '#6b7280',
            }}>Claude</button>
            <button onClick={() => setProvider('openai')} style={{
              padding: '6px 14px', border: 'none', cursor: 'pointer',
              borderLeft: '1px solid #2a2a4a',
              background: provider === 'openai' ? '#059669' : '#1e1e3a',
              color: provider === 'openai' ? '#fff' : '#6b7280',
            }}>GPT-4o</button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>

        {/* Upload */}
        {!result && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#6366f1' : file ? '#1e40af' : '#2a2a4a'}`,
              borderRadius: 12, padding: file ? '20px' : '48px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(99,102,241,0.05)' : file ? 'rgba(30,64,175,0.05)' : 'transparent',
              transition: 'all 0.2s', marginBottom: 20,
            }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {preview
                  ? <img src={preview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2a4a' }} />
                  : <div style={{ width: 80, height: 80, borderRadius: 8, background: '#1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📄</div>
                }
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>{file.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div style={{ color: '#818cf8', fontSize: 12, marginTop: 4 }}>Нажмите, чтобы заменить</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>📐</div>
                <div style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Перетащите чертёж сюда</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>PDF, JPG, PNG · Чертежи, эскизы, фото</div>
              </>
            )}
          </div>
        )}

        {/* Analyze button */}
        {file && !result && (
          <button onClick={analyze} disabled={loading} style={{
            width: '100%', padding: '14px 24px', borderRadius: 8, border: 'none',
            background: loading ? 'linear-gradient(135deg,#1e1e3a,#2a2a4a)'
              : provider === 'anthropic' ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'linear-gradient(135deg,#047857,#059669)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20,
          }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="spinner" /> {progress}
              </span>
            ) : `🔍 Анализировать через ${provider === 'anthropic' ? 'Claude' : 'GPT-4o'}`}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#1a0505', border: '1px solid #5c1a1a', borderRadius: 8, padding: '14px 20px', marginBottom: 20, color: '#fca5a5', fontSize: 13 }}>
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Project */}
            {result.project && (
              <div style={{ background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>Проект</div>
                    <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{result.project.name || 'Без названия'}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      {result.project.language && <span style={{ color: '#9ca3af', fontSize: 12 }}>Язык: {result.project.language}</span>}
                      <span style={{ color: '#6b7280', fontSize: 12 }}>via {usedProvider === 'anthropic' ? 'Claude Sonnet' : 'GPT-4o'}</span>
                    </div>
                  </div>
                  {result.project.contractor_codes?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: '50%' }}>
                      {result.project.contractor_codes.slice(0, 10).map((c, i) => (
                        <span key={i} style={{ background: '#1e1e3a', color: '#a5b4fc', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{c}</span>
                      ))}
                      {result.project.contractor_codes.length > 10 && <span style={{ color: '#6b7280', fontSize: 10 }}>+{result.project.contractor_codes.length - 10}</span>}
                    </div>
                  )}
                </div>
                {result.project.notes && <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{result.project.notes}</div>}
              </div>
            )}

            {/* Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { v: result.positions?.length || 0, l: 'Позиций', c: '#818cf8' },
                { v: totalQ, l: 'Вопросов', c: totalQ > 0 ? '#fbbf24' : '#4ade80' },
                { v: result.positions?.filter(p => p.is_custom_color).length || 0, l: 'Кастом. цветов', c: '#e5e7eb' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, minWidth: 140, background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
              <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} style={{
                minWidth: 140, background: '#1e1e3a', border: '1px solid #2a2a4a',
                borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
                color: '#818cf8', fontSize: 13, fontWeight: 600, textAlign: 'center',
              }}>📐 Новый чертёж</button>
            </div>

            {/* Warnings */}
            {result.summary?.warnings?.length > 0 && (
              <div style={{ background: '#1a0f00', border: '1px solid #422006', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                {result.summary.warnings.map((w, i) => <div key={i} style={{ color: '#fde68a', fontSize: 12, padding: '2px 0' }}>⚠ {w}</div>)}
              </div>
            )}

            {/* Cards */}
            {result.positions?.map((pos, i) => <PositionCard key={i} pos={pos} index={i} />)}

            {/* Raw JSON */}
            <details style={{ marginTop: 20 }}>
              <summary style={{ color: '#6b7280', fontSize: 12, cursor: 'pointer', padding: '8px 0' }}>Показать JSON</summary>
              <pre style={{ background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: 8, padding: 16, overflow: 'auto', fontSize: 11, color: '#9ca3af', maxHeight: 400 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
