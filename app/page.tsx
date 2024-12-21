'use client';

import { useState } from "react";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import FileUpload from "./components/FileUpload";
import { Paper } from '@mui/material';

export default function Home() {
  const [csvData, setCsvData] = useState<string[]>([]);  // Changed to array of strings

  const downloadCSV = (data: string, index: number) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dados_parte${index + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Current chunk being displayed in the grid
  const [currentChunk, setCurrentChunk] = useState(0);

  // Calculate total sum for current chunk
  const totalSum = csvData.length > 0
    ? csvData[currentChunk]
        .split('\n')
        .filter(Boolean)
        .reduce((sum, row) => {
          const valor = row.split(';')[3] || '0';
          return sum + parseFloat(valor.replace(',', '.'));
        }, 0)
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00';

  // Calculate total sum for all chunks
  const totalSumAll = csvData.length > 0
    ? csvData
        .reduce((total, chunk) => {
          return total + chunk
            .split('\n')
            .filter(Boolean)
            .reduce((sum, row) => {
              const valor = row.split(';')[3] || '0';
              return sum + parseFloat(valor.replace(',', '.'));
            }, 0);
        }, 0)
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00';

  const gridData = csvData.length > 0 ? csvData[currentChunk].split('\n').filter(Boolean).map((row, index) => {
    // Split with a limit to prevent splitting the description that contains semicolons
    const parts = row.split(';', 7);
    const [data, codigo, num, valor, empty1, empty2, descricao, tipo] = parts;
    return {
      id: index,
      data,
      codigo,
      num,
      valor: valor ? `R$ ${valor}` : '',
      emptyColumn: '',
      // Remove the last ;PF from description if it exists
      descricao: descricao?.replace(/;PF$/, '')?.trim(),
      tipo: 'PF'
    };
  }) : [];

  const columns = [
    { 
      field: 'data', 
      headerName: 'Data', 
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    { 
      field: 'codigo', 
      headerName: 'Código', 
      width: 130,
      headerClassName: 'super-app-theme--header',
    },
    { 
      field: 'num', 
      headerName: 'Número', 
      width: 90,
      headerClassName: 'super-app-theme--header',
    },
    { 
      field: 'valor', 
      headerName: 'Valor', 
      width: 130,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: 'emptyColumn',
      headerName: '',
      width: 80,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false,
    },
    { 
      field: 'descricao', 
      headerName: 'Descrição', 
      flex: 1,
      minWidth: 400,
      headerClassName: 'super-app-theme--header',
    },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 90,
      headerClassName: 'super-app-theme--header',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-[1400px]">
      <Paper elevation={3} className="p-6 bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Conversor XML para CSV
        </h1>
        <FileUpload onUpload={(data) => setCsvData(data)} />
        {csvData.length > 0 && (
          <div className="space-y-4 mt-6">
            {/* Add total summary */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-700">
                <span className="font-semibold">Total desta parte:</span>{' '}
                <span className="text-lg text-green-600 font-bold">{totalSum}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Total geral:</span>{' '}
                <span className="text-lg text-green-600 font-bold">{totalSumAll}</span>
              </div>
            </div>

            {csvData.length > 1 && (
              <div className="flex gap-2 justify-center mb-4">
                {csvData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentChunk(index)}
                    className={`px-4 py-2 rounded ${
                      currentChunk === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Parte {index + 1}
                  </button>
                ))}
              </div>
            )}
            <div style={{ height: 600, width: '100%' }} className="bg-white">
              <DataGrid
                rows={gridData}
                columns={columns}
                paginationModel={{ pageSize: 10, page: 0 }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: '#f3f4f6',
                    fontWeight: 'bold',
                  },
                  '.MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
                  },
                  border: 'none',
                  boxShadow: 2,
                }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              {csvData.map((chunk, index) => (
                <button 
                  key={index}
                  onClick={() => downloadCSV(chunk, index)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 0 111.414 1.414l-3 3a1 0 01-1.414 0l-3-3a1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Baixar Parte {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
}
