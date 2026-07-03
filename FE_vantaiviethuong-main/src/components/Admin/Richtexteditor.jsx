import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Node, mergeAttributes, Extension } from '@tiptap/core'
import {
  Heading2, Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon,
  List, ListOrdered, Undo2, Redo2, Image as ImageIcon, Megaphone, Loader2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, ChevronDown,
} from 'lucide-react'
import { blogApi } from '../../services/api'
import styles from './RichtextEditor.module.scss'

// ── Portal Dropdown ──────────────────────────────────────
function DropdownMenu({ anchorRef, open, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    })
  }, [open, anchorRef])

  if (!open) return null

  return ReactDOM.createPortal(
    <div style={{
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      zIndex: 99999,
      background: '#fff',
      border: '1px solid #e2e2e2',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: 6,
      minWidth: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {children}
    </div>,
    document.body
  )
}

// ── CalloutBox Node ──────────────────────────────────────
const CALLOUT_COLORS = ['red', 'blue', 'yellow', 'green']
const CALLOUT_LABEL = { red: 'Đỏ', blue: 'Xanh dương', yellow: 'Vàng', green: 'Xanh lá' }

const CalloutBox = Node.create({
  name: 'calloutBox', group: 'block', content: 'block+', defining: true,
  addAttributes() {
    return { color: { default: 'red', parseHTML: (el) => el.getAttribute('data-color') || 'red', renderHTML: (attrs) => ({ 'data-color': attrs.color }) } }
  },
  parseHTML() { return [{ tag: 'div.callout-box' }] },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: `callout-box callout-${node.attrs.color || 'red'}` }), 0]
  },
  addCommands() {
    return {
      setCalloutBox: (color = 'red') => ({ commands }) => commands.wrapIn(this.name, { color }),
      unsetCalloutBox: () => ({ commands }) => commands.lift(this.name),
    }
  },
})

// ── FontSize Extension ───────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: { fontSize: { default: null, parseHTML: (el) => el.style.fontSize || null, renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } } }]
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

const FONT_SIZES = [
  { label: 'Nhỏ', value: '13px' },
  { label: 'Mặc định', value: null },
  { label: 'Vừa', value: '18px' },
  { label: 'Lớn', value: '22px' },
  { label: 'Rất lớn', value: '28px' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Vàng', value: '#fff3a3' },
  { label: 'Xanh', value: '#b8e6c9' },
  { label: 'Hồng', value: '#fcd2e0' },
  { label: 'Cam', value: '#ffd9a8' },
]

// ════════════════════════════════════════════════════════
export default function RichTextEditor({ value, onChange, placeholder }) {
  const fileInputRef    = useRef(null)
  const sizeBtnRef      = useRef(null)
  const highlightBtnRef = useRef(null)
  const calloutBtnRef   = useRef(null)

  const [uploading, setUploading]           = useState(false)
  const [colorMenuOpen, setColorMenuOpen]   = useState(false)
  const [sizeMenuOpen, setSizeMenuOpen]     = useState(false)
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2] } }),
      Image.configure({ HTMLAttributes: { class: 'blog-content-image' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, FontSize,
      Highlight.configure({ multicolor: true }),
      CalloutBox,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: styles.editorArea } },
  })

  useEffect(() => {
    if (!editor) return
    const nextContent = value || ''
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  const handlePickImage = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh.'); return }
    setUploading(true)
    try {
      const res = await blogApi.uploadContentImage(file)
      const url = res.url || res.data?.url
      if (!url) throw new Error('Không nhận được URL ảnh.')
      editor.chain().focus().setImage({ src: url, alt: '' }).run()
    } catch (err) {
      alert(err.message || 'Upload ảnh thất bại.')
    } finally {
      setUploading(false)
    }
  }

  const insertCallout = (color) => {
    setColorMenuOpen(false)
    if (editor.isActive('calloutBox')) {
      editor.chain().focus().updateAttributes('calloutBox', { color }).run()
    } else {
      editor.chain().focus().setCalloutBox(color).run()
    }
  }

  const applyFontSize = (size) => {
    setSizeMenuOpen(false)
    size ? editor.chain().focus().setFontSize(size).run()
         : editor.chain().focus().unsetFontSize().run()
  }

  const applyHighlight = (color) => {
    setHighlightMenuOpen(false)
    editor.chain().focus().toggleHighlight({ color }).run()
  }

  const currentFontSizeLabel =
    FONT_SIZES.find(s => s.value === editor.getAttributes('textStyle').fontSize)?.label || 'Cỡ chữ'

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>

        <button type="button" className={editor.isActive('heading', { level: 2 }) ? styles.active : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Tiêu đề H2">
          <Heading2 size={16} />
        </button>

        {/* Cỡ chữ */}
        <div className={styles.colorPickerWrap}>
          <button ref={sizeBtnRef} type="button" className={styles.sizeBtn} onClick={() => setSizeMenuOpen(v => !v)} title="Cỡ chữ">
            <span>{currentFontSizeLabel}</span><ChevronDown size={13} />
          </button>
          <DropdownMenu anchorRef={sizeBtnRef} open={sizeMenuOpen}>
            {FONT_SIZES.map(s => (
              <button key={s.label} type="button" className={styles.colorMenuItem} onClick={() => applyFontSize(s.value)} style={s.value ? { fontSize: s.value } : undefined}>
                {s.label}
              </button>
            ))}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive('bold') ? styles.active : ''} onClick={() => editor.chain().focus().toggleBold().run()} title="In đậm"><BoldIcon size={16} /></button>
        <button type="button" className={editor.isActive('italic') ? styles.active : ''} onClick={() => editor.chain().focus().toggleItalic().run()} title="In nghiêng"><ItalicIcon size={16} /></button>
        <button type="button" className={editor.isActive('underline') ? styles.active : ''} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Gạch chân"><UnderlineIcon size={16} /></button>

        {/* Highlight */}
        <div className={styles.colorPickerWrap}>
          <button ref={highlightBtnRef} type="button" className={editor.isActive('highlight') ? styles.active : ''} onClick={() => setHighlightMenuOpen(v => !v)} title="Tô màu">
            <Highlighter size={16} />
          </button>
          <DropdownMenu anchorRef={highlightBtnRef} open={highlightMenuOpen}>
            {HIGHLIGHT_COLORS.map(h => (
              <button key={h.value} type="button" className={styles.colorMenuItem} onClick={() => applyHighlight(h.value)}>
                <span className={styles.swatch} style={{ background: h.value }} />{h.label}
              </button>
            ))}
            {editor.isActive('highlight') && (
              <button type="button" className={styles.colorMenuItem} onClick={() => { setHighlightMenuOpen(false); editor.chain().focus().unsetHighlight().run() }}>Bỏ tô màu</button>
            )}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Căn trái"><AlignLeft size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'center' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Căn giữa"><AlignCenter size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Căn phải"><AlignRight size={16} /></button>
        <button type="button" className={editor.isActive({ textAlign: 'justify' }) ? styles.active : ''} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Căn đều"><AlignJustify size={16} /></button>

        <span className={styles.divider} />

        <button type="button" className={editor.isActive('bulletList') ? styles.active : ''} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Danh sách"><List size={16} /></button>
        <button type="button" className={editor.isActive('orderedList') ? styles.active : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Danh sách số"><ListOrdered size={16} /></button>

        <span className={styles.divider} />

        <button type="button" onClick={handlePickImage} disabled={uploading} title="Chèn ảnh">
          {uploading ? <Loader2 size={16} className={styles.spin} /> : <ImageIcon size={16} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className={styles.hiddenFileInput} />

        {/* Callout */}
        <div className={styles.colorPickerWrap}>
          <button ref={calloutBtnRef} type="button" className={editor.isActive('calloutBox') ? styles.active : ''} onClick={() => setColorMenuOpen(v => !v)} title="Khung nổi bật">
            <Megaphone size={16} />
          </button>
          <DropdownMenu anchorRef={calloutBtnRef} open={colorMenuOpen}>
            {CALLOUT_COLORS.map(c => (
              <button key={c} type="button" className={styles.colorMenuItem} onClick={() => insertCallout(c)}>
                <span className={`${styles.swatch} ${styles['swatch_' + c]}`} />{CALLOUT_LABEL[c]}
              </button>
            ))}
            {editor.isActive('calloutBox') && (
              <button type="button" className={styles.colorMenuItem} onClick={() => { setColorMenuOpen(false); editor.chain().focus().unsetCalloutBox().run() }}>Bỏ khung</button>
            )}
          </DropdownMenu>
        </div>

        <span className={styles.divider} />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác"><Undo2 size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại"><Redo2 size={16} /></button>

      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
}
