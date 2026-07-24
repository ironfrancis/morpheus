export interface NoteFrontmatter {
  title?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  [key: string]: any;
}

export interface Note {
  id: string; // 文件名或唯一标识，例如 'react-19-features'
  title: string;
  content: string; // 原始 Markdown 内容
  frontmatter: NoteFrontmatter;
  links: string[]; // 该笔记中引用的其他笔记 id 列表 (双向链接 [[Note ID]])
  backlinks: string[]; // 引用了该笔记的其他笔记 id 列表
}

export interface GraphNode {
  id: string;
  label: string;
  val: number; // 节点大小/权重（基于入链/出链数）
  group?: string; // 分组，如 status 或 priority
}

export interface GraphLink {
  source: string;
  target: string;
}

/**
 * 解析 Markdown 内容，提取 Frontmatter 和双向链接
 */
export function parseMarkdown(id: string, rawContent: string): Omit<Note, 'backlinks'> {
  const frontmatter: NoteFrontmatter = {};
  let content = rawContent;
  let title = id;

  // 1. 解析 Frontmatter (YAML-like)
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = rawContent.match(frontmatterRegex);

  if (match) {
    const yamlLines = match[1].split('\n');
    yamlLines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim();
        let valStr = line.slice(colonIndex + 1).trim();

        // 去除包裹的引号
        if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
          valStr = valStr.slice(1, -1);
        }

        if (key === 'tags') {
          // 解析 tags 数组，支持 [tag1, tag2] 或逗号分隔
          if (valStr.startsWith('[') && valStr.endsWith(']')) {
            frontmatter.tags = valStr.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean);
          } else {
            frontmatter.tags = valStr.split(',').map(t => t.trim()).filter(Boolean);
          }
        } else if (key === 'priority') {
          frontmatter.priority = valStr.toLowerCase() as 'high' | 'medium' | 'low';
        } else if (key === 'status') {
          const statusLower = valStr.toLowerCase();
          if (statusLower === 'todo' || statusLower === 'in_progress' || statusLower === 'done') {
            frontmatter.status = statusLower;
          } else if (statusLower === 'in progress' || statusLower === 'inprogress') {
            frontmatter.status = 'in_progress';
          }
        } else if (key === 'title') {
          frontmatter.title = valStr;
          title = valStr;
        } else {
          frontmatter[key] = valStr;
        }
      }
    });
    content = rawContent.replace(frontmatterRegex, '');
  }

  // 如果 frontmatter 中没有 title，尝试从 Markdown 的第一个 # 标题中提取
  if (!frontmatter.title) {
    const h1Match = content.match(/^#\s+(.*)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
      frontmatter.title = title;
    }
  }

  // 2. 提取双向链接 [[Note ID]] 或 [[Note ID|Display Name]]
  const links: string[] = [];
  const wikiLinkRegex = /\[\[(.*?)\]\]/g;
  let linkMatch;
  while ((linkMatch = wikiLinkRegex.exec(content)) !== null) {
    const fullLink = linkMatch[1];
    const pipeIndex = fullLink.indexOf('|');
    const targetId = pipeIndex !== -1 ? fullLink.slice(0, pipeIndex).trim() : fullLink.trim();
    // 转换为标准 id 格式（小写，连字符）
    const normalizedId = targetId.toLowerCase().replace(/\s+/g, '-');
    if (normalizedId && !links.includes(normalizedId)) {
      links.push(normalizedId);
    }
  }

  return {
    id,
    title,
    content,
    frontmatter,
    links,
  };
}

/**
 * 构建完整的笔记库，并计算反向链接 (backlinks)
 */
export function buildNoteLibrary(rawNotes: { id: string; content: string }[]): Record<string, Note> {
  const library: Record<string, Note> = {};

  // 第一步：解析所有笔记
  rawNotes.forEach(raw => {
    const parsed = parseMarkdown(raw.id, raw.content);
    library[raw.id] = {
      ...parsed,
      backlinks: [],
    };
  });

  // 第二步：计算反向链接
  Object.keys(library).forEach(sourceId => {
    const note = library[sourceId];
    note.links.forEach(targetId => {
      // 如果引用的目标笔记存在于库中，添加反向链接
      if (library[targetId]) {
        if (!library[targetId].backlinks.includes(sourceId)) {
          library[targetId].backlinks.push(sourceId);
        }
      }
    });
  });

  return library;
}

/**
 * 将 Note 转换为 Frontmatter 字符串
 */
export function stringifyFrontmatter(frontmatter: NoteFrontmatter): string {
  const lines = ['---'];
  Object.entries(frontmatter).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(', ')}]`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  });
  lines.push('---');
  return lines.join('\n');
}

/**
 * 更新笔记的 Frontmatter 并重新生成内容
 */
export function updateNoteFrontmatter(note: Note, newFrontmatter: Partial<NoteFrontmatter>): Note {
  const updatedFrontmatter = {
    ...note.frontmatter,
    ...newFrontmatter,
  };

  const frontmatterStr = stringifyFrontmatter(updatedFrontmatter);
  const newContent = `${frontmatterStr}\n${note.content.trim()}`;

  const parsed = parseMarkdown(note.id, newContent);
  return {
    ...note,
    title: parsed.title,
    content: parsed.content,
    frontmatter: parsed.frontmatter,
    links: parsed.links,
  };
}

export interface ChecklistItem {
  lineIndex: number;
  text: string;
  checked: boolean;
}

/**
 * 从 Markdown 文本中提取所有的 Checklist 项
 */
export function parseChecklist(content: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const lines = content.split('\n');
  lines.forEach((line, lineIndex) => {
    const match = line.match(/^(\s*)-\s*\[([ xX])\]\s+(.+)$/);
    if (match) {
      items.push({
        lineIndex,
        text: match[3].trim(),
        checked: match[2].toLowerCase() === 'x'
      });
    }
  });
  return items;
}

/**
 * 切换指定行的 Checklist 勾选状态并返回更新后的全文
 */
export function toggleChecklistItem(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  const line = lines[lineIndex];
  if (line !== undefined) {
    const match = line.match(/^(\s*-\s*\[)([ xX])(\]\s+.+)$/);
    if (match) {
      const nextChar = match[2].toLowerCase() === 'x' ? ' ' : 'x';
      lines[lineIndex] = `${match[1]}${nextChar}${match[3]}`;
    }
  }
  return lines.join('\n');
}
