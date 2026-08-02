import { FileUploadZone } from "@/components/FileUploadZone";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle } from "lucide-react";

export default function Upload() {
  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Upload de Arquivos GBK</h1>
        <p className="text-muted-foreground">
          Importar dados de produtos e vendas de arquivos GBK
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FileUploadZone onFileUpload={handleFileUpload} />
        </div>

        <div className="space-y-4">
          <Card data-testid="card-upload-info">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Sobre Arquivos GBK</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Os arquivos GBK utilizam codificação chinesa e são automaticamente
                  convertidos para UTF-8 durante o upload.
                </p>
                <p>
                  Formatos aceitos: .gbk, .txt
                </p>
                <p>
                  Tamanho máximo: 10MB
                </p>
              </div>
            </div>
          </Card>

          <Card data-testid="card-upload-history">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Últimos Uploads</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 py-2 border-b last:border-0">
                  <CheckCircle className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">produtos_2024.gbk</p>
                    <p className="text-xs text-muted-foreground">Hoje às 14:32</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2 border-b last:border-0">
                  <CheckCircle className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">vendas_outubro.gbk</p>
                    <p className="text-xs text-muted-foreground">10/10 às 09:15</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <CheckCircle className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">estoque_atualizado.gbk</p>
                    <p className="text-xs text-muted-foreground">08/10 às 16:45</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
