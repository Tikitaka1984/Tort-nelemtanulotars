import { useState } from "react";
import Markdown from "react-markdown";
import { FileText, File as FileIcon, Copy, Check } from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    // Simple text split - a more complex version could handle markdown
    const splitText = doc.splitTextToSize(message, pageWidth - margin * 2);
    doc.text(splitText, margin, 20);
    doc.save(`TT_Tanulotars_${new Date().getTime()}.pdf`);
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
    saveAs(blob, `TT_Tanulotars_${new Date().getTime()}.docx`);
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
        
        <div className="absolute -bottom-8 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-parchment-200 rounded text-[10px] font-bold text-history-blue hover:bg-parchment-50 shadow-sm transition-all"
            title="Szakmai PDF mentése"
          >
            <FileIcon size={12} className="text-red-600" />
            PDF MENTÉSE
          </button>
          <button 
            onClick={downloadDocx}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-parchment-200 rounded text-[10px] font-bold text-history-blue hover:bg-parchment-50 shadow-sm transition-all"
            title="Szerkeszthető dokumentum mentése"
          >
            <FileText size={12} className="text-blue-600" />
            DOCX MENTÉSE
          </button>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-parchment-200 rounded text-[10px] font-bold text-history-blue hover:bg-parchment-50 shadow-sm transition-all"
            title="Szöveg másolása"
          >
            {copied ? (
              <>
                <Check size={12} className="text-green-600" />
                MÁSOLVA!
              </>
            ) : (
              <>
                <Copy size={12} className="text-history-blue" />
                MÁSOLÁS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
