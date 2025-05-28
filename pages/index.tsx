import { useState } from 'react';
import axios from 'axios';

interface Prediction {
  label: string;
  confidence: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPredictions([]);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('https://ai-backend-580326634097.europe-central2.run.app/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPredictions(response.data.predictions);
    } catch (err) {
      setError('Wystąpił błąd podczas analizy obrazu. Spróbuj ponownie.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      color: '#f3f4f6',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        minWidth: 0,
        background: 'rgba(36,36,40,0.98)',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        padding: 16,
        margin: '0 auto',
        border: '1px solid #27272a',
        boxSizing: 'border-box',
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: 8,
          color: '#a5b4fc',
          letterSpacing: 1
        }}>
          AI Rozpoznawanie Obrazów
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#d1d5db',
          marginBottom: 24,
          fontSize: 15,
        }}>
          Wgraj zdjęcie, a sztuczna inteligencja rozpozna, co się na nim znajduje i przetłumaczy wynik na język polski.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ marginBottom: 12, color: '#f3f4f6', background: '#18181b', border: '1px solid #27272a', borderRadius: 6, padding: 6 }}
          />
          {preview && (
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <img src={preview} alt="Podgląd" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #27272a', background: '#18181b', display: 'block', margin: '0 auto' }} />
              <br />
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setPreview(null); setPredictions([]); }}
                style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginTop: 4 }}
              >Usuń zdjęcie</button>
            </div>
          )}
          <button
            type="submit"
            disabled={!selectedFile || loading}
            style={{
              padding: '12px 0',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 18,
              background: !selectedFile || loading ? '#27272a' : 'linear-gradient(90deg, #6366f1, #a21caf)',
              color: !selectedFile || loading ? '#a1a1aa' : '#fff',
              cursor: !selectedFile || loading ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'background 0.2s',
              boxShadow: !selectedFile || loading ? 'none' : '0 2px 8px #312e81'
            }}
          >
            {loading ? 'Analizuję obraz...' : 'Analizuj obraz'}
          </button>
        </form>
        {error && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: '#7f1d1d',
            color: '#fee2e2',
            borderRadius: 8,
            textAlign: 'center',
            border: '1px solid #b91c1c'
          }}>
            {error}
          </div>
        )}
        {predictions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#a5b4fc', textAlign: 'center', marginBottom: 12 }}>Wyniki analizy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {predictions.map((prediction, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'linear-gradient(90deg, #27272a, #18181b)',
                  borderRadius: 8,
                  padding: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  border: '1px solid #27272a'
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: '#6366f1',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16
                  }}>{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#f3f4f6' }}>{prediction.label}</div>
                    <div style={{ fontSize: 13, color: '#a1a1aa' }}>Pewność: <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{(prediction.confidence * 100).toFixed(2)}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center', color: '#71717a', fontSize: 13, marginTop: 32 }}>
        &copy; {new Date().getFullYear()} AI Rozpoznawanie Obrazów
      </div>
    </div>
  );
}