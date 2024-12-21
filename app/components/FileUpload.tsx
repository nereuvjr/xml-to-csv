"use client";

import { ChangeEvent } from "react";

interface FileUploadProps {
  onUpload: (data: string[]) => void;  // Updated to accept string array
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert("Por favor, selecione um arquivo XML válido.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const xmlContent = reader.result as string;

        const response = await fetch("/api/convert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ xmlContent }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro na conversão do arquivo.");
        }

        if (!data.csvData) {
          throw new Error("Nenhum dado foi gerado da conversão.");
        }

        onUpload(Array.isArray(data.csvData) ? data.csvData : [data.csvData]);
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        alert(error instanceof Error ? error.message : "Erro ao processar o arquivo. Verifique se o formato do XML está correto.");
      }
    };

    reader.onerror = () => {
      alert("Erro ao ler o arquivo. Por favor, tente novamente.");
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="file-upload"
        className="block text-sm font-medium text-gray-700"
      >
        Selecione um arquivo XML para conversão
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xml"
        onChange={handleFileChange}
        className="block w-full text-sm border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
