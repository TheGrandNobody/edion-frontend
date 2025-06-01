# Slate.js LaTeX Editor

A modern, bidirectional LaTeX ↔ WYSIWYG editor built with Slate.js that provides clean round-trip conversion between LaTeX documents and rich text editing.

## Architecture Overview

This implementation replaces the original HTML-based editor with a structured document model approach that enables reliable bidirectional LaTeX conversion.

### Key Components

- **`types.ts`** - Type definitions for the Slate document model
- **`LaTeXConverter.ts`** - Bidirectional LaTeX ↔ Slate conversion engine
- **`SlateEditor.tsx`** - Main editor component with custom rendering
- **`SlateToolbar.tsx`** - Formatting toolbar with Slate operations
- **`SlateEditorPage.tsx`** - Main page component
- **`LaTeXInput.tsx`** - Modal for importing LaTeX documents

## Features

### Rich Text Editing
- **Text formatting**: Bold, italic, underline
- **Alignment**: Left, center, right
- **Lists**: Bulleted and numbered with indentation support
- **Mathematics**: Inline and display math equations
- **Tables**: Basic table creation and editing
- **Document structure**: Headings (H1-H6)

### LaTeX Integration
- **WYSIWYG → LaTeX**: Real-time conversion to LaTeX
- **LaTeX → WYSIWYG**: Import LaTeX documents and convert to editable format
- **Download**: Export LaTeX as .tex file
- **Round-trip fidelity**: Preserves formatting through conversion cycles

## Technical Advantages over HTML Editor

### 1. Structured Document Model
```typescript
// Clean, typed document structure
interface ParagraphElement {
  type: 'paragraph';
  align?: 'left' | 'center' | 'right';
  children: Descendant[];
}
```

### 2. Reliable LaTeX Generation
```typescript
// Direct mapping from document model to LaTeX
serializeParagraph(element: ParagraphElement): string {
  const content = this.serializeChildren(element.children);
  
  if (element.align === 'center') {
    return `\\begin{center}\n${content}\n\\end{center}`;
  }
  
  return content;
}
```

### 3. Bidirectional Conversion
```typescript
// Parse LaTeX back to Slate document
parseFromLatex(latex: string): Descendant[] {
  const parsed = this.parseLatexContent(latex);
  return parsed;
}
```

## Usage

### Basic Editor
```tsx
import SlateEditor from './SlateEditor';
import { Descendant } from 'slate';

const [value, setValue] = useState<Descendant[]>([
  { type: 'paragraph', children: [{ text: 'Hello world!' }] }
]);

return (
  <SlateEditor 
    value={value} 
    onChange={setValue} 
  />
);
```

### With LaTeX Conversion
```tsx
import { LaTeXConverter } from './LaTeXConverter';

const converter = new LaTeXConverter();

// Convert to LaTeX
const latex = converter.serializeToLatex(slateValue);

// Parse from LaTeX
const slateDoc = converter.parseFromLatex(latexString);
```

## Supported LaTeX Features

### Text Formatting
- `\textbf{text}` → **Bold text**
- `\textit{text}` → *Italic text*
- `\underline{text}` → Underlined text
- `\textcolor{color}{text}` → Colored text

### Document Structure
- `\section{title}` → H1 heading
- `\subsection{title}` → H2 heading
- `\subsubsection{title}` → H3 heading

### Lists
```latex
\begin{itemize}
\item First item
  \item Indented item
\end{itemize}

\begin{enumerate}
\item Numbered item
\item Second item
\end{enumerate}
```

### Mathematics
- Inline: `\(E = mc^2\)`
- Display: `\[x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}\]`

### Alignment
```latex
\begin{center}
Centered text
\end{center}

\begin{flushright}
Right-aligned text
\end{flushright}
```

## Architecture Benefits

### 1. **Maintainability**
- Clean separation of concerns
- Type-safe operations
- No deprecated APIs (`document.execCommand`)

### 2. **Reliability**
- Predictable document transformations
- No HTML parsing edge cases
- Consistent cursor management

### 3. **Extensibility**
- Easy to add new LaTeX features
- Plugin-based architecture
- Custom element types

### 4. **Performance**
- Efficient re-rendering with Slate's reconciler
- Immutable document updates
- Optimized for large documents

## Migration from HTML Editor

The original editor had several limitations:

### Problems with HTML Approach
```typescript
// Fragile HTML parsing
const latexContent = htmlElement.innerHTML
  .replace(/<strong>/g, '\\textbf{')
  .replace(/<\/strong>/g, '}')
  // Many more brittle replacements...
```

### Slate.js Solution
```typescript
// Direct model serialization
serializeText(text: CustomText): string {
  let result = text.text;
  if (text.bold) result = `\\textbf{${result}}`;
  return result;
}
```

## Development

### Adding New LaTeX Features

1. **Define the element type**:
```typescript
interface CodeBlockElement extends BaseElement {
  type: 'code-block';
  language?: string;
}
```

2. **Add rendering**:
```tsx
case 'code-block':
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
```

3. **Add LaTeX serialization**:
```typescript
serializeCodeBlock(element: CodeBlockElement): string {
  const content = this.serializeChildren(element.children);
  return `\\begin{verbatim}\n${content}\n\\end{verbatim}`;
}
```

4. **Add LaTeX parsing**:
```typescript
parseVerbatim(content: string, startIndex: number): ParserResult {
  // Parse \begin{verbatim}...\end{verbatim}
}
```

### Testing Conversion Fidelity

The editor includes a debug panel showing the Slate document structure. Use this to verify:

1. **Round-trip conversion**: WYSIWYG → LaTeX → WYSIWYG
2. **Document structure preservation**
3. **Formatting consistency**

## Future Enhancements

### Planned Features
- [ ] More LaTeX environments (theorems, proofs, etc.)
- [ ] Bibliography support
- [ ] Figure and table references
- [ ] Custom math macros
- [ ] Collaborative editing
- [ ] LaTeX syntax highlighting in import modal

### Performance Optimizations
- [ ] Lazy loading for large documents
- [ ] Virtual scrolling for long lists
- [ ] Debounced LaTeX generation
- [ ] Background conversion workers

## Conclusion

This Slate.js implementation provides a robust foundation for LaTeX editing with:

- **Clean bidirectional conversion**
- **Type-safe document model**
- **Extensible architecture**
- **Modern React patterns**
- **Superior maintenance experience**

The structured approach makes it much easier to add new LaTeX features and ensures reliable round-trip conversion, addressing the key limitations of the original HTML-based editor. 