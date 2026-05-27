export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, cnpj, pagina = 1, tamanhoPagina = 50 } = req.query;

  const urls = {
    contratos: `https://pncp.gov.br/api/pncp/v1/contratos?cnpjFornecedor=${cnpj}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`,
    compras: `https://pncp.gov.br/api/pncp/v1/compras?cnpjParticipante=${cnpj}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`,
  };

  const url = urls[endpoint];
  if (!url) {
    return res.status(400).json({ error: 'Endpoint inválido. Use: contratos ou compras' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: `PNCP retornou ${response.status}`, body: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Resposta inválida do PNCP', body: text });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar PNCP', message: err.message });
  }
}
