// components/editor/StyleEditor.tsx
import type { SubtitleStyle } from './VideoEditor';

interface StyleEditorProps {
  styles: SubtitleStyle;
  onStyleChange: (newStyles: SubtitleStyle) => void;
}

function StyleEditor({ styles, onStyleChange }: StyleEditorProps) {
  
  const handleChange = (
    field: keyof SubtitleStyle,
    value: string | number
  ) => {
    onStyleChange({ ...styles, [field]: value });
  };

  return (
    <div className="style-editor">
      <h4>Estilo das Legendas</h4>
      
      <div className="style-editor-group">
        <label>Tamanho da Fonte: {styles.fontSize}px</label>
        <input
          type="range"
          min="14"
          max="48"
          step="1"
          value={styles.fontSize}
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
        />
      </div>

      <div className="style-editor-group">
        <label>Cor do Texto</label>
        <input
          type="color"
          value={styles.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </div>

      {/* Inputs de Cor de Fundo e Opacidade REMOVIDOS */}

    </div>
  );
}

export default StyleEditor;