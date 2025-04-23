import React, { useState, useEffect } from 'react';
import { loadFormulas, saveFormula, deleteFormula } from '../../utils/formulas';
import FormulaModal from './FormulaModal';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const FormulasView = () => {
  const { t } = useLanguage();
  const [formulas, setFormulas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);

  useEffect(() => setFormulas(loadFormulas()), []);

  const handleSave = (formula) => {
    const updated = saveFormula(formula);
    if (updated) setFormulas(updated);
    setShowModal(false);
    setEditingFormula(null);
  };

  const handleDelete = (id) => {
    const updated = deleteFormula(id);
    if (updated) setFormulas(updated);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold" style={{ color: theme.colors.text }}>
          {t('formulas') || 'Formulas'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-md"
          style={{ backgroundColor: theme.colors.primary, color: theme.colors.textOnPrimary }}
        >
          + {t('newFormula') || 'New Formula'}
        </button>
      </div>
      {formulas.map(f => (
        <div key={f.id} className="flex justify-between items-center p-3 mb-2 rounded-md" style={{ backgroundColor: theme.colors.surface }}>
          <div>
            <div style={{ color: theme.colors.text }}>{f.name}</div>
            <div style={{ color: theme.colors.textLight, fontSize: '0.85rem' }}>{f.expression}</div>
          </div>
          <div className="space-x-2">
            <button onClick={() => { setEditingFormula(f); setShowModal(true); }} className="px-2 py-1 rounded-md" style={{ backgroundColor: theme.colors.secondary, color: theme.colors.textOnPrimary }}>
              {t('edit') || 'Edit'}
            </button>
            <button onClick={() => handleDelete(f.id)} className="px-2 py-1 rounded-md" style={{ backgroundColor: theme.colors.danger, color: theme.colors.textOnPrimary }}>
              {t('delete') || 'Delete'}
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <FormulaModal
          formula={editingFormula}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingFormula(null); }}
        />
      )}
    </div>
  );
};

export default FormulasView;
