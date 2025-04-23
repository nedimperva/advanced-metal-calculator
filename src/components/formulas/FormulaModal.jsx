import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const FormulaModal = ({ formula, onSave, onClose }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  const [parameters, setParameters] = useState([]);

  useEffect(() => {
    if (formula) {
      setName(formula.name);
      setExpression(formula.expression);
      setParameters(formula.parameters);
    } else {
      setName('');
      setExpression('');
      setParameters([{ key: '', label: '', default: 0 }]);
    }
  }, [formula]);

  const handleParamChange = (idx, field, value) => {
    const copy = [...parameters];
    copy[idx][field] = field === 'default' ? parseFloat(value) || 0 : value;
    setParameters(copy);
  };

  const addParam = () => setParameters([...parameters, { key: '', label: '', default: 0 }]);

  const handleSave = () => {
    if (!name.trim() || !expression.trim()) return;
    onSave({
      id: formula?.id || Date.now().toString(),
      name: name.trim(),
      expression: expression.trim(),
      parameters
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg" style={{ backgroundColor: theme.colors.surface }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
          {formula ? t('editFormula') || 'Edit Formula' : t('newFormula') || 'New Formula'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('formulaName') || 'Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text, outlineColor: theme.colors.primary }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('expression') || 'Expression'}
            </label>
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="e.g. thickness * width * length * density * price"
              className="w-full p-2 border rounded-md"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text, outlineColor: theme.colors.primary }}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: theme.colors.textLight }}>
                {t('parameters') || 'Parameters'}
              </span>
              <button
                onClick={addParam}
                className="text-sm text-blue-500 hover:underline"
              >
                + {t('addParameter') || 'Add'}
              </button>
            </div>
            {parameters.map((param, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={e => handleParamChange(idx, 'key', e.target.value)}
                  placeholder={t('paramKey') || 'Key'}
                  className="p-2 border rounded-md"
                  style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                />
                <input
                  type="text"
                  value={param.label}
                  onChange={e => handleParamChange(idx, 'label', e.target.value)}
                  placeholder={t('paramLabel') || 'Label'}
                  className="p-2 border rounded-md"
                  style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                />
                <input
                  type="number"
                  value={param.default}
                  onChange={e => handleParamChange(idx, 'default', e.target.value)}
                  placeholder={t('paramDefault') || 'Default'}
                  className="p-2 border rounded-md"
                  style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border"
            style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md"
            style={{ backgroundColor: theme.colors.primary, color: theme.colors.textOnPrimary }}
          >
            {t('save') || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

FormulaModal.propTypes = {
  formula: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    expression: PropTypes.string.isRequired,
    parameters: PropTypes.array.isRequired
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default FormulaModal;
