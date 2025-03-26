import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const ProjectModal = ({ onClose, onSave, project = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useLanguage();

  // Reset form when project changes
  useEffect(() => {
    setName(project?.name || '');
    setDescription(project?.description || '');
  }, [project]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    const projectData = {
      id: project?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      createdAt: project?.createdAt || new Date().toISOString(),
      calculations: project?.calculations || []
    };
    
    console.log('Saving project:', projectData);
    onSave(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md" style={{ 
        backgroundColor: theme.colors.surface,
        borderTop: `4px solid ${theme.colors.primary}`
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
          {project ? t('editProject') : t('createNewProject')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('projectName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              placeholder={t('enterProjectName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              rows={4}
              placeholder={t('enterProjectDescription')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md transition-colors"
            style={{ 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary
            }}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
