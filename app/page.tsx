'use client';

import { useState } from 'react';
import { DataGrid, GridToolbar, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Paper, Button } from '@mui/material';
import FileUpload from './components/FileUpload';

interface GridRowData {
  id: number;
  data: string;
  codigo: string;
  num: string;
  valor: string;
  descricao: string;
  tipo: string;
}

export default function Home() {
  const [csvData, setCsvData] = useState<string[]>([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const parseCSV = (data: string[]): GridRowData[][] => {
    return data.map((chunk) =>
      chunk
        .split('\n')
        .filter(Boolean)
        .map((row, index) => {
          const [data, codigo, num, valor, , descricao, tipo] = row.split(';');
          return {
            id: index,
            data: data || '',
            codigo: codigo || '',
            num: num || '',
            valor: valor ? `R$ ${valor}` : '',
            descricao: descricao?.replace(/;PF$/, '').trim() || '',
            tipo: tipo || 'PF',
          };
        })
    );
  };

  const gridChunks = parseCSV(csvData);

  const totalSumForChunk = (chunk: GridRowData[]): string => {
    return chunk
      .reduce((sum, row) => {
        const valor = parseFloat(row.valor.replace('R$', '').replace(',', '.') || '0');
        return sum + valor;
      }, 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalSumForAll = (): string => {
    return gridChunks
      .flat()
      .reduce((sum, row) => {
        const valor = parseFloat(row.valor.replace('R$', '').replace(',', '.') || '0');
        return sum + valor;
      }, 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const downloadCSV = (data: string, index: number) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_parte${index + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: GridColDef<GridRowData>[] = [
    { field: 'data', headerName: 'Data', width: 120 },
    { field: 'codigo', headerName: 'Código', width: 130 },
    { field: 'num', headerName: 'Número', width: 90 },
    { field: 'valor', headerName: 'Valor', width: 130, headerAlign: 'right', align: 'right' },
    { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 400 },
    { field: 'tipo', headerName: 'Tipo', width: 90 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-[1400px]">
      <Paper elevation={3} className="p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Conversor XML para CSV</h1>
        <FileUpload onUpload={(data) => setCsvData(data)} />

        {csvData.length > 0 && (
          <>
            <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
              <span>
                Total desta parte: <strong>{totalSumForChunk(gridChunks[currentChunk])}</strong>
              </span>
              <span>
                Total geral: <strong>{totalSumForAll()}</strong>
              </span>
            </div>

            {csvData.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {csvData.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentChunk === index ? 'contained' : 'outlined'}
                    onClick={() => setCurrentChunk(index)}
                  >
                    Parte {index + 1}
                  </Button>
                ))}
              </div>
            )}

            <div style={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={gridChunks[currentChunk]}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => setPaginationModel(model)}
                pageSizeOptions={[10, 25, 50]} // Configurações de opções de tamanho de página
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }} // Correção: 'toolbar' com letra minúscula
              />
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              {csvData.map((chunk, index) => (
                <Button
                  key={index}
                  onClick={() => downloadCSV(chunk, index)}
                  variant="contained"
                  color="success"
                >
                  Baixar Parte {index + 1}
                </Button>
              ))}
            </div>
          </>
        )}
      </Paper>
    </div>
  );
}
