const ALLOWED = [
  'linkedin.com', 'indeed.com', 'gupy.io', 'vagas.com.br',
  'catho.com.br', 'infojobs.com.br', 'glassdoor.com.br'
];

function allowedHost(hostname) {
  const h = hostname.toLowerCase();
  return ALLOWED.some(d => h === d || h.endsWith('.' + d));
}
function clean(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function meta(html, name) {
  const r = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return html.match(r)?.[1] || '';
}
function title(html) { return (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim(); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const { url } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol) || !allowedHost(u.hostname)) {
      return res.status(400).json({ error: 'Domínio não permitido. Cole também a descrição da vaga manualmente.' });
    }
    const r = await fetch(u.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 PedroJobAgent/5.0' }, redirect: 'follow' });
    const html = await r.text();
    const description = meta(html, 'og:description') || meta(html, 'description') || clean(html).slice(0, 12000);
    res.status(200).json({ ok: true, url: u.toString(), title: title(html), description: description.slice(0, 12000) });
  } catch (e) { res.status(400).json({ error: 'Não foi possível importar esta URL. Cole a descrição da vaga manualmente.' }); }
}
