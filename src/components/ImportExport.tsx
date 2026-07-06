import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import { Note } from '../utils/markdown';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportExportProps {
  notes: Record<string, Note>;
  onImportNotes: (imported: { id: string; content: string }[]) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  notes,
  onImportNotes,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });

  // 1. 导出为 Obsidian 兼容压缩包
  const handleExport = async () => {
    try {
      const zip = new JSZip();
      const noteList = Object.values(notes);

      noteList.forEach(note => {
        // 拼接 Frontmatter
        const fmLines = ['---'];
        Object.entries(note.frontmatter).forEach(([key, val]) => {
          if (val === undefined || val === null) return;
          if (Array.isArray(val)) {
            fmLines.push(`${key}: [${val.join(', ')}]`);
          } else {
            fmLines.push(`${key}: ${val}`);
          }
        });
        fmLines.push('---');

        const fullContent = `${fmLines.join('\n')}\n${note.content}`;
        
        // 写入 ZIP，文件名使用 title 或 id
        const fileName = `${note.id}.md`;
        zip.file(fileName, fullContent);
      });

      // 生成 ZIP 文件并触发下载
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `morpheus-canvas-vault-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('成功导出 Obsidian 兼容的 Markdown 知识库压缩包！解压后即可直接作为 Obsidian 仓库打开。');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试！');
    }
  };

  // 2. 导入本地 Markdown 文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedList: { id: string; content: string }[] = [];
    let processedCount = 0;
    const targetCount = files.length;

    Array.from(files).forEach(file => {
      if (!file.name.endsWith('.md')) {
        processedCount++;
        if (processedCount === targetCount) {
          triggerImport(importedList);
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const id = file.name.replace(/\.md$/, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        if (id) {
          importedList.push({ id, content });
        }

        processedCount++;
        if (processedCount === targetCount) {
          triggerImport(importedList);
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === targetCount) {
          triggerImport(importedList);
        }
      };
      reader.readAsText(file);
    });
  };

  const triggerImport = (importedList: { id: string; content: string }[]) => {
    if (importedList.length === 0) {
      setImportStatus({
        type: 'error',
        message: '未检测到有效的 Markdown (.md) 文件！'
      });
      return;
    }

    onImportNotes(importedList);
    setImportStatus({
      type: 'success',
      message: `成功导入 ${importedList.length} 篇 Markdown 笔记！关系图谱与看板已实时重组。`
    });

    // 3秒后清除状态
    setTimeout(() => {
      setImportStatus({ type: 'idle', message: '' });
    }, 4000);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Obsidian 兼容与导入导出
        </h4>
        <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
          PKM 生态兼容
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/10 transition-colors"
          title="导出为 Obsidian 兼容的 ZIP 压缩包"
        >
          <Download size={13} />
          <span>导出为 Obsidian</span>
        </button>

        {/* 导入按钮 */}
        <button
          onClick={triggerFileInput}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-lg shadow-sm transition-colors"
          title="导入本地 Markdown (.md) 文件"
        >
          <Upload size={13} />
          <span>导入 Markdown</span>
        </button>
      </div>

      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".md"
        className="hidden"
      />

      {/* 状态提示 */}
      {importStatus.type !== 'idle' && (
        <div className={`p-2.5 rounded-lg flex items-start gap-2 text-[10px] leading-relaxed transition-all ${
          importStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20'
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20'
        }`}>
          {importStatus.type === 'success' ? (
            <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}
    </div>
  );
};
