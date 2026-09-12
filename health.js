export default async function handler(req, res) {
  res.status(200).json({ ok: true, service: 'pedro-job-agent-v5', time: new Date().toISOString() });
}
