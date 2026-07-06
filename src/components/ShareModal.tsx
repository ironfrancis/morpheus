import React, { useState } from 'react';
import { Share, Copy, Check, Download, Info } from 'lucide-react';

interface ShareModalProps {
  markdown: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ markdown, projectName, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compress / Encode Markdown into Share URL
  const generateShareUrl = () => {
    try {
      const base64 = btoa(encodeURIComponent(markdown));
      return `${window.location.origin}${window.location.pathname}?data=${base64}`;
    } catch (e) {
      return window.location.href;
    }
  };

  const handleCopyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      projectName,
      markdown,
      exportedAt: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-morpheus-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl max-w-md w-full border border-light-border dark:border-dark-border p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Share size={18} className="text-primary" />
            分享与导出项目
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Morpheus 支持纯前端状态分享。你可以将当前的 Markdown 全文打包压缩进一个 URL 链接中，任何打开这个链接的人都可以实时看到你的多维看板！
        </p>

        {/* Buttons / Actions */}
        <div className="flex flex-col gap-3">
          
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-primary text-white flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            {copied ? (
              <>
                <Check size={16} />
                链接复制成功！
              </>
            ) : (
              <>
                <Copy size={16} />
                复制专属分享链接 (打包状态)
              </>
            )}
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 hover:bg-light-surface dark:hover:bg-dark-surface/80 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download size={16} />
            导出为 JSON 备份文件
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-light-border dark:border-dark-border flex items-start gap-2 text-[10px] text-gray-400 leading-normal">
          <Info size={12} className="mt-0.5 shrink-0 text-primary" />
          <span>
            提示：专属分享链接中包含了经 Base64 编码的全部编辑内容。若内容过多，部分浏览器可能会限制 URL 长度，推荐频繁备份 Markdown text 或导出 JSON 备份。
          </span>
        </div>
      </div>
    </div>
  );
};
