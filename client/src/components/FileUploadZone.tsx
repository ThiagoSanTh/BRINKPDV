import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  onFileUpload?: (file: File) => void;
}

export function FileUploadZone({ onFileUpload }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus("success");
          onFileUpload?.(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="zone-file-upload"
    >
      <div className="p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          {uploadStatus === "idle" && (
            <>
              <div>
                <p className="font-medium mb-1">
                  Arraste e solte arquivos GBK aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <input
                type="file"
                accept=".gbk,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                data-testid="input-file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </span>
                </Button>
              </label>
            </>
          )}

          {uploadStatus === "uploading" && (
            <>
              <p className="font-medium">{fileName}</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Convertendo GBK para UTF-8... {uploadProgress}%
              </p>
            </>
          )}

          {uploadStatus === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-chart-2" />
              <div>
                <p className="font-medium text-chart-2">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Arquivo processado com sucesso!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadStatus("idle");
                  setFileName("");
                  setUploadProgress(0);
                }}
                data-testid="button-upload-another"
              >
                Enviar Outro Arquivo
              </Button>
            </>
          )}

          {uploadStatus === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Erro ao processar arquivo</p>
                <p className="text-sm text-muted-foreground">
                  Por favor, tente novamente
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadStatus("idle");
                  setFileName("");
                  setUploadProgress(0);
                }}
              >
                Tentar Novamente
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
