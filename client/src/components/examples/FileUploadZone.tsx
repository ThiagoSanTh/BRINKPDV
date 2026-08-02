import { FileUploadZone } from "../FileUploadZone";

export default function FileUploadZoneExample() {
  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FileUploadZone onFileUpload={handleFileUpload} />
    </div>
  );
}
