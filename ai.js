const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').json(body);
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (c.type === 'output_text' && typeof c.text === 'string') chunks.push(c.text);
    }
  }
  return chunks.join('\n');
}

function stripFences(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });
  if (!process.env.OPENAI_API_KEY) return json(res, 500, { error: 'OPENAI_API_KEY não configurada na Vercel.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action = 'analyze', profile, job } = body;
    if (!profile || !job?.description) return json(res, 400, { error: 'Envie profile e job.description.' });

    const system = `Você é um especialista em recrutamento, ATS e preparação de candidaturas no Brasil.\n\nREGRAS OBRIGATÓRIAS:\n- Use somente fatos presentes no perfil fornecido.\n- Nunca invente experiência, certificação, resultado, ferramenta, nível ou projeto.\n- Não transforme conhecimento básico em avançado.\n- Se um requisito não puder ser comprovado pelo perfil, coloque em gaps/unverified_requirements.\n- Não recomende vagas acima das regras de senioridade do perfil.\n- A candidatura final exige aprovação humana.\n- Escreva em português do Brasil, de forma profissional, objetiva e natural.\n- Para materiais de candidatura, adapte palavras-chave reais da vaga sem copiar frases de modo artificial.\n\nRetorne SOMENTE JSON válido, sem markdown.`;

    let task;
    if (action === 'tailor') {
      task = `Crie materiais para esta vaga com base no perfil. Retorne: {"match_score":0,"match_summary":"","keywords_used":[],"gaps":[],"red_flags":[],"introduction_note":"","cover_note":"","tailored_resume_summary":"","suggested_answers":[]}.\n\nPERFIL:\n${JSON.stringify(profile)}\n\nVAGA:\n${JSON.stringify(job)}`;
    } else {
      task = `Analise a compatibilidade da vaga com o perfil. Retorne: {"match_score":0,"match_level":"","match_summary":"","matched_keywords":[],"missing_keywords":[],"gaps":[],"unverified_requirements":[],"red_flags":[],"recommended":true,"reason":"","next_step":""}.\n\nPERFIL:\n${JSON.stringify(profile)}\n\nVAGA:\n${JSON.stringify(job)}`;
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, instructions: system, input: task, max_output_tokens: 2500 })
    });

    const data = await response.json();
    if (!response.ok) return json(res, response.status, { error: data?.error?.message || 'Erro na OpenAI.' });
    const text = stripFences(extractOutputText(data));
    let result;
    try { result = JSON.parse(text); } catch { return json(res, 502, { error: 'A IA retornou conteúdo que não pôde ser convertido em JSON.', raw: text }); }
    return json(res, 200, { ok: true, model: MODEL, result });
  } catch (err) {
    return json(res, 500, { error: err?.message || 'Erro interno.' });
  }
}
