import React, { useState, useCallback } from "react";
import { Upload, Loader2, FileText } from "lucide-react";

const PDFExtractor = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsLoading(true);
    setProgress({ current: 0, total: 0 });
    setExtractedText("");

    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please drop a PDF file");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Starting to process:", file.name);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      setProgress((prev) => ({ ...prev, total: pdf.numPages }));
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += `[Page ${i}]\n${pageText}\n\n`;
        setProgress((prev) => ({ ...prev, current: i }));
      }

      setExtractedText(fullText.trim());
      console.log("Finished processing PDF");
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF file: " + (error as Error).message);
    }

    setIsLoading(false);
  }, []);

  return (
    <div className="w-screen min-h-screen p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PDF Text Extractor
          </h1>
          <p className="text-gray-600">
            Drop your PDF file below to extract its text content
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-full border-2 border-dashed rounded-xl p-12
            flex flex-col items-center justify-center 
            min-h-[300px] transition-all duration-200
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-blue-200 bg-white shadow-md hover:border-blue-300 hover:shadow-lg"
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-16 h-16 mb-4 animate-spin text-blue-500" />
              <p className="text-center">
                <span className="text-lg font-medium text-gray-900 block mb-1">
                  Processing PDF
                </span>
                <span className="text-gray-600">
                  {progress.total > 0 &&
                    `Page ${progress.current} of ${progress.total}`}
                </span>
              </p>
            </>
          ) : (
            <>
              <Upload
                className={`w-16 h-16 mb-4 ${
                  isDragging ? "text-blue-500" : "text-blue-400"
                }`}
              />
              <p className="text-center">
                <span className="text-lg font-medium text-gray-900 block mb-1">
                  Drop your PDF here
                </span>
                <span className="text-gray-600">or click to select a file</span>
              </p>
            </>
          )}
        </div>

        {extractedText && (
          <div className="w-full bg-white rounded-xl shadow-lg p-6 mt-8">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Extracted Text
                </h2>
              </div>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {extractedText.length.toLocaleString()} characters
              </span>
            </div>
            <div className="w-full bg-gray-50 rounded-lg border border-gray-100 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 p-4">
                {extractedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFExtractor;
