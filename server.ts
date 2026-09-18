import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client server-side
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 2. Gemini Design Workflow Assistant endpoint
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { action, title, brief, category, requester, taskType, feedback } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in secrets.',
        message: 'Kunci API Gemini belum tersedia.'
      });
    }

    let prompt = '';

    if (action === 'enhance_brief') {
      prompt = `Anda adalah Creative Director & Design System Specialist di studio desain "AT Digital Studio".
Tugas Anda adalah menyempurnakan dan menstrukturkan Creative Brief berikut agar desainer grafis dan tim konten dapat mengeksekusi dengan standar agency kelas dunia.
Gunakan Bahasa Indonesia yang profesional, ringkas, dan jelas (sertakan istilah teknis desain bila relevan).

Data Tugas:
- Judul Tugas: ${title || 'Creative Task'}
- Kategori: ${category || 'Graphic Design / Content'}
- Tipe Task: ${taskType || 'Creative Asset'}
- Requester: ${requester || 'Klien / Management'}
- Brief / Catatan Awal: ${brief || 'Belum ada detail instruksi'}

Susun brief yang rapi dengan format:
1. 🎯 Objektif & Output yang Diharapkan
2. 👥 Target Audience & Mood Visual (Tone of Voice)
3. 📐 Rekomendasi Dimensi & Format Spesifikasi (contoh: 1080x1350 Feed IG, 1080x1920 Story, Vector SVG, PDF Print CMYK 300dpi, dll)
4. 🔑 Komponen Kunci (Headline, Body Copy, Logo, Call-To-Action)
5. ⚠️ Do's & Don'ts (Hal wajib & pantangan desain)`;
    } else if (action === 'generate_checklist') {
      prompt = `Anda adalah Creative Project Manager di studio desain digital.
Buat 4 sampai 6 langkah subtasks/checklist pengerjaan praktis untuk tugas desain ini:
- Judul: ${title || 'Creative Task'}
- Kategori: ${category || 'Design'}
- Tipe Task: ${taskType || 'Asset'}
- Brief Singkat: ${brief || 'Standar studio workflow'}

Kembalikan respon dalam format JSON murni berupa array string tanpa backticks dan tanpa markdown:
["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4", "Langkah 5"]`;
    } else if (action === 'generate_feedback') {
      prompt = `Anda adalah Art Director senior di AT Digital Studio.
Tinjau progres tugas desain ini dan berikan feedback review yang konstruktif, edukatif, dan actionable:
- Judul Desain: ${title}
- Brief Awal: ${brief}
- Catatan Review Saat Ini: ${feedback || 'Pengecekan kualitas sebelum rilis'}

Format feedback:
1. ✨ Apresiasi & Elemen yang sudah tepat
2. 🔍 Poin Perbaikan Kritis (Hierarchy visual, tipografi, warna/kontras, layout spacing)
3. 🚀 Checklist Revisi Konkret sebelum approval final.`;
    } else if (action === 'generate_palette_and_specs') {
      prompt = `Anda adalah Brand Strategist & Visual Designer di AT Digital Studio.
Untuk tugas desain:
- Judul: ${title || 'Creative Task'}
- Kategori: ${category || 'Design'}
- Tipe Task: ${taskType || 'Asset'}
- Brief: ${brief || 'Modern aesthetic'}

Berikan panduan visual praktis dan inspiratif:
1. 🎨 Palet Warna Rekomendasi (4-5 warna dengan Hex Code & kesan mood)
2. 🔤 Font Pairing (Display/Headline font + Body font yang serasi)
3. 📐 Format & Dimensi Standar Industri untuk jenis karya ini
4. 💡 Visual Hook Idea (1-2 ide eksekusi konsep kreatif)`;
    } else {
      prompt = `Berikan saran singkat dan inspirasi visual untuk tugas desain "${title}". Kategori: ${category}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    let rawText = response.text || '';

    if (action === 'generate_checklist') {
      try {
        // Clean markdown code fence if model wrapped JSON
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return res.json({ checklist: parsed });
        }
      } catch (parseErr) {
        // Fallback: split by lines
        const lines = rawText
          .split('\n')
          .map(l => l.replace(/^[-*0-9.)\s]+/, '').trim())
          .filter(l => l.length > 2);
        return res.json({ checklist: lines });
      }
    }

    res.json({ text: rawText });
  } catch (err: any) {
    console.error('Error in /api/gemini/assist:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI creative assistant request.' });
  }
});

// Vite middleware & Static asset serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AT - Task System Control Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
