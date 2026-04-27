import Markdown from "react-markdown";
import { Download, FileText, File as FileIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { useState } from "react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const splitText = doc.splitTextToSize(message, pageWidth - margin * 2);
    doc.text(splitText, margin, 20);
    doc.save(`tortenelem_tanulotars_${new Date().getTime()}.pdf`);
  };

  const downloadDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: message.split('\n').map(line => 
          new Paragraph({
            children: [new TextRun(line)],
          })
        ),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `tortenelem_tanulotars_${new Date().getTime()}.docx`);
  };

  if (isUser) {
    return (
      <div className="flex gap-4 justify-end">
        <div className="max-w-[85%] bg-history-blue text-white p-4 rounded-l-xl rounded-br-xl shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        <div className="w-8 h-8 rounded bg-gold-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold font-sans">
          Én
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 group">
      <div className="w-8 h-8 rounded bg-gold-500 flex-shrink-0 flex items-center justify-center font-display text-burgundy-800 font-bold">
        TT
      </div>
      <div className="max-w-[85%] bg-parchment-25 border border-parchment-200 p-4 rounded-r-xl rounded-bl-xl shadow-sm relative">
        <div className="text-history-text markdown-body font-serif text-sm pr-8">
          <Markdown>{message}</Markdown>
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsExporting(!isExporting)}
            className="p-1.5 hover:bg-parchment-100 rounded-md text-history-subtle transition-colors"
            title="Letöltés"
          >
            <Download size={14} />
          </button>
          
          {isExporting && (
            <div className="absolute top-8 right-0 bg-white border border-parchment-200 rounded-lg shadow-xl p-1 z-10 w-32 animate-in zoom-in">
              <button 
                onClick={() => { downloadPDF(); setIsExporting(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-parchment-50 rounded-md text-history-text transition-colors"
              >
                <FileIcon size={12} className="text-red-600" />
                PDF mentése
              </button>
              <button 
                onClick={() => { downloadDocx(); setIsExporting(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-parchment-50 rounded-md text-history-text transition-colors"
              >
                <FileText size={12} className="text-blue-600" />
                DOCX mentése
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
