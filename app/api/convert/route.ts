import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

const CHUNK_SIZE = 900;

export async function POST(request: Request) {
  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const { xmlContent } = await request.json();
    
    if (!xmlContent) {
      console.error('No XML content provided');
      return NextResponse.json(
        { error: 'XML content is required' },
        { status: 400 }
      );
    }

    // Processa o XML usando xml2js
    const result = await parseStringPromise(xmlContent);
    
    if (!result?.arrecadacoesXML?.arrecadacoes) {
      console.error('Invalid XML structure:', result);
      return NextResponse.json(
        { error: 'Estrutura XML inválida' },
        { status: 400 }
      );
    }

    const items = result.arrecadacoesXML.arrecadacoes;
    const allLines = items.map((item: any) => {
      // Convert date from "2024-11-01T00:00:00-03:00" to "01/11/2024"
      const rawDate = item.dataPagamento?.[0]?.split('T')?.[0] || '';
      const [year, month, day] = rawDate.split('-');
      const dataPagamento = `${day}/${month}/${year}`;

      const emolumento1 = parseFloat(item.emolumentoDAJE1?.[0] || '0');
      const emolumento2 = parseFloat(item.emolumentoDAJE2?.[0] || '0');
      const valorTotal = (emolumento1 + emolumento2).toFixed(2).replace('.', ',');
      const numDaje = item.numDaje?.[0] || '';
      const codDescricao = item.codDescricaoAto?.[0] || '';
      const descricaoAto = item.descricaoAto?.[0] || '';
      
      // Add two semicolons between valorTotal and numDaje to create empty column
      return `${dataPagamento};R01.001.002;117;${valorTotal};;${numDaje} / ${codDescricao} - ${descricaoAto};PF`;
    });

    // Split into chunks of 900 lines
    const csvChunks = [];
    for (let i = 0; i < allLines.length; i += CHUNK_SIZE) {
      const chunk = allLines.slice(i, i + CHUNK_SIZE);
      csvChunks.push(chunk.join('\n'));
    }

    return NextResponse.json({ csvData: csvChunks });
    
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    return NextResponse.json(
      { error: 'Erro ao processar o arquivo XML. Verifique o formato do arquivo.' },
      { status: 500 }
    );
  }
}
