import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import ProjectModal from './ProjectModal';
import { loadProjects, deleteProject, saveProject, deleteCalculationFromProject } from '../../utils/projects';
import CalculationPreview from '../project/CalculationPreview';
import { useLanguage } from '../../contexts/LanguageContext';

const ProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Load projects using the utility function
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
    
    // Select the first project by default if available
    if (loadedProjects.length > 0 && !selectedProject) {
      setSelectedProject(loadedProjects[0]);
    }
  }, []);

  const handleSaveProject = (project) => {
    console.log('Handling project save:', project);
    // Use the utility function to save the project
    const updatedProjects = saveProject(project);
    
    if (updatedProjects) {
      console.log('Projects updated successfully:', updatedProjects);
      setProjects(updatedProjects);
      
      // If we're editing the currently selected project, update it
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject(project);
      } else if (!selectedProject && updatedProjects.length > 0) {
        // If no project is selected and we just created a new one, select it
        setSelectedProject(updatedProjects[0]);
      }
    } else {
      console.error('Failed to update projects');
    }
    
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm(t('confirmDeleteProject'))) {
      // Use the utility function to delete the project
      const updatedProjects = deleteProject(projectId);
      if (updatedProjects) {
        setProjects(updatedProjects);
        
        // If we're deleting the currently selected project, clear the selection
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
          setShowProjectDetails(false);
        }
      }
    }
  };

  const handleDeleteCalculation = (calculationId) => {
    if (window.confirm(t('confirmDeleteCalculation') || 'Are you sure you want to delete this calculation?')) {
      if (selectedProject) {
        const updatedProjects = deleteCalculationFromProject(selectedProject.id, calculationId);
        if (updatedProjects) {
          setProjects(updatedProjects);
          // Update the selected project with the updated version
          const updatedSelectedProject = updatedProjects.find(p => p.id === selectedProject.id);
          setSelectedProject(updatedSelectedProject);
        }
      }
    }
  };

  // Format date to match the screenshot
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/${date.getFullYear()}`;
  };

  // Format date for the detailed view
  const formatDetailDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  // Format time for the header
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${hours}:${minutes} ${ampm}`;
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleBackToList = () => {
    setShowProjectDetails(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      <div className="p-3 sm:p-4 flex justify-between items-center border-b" style={{ borderColor: theme.colors.border }}>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>{t('myProjects')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-3 sm:px-4 font-medium rounded-md transition-colors flex items-center"
          style={{ 
            backgroundColor: theme.colors.primary,
            color: theme.colors.textOnPrimary
          }}
        >
          <span className="mr-1">+</span> {t('newProject')}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col sm:flex-row p-2 sm:p-4 gap-3 sm:gap-4">
        {/* Mobile Back Button - Only shown when viewing project details on mobile */}
        {showProjectDetails && (
          <div className="sm:hidden mb-2">
            <button
              onClick={handleBackToList}
              className="flex items-center py-2 px-3 rounded-md text-sm"
              style={{ 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('backToProjects')}
            </button>
          </div>
        )}

        {/* Projects List - Hidden on mobile when viewing project details */}
        <div 
          className={`${showProjectDetails ? 'hidden sm:block' : 'block'} sm:w-1/3 overflow-y-auto rounded-lg border`}
          style={{ 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <div className="p-3 border-b" style={{ 
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.border
          }}>
            <h2 className="font-semibold" style={{ color: theme.colors.textOnPrimary }}>
              {t('allProjects')} ({projects.length})
            </h2>
          </div>
          
          <div className="divide-y" style={{ borderColor: theme.colors.border }}>
            {projects.length === 0 ? (
              <div className="p-8 text-center" style={{ color: theme.colors.textLight }}>
                <p>{t('noProjectsYet')}</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 py-2 px-4 rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.textOnPrimary
                  }}
                >
                  {t('createFirstProject')}
                </button>
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  className={`p-3 sm:p-4 cursor-pointer transition-colors`}
                  style={{ 
                    backgroundColor: selectedProject?.id === project.id ? theme.colors.background : 'transparent',
                    borderLeft: selectedProject?.id === project.id ? `4px solid ${theme.colors.primary}` : '4px solid transparent'
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium" style={{ color: theme.colors.text }}>
                        {project.name}
                      </h3>
                      <p className="text-xs sm:text-sm" style={{ color: theme.colors.textLight }}>
                        {formatDate(project.createdAt)}
                      </p>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: theme.colors.textLight }}>
                        {project.calculations.length} {project.calculations.length === 1 ? t('item') : t('items')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-full hover:opacity-80"
                        style={{ color: theme.colors.secondary }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-2 rounded-full hover:opacity-80"
                        style={{ color: theme.colors.danger }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Details - Hidden on mobile when viewing project list */}
        <div 
          className={`${!showProjectDetails && selectedProject ? 'hidden sm:block' : selectedProject ? 'block' : 'hidden sm:block'} flex-1 overflow-y-auto border rounded-lg`}
          style={{ borderColor: theme.colors.border }}
        >
          {selectedProject ? (
            <div>
              <div className="p-3 sm:p-4 flex justify-between items-center border-b" style={{ borderColor: theme.colors.border }}>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: theme.colors.text }}>{selectedProject.name}</h2>
                  <div className="text-xs sm:text-sm" style={{ color: theme.colors.textLight }}>
                    {formatTime(selectedProject.createdAt)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingProject(selectedProject);
                      setShowModal(true);
                    }}
                    className="py-1 px-2 sm:px-3 text-sm rounded-md"
                    style={{ 
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.textOnPrimary
                    }}
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="py-1 px-2 sm:px-3 text-sm rounded-md"
                    style={{ 
                      backgroundColor: theme.colors.danger,
                      color: theme.colors.textOnPrimary
                    }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                  <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>{t('items')}</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>{selectedProject.calculations.length}</div>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                  <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>{t('weight')}</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>
                    {selectedProject.calculations.reduce((sum, calc) => sum + calc.weight * calc.quantity, 0).toFixed(2)} kg
                  </div>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                  <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>{t('totalValue')}</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>
                    ${selectedProject.calculations.reduce((sum, calc) => sum + calc.totalPrice, 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              {selectedProject.description && (
                <div className="px-3 sm:px-4 py-2">
                  <div className="text-xs uppercase font-medium mb-1" style={{ color: theme.colors.textLight }}>{t('description')}</div>
                  <div className="p-3 rounded-md" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
                    {selectedProject.description}
                  </div>
                </div>
              )}

              {/* Project Calculations */}
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs uppercase font-medium" style={{ color: theme.colors.textLight }}>{t('calculations')}</div>
                </div>
                
                {selectedProject.calculations.length === 0 ? (
                  <div className="text-center py-8" style={{ color: theme.colors.textLight }}>
                    {t('noCalculationsInProject')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.calculations.map((calc) => (
                      <CalculationPreview key={calc.id} calculation={calc} onDelete={() => handleDeleteCalculation(calc.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center" style={{ color: theme.colors.textLight }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-base sm:text-lg font-medium mb-2">{t('noProjectSelected')}</p>
              <p className="mb-4 text-sm sm:text-base">{t('selectProjectOrCreate')}</p>
              <button
                onClick={() => setShowModal(true)}
                className="py-2 px-4 rounded-md"
                style={{ 
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.textOnPrimary
                }}
              >
                {t('createNewProject')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsView;
