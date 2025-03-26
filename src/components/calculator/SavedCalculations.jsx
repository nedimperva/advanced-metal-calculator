import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';
import { loadProjects, saveProject, addCalculationsToProject } from '../../utils/projects';

const SavedCalculations = ({
  calculations,
  onDelete,
  onClearAll
}) => {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const calculationsContainerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
  }, []);

  // Create a separate function to handle calculation deletion
  const deleteCalculation = (calculationId) => {
    console.log('Deleting calculation with ID:', calculationId);
    // Call the parent component's onDelete function
    if (typeof onDelete === 'function') {
      onDelete(calculationId);
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      createdAt: new Date().toISOString(),
      calculations: []
    };
    
    try {
      const existingProjects = JSON.parse(localStorage.getItem('metalCalculator.projects') || '[]');
      const updatedProjects = [newProject, ...existingProjects];
      localStorage.setItem('metalCalculator.projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      setNewProjectName('');
      setShowProjectForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddToProject = () => {
    if (!selectedProjectId) return;
    
    const updatedProjects = addCalculationsToProject(selectedProjectId, calculations);
    if (updatedProjects) {
      setProjects(updatedProjects);
      setSelectedProjectId('');
      onClearAll(); // Clear calculations after adding to project as requested
    }
  };

  // Calculate heights for positioning
  const headerHeight = 60; // px
  const projectActionsHeight = calculations.length > 0 ? (showProjectForm ? 120 : (projects.length > 0 ? 120 : 60)) : 0;

  return (
    <div 
      className="h-full border rounded-lg relative" 
      style={{ 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border
      }}
    >
      {/* Header - Fixed at top */}
      <div 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${headerHeight}px`,
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
          {t('myCalculations')}
        </h2>
        {calculations.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm hover:opacity-80 px-2 py-1 rounded-md"
            style={{ 
              backgroundColor: theme.colors.danger,
              color: theme.colors.textOnPrimary
            }}
          >
            {t('clearAll')}
          </button>
        )}
      </div>
      
      {/* Scrollable Content Area */}
      <div 
        ref={calculationsContainerRef}
        style={{ 
          position: 'absolute',
          top: `${headerHeight}px`,
          bottom: `${projectActionsHeight}px`,
          left: 0,
          right: 0,
          overflowY: 'auto',
          padding: '16px'
        }}
      >
        {calculations.length === 0 ? (
          <div className="text-center py-8" style={{ color: theme.colors.textLight }}>
            {t('noSavedCalculationsYet')}
          </div>
        ) : (
          <div className="space-y-4">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="rounded-lg p-3 border"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderLeftWidth: '4px', 
                  borderLeftColor: calc.color || theme.colors.primary,
                  borderColor: theme.colors.border,
                  transition: theme.transitions.DEFAULT
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-md inline-block"
                      style={{ 
                        backgroundColor: `${theme.colors.primary}20`,
                        color: theme.colors.primary
                      }}
                    >
                      {calc.material}
                    </span>
                    <div>
                      <h3 className="font-medium text-sm" style={{ color: theme.colors.text }}>{calc.name}</h3>
                      <p className="text-xs" style={{ color: theme.colors.textLight }}>
                        {formatDate(calc.timestamp)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete calculation"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteCalculation(calc.id);
                    }}
                    className="text-sm p-1 rounded-full hover:opacity-80"
                    style={{ color: theme.colors.danger }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span style={{ color: theme.colors.textLight }}>{t('quantity')}: </span>
                      <span style={{ color: theme.colors.text }}>{calc.quantity}</span>
                    </div>
                    <div>
                      <span style={{ color: theme.colors.textLight }}>{t('weight')}: </span>
                      <span className="font-bold" style={{ color: theme.colors.text }}>{(calc.weight * calc.quantity).toFixed(2)} kg</span>
                    </div>
                    <div>
                      <span style={{ color: theme.colors.textLight }}>{t('price')}: </span>
                      <span className="font-medium" style={{ color: theme.colors.primary }}>${calc.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Project actions - Fixed at bottom */}
      {calculations.length > 0 && (
        <div 
          style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            zIndex: 10
          }}
        >
          {!showProjectForm ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowProjectForm(true)}
                className="w-full py-2 px-4 rounded-md text-sm"
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors.textOnPrimary
                }}
              >
                {t('createNewProject')}
              </button>
              
              {projects.length > 0 && (
                <div className="flex space-x-2">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-1 p-2 text-sm border rounded-md"
                    style={{ 
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }}
                  >
                    <option value="">{t('selectAProject')}</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToProject}
                    disabled={!selectedProjectId}
                    className="py-2 px-4 rounded-md text-sm disabled:opacity-50"
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.textOnPrimary
                    }}
                  >
                    {t('add')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={t('projectName')}
                className="w-full p-2 text-sm border rounded-md"
                style={{ 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="flex-1 py-2 px-4 rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 py-2 px-4 rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.textOnPrimary
                  }}
                >
                  {t('create')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SavedCalculations.propTypes = {
  calculations: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired
};

export default SavedCalculations;
