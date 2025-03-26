import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProjectPreview from './ProjectPreview';

const ProjectList = ({ projects, onCreateProject, onAddToProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showProjects, setShowProjects] = useState(true);

  // Log when projects change
  useEffect(() => {
    console.log('Projects in ProjectList:', projects);
  }, [projects]);

  const handleAddToProject = () => {
    if (selectedProjectId) {
      onAddToProject(selectedProjectId);
      setSelectedProjectId('');
    }
  };

  const handleCreateProject = () => {
    if (isCreating && newProjectName.trim()) {
      console.log('Creating project with name:', newProjectName.trim());
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    } else {
      setIsCreating(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Create New Project Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <h3 className="font-bold text-blue-800">Project Management</h3>
        </div>
        
        <div className="p-4">
          {isCreating ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project name"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Project
            </button>
          )}
        </div>
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Add to Existing Project</h3>
            <button 
              onClick={() => setShowProjects(!showProjects)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showProjects ? 'Hide' : 'Show'} ({projects.length})
            </button>
          </div>
          
          {showProjects && (
            <div className="divide-y divide-gray-100">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`cursor-pointer transition-all p-2 ${
                    selectedProjectId === project.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <ProjectPreview project={project} />
                </div>
              ))}
            </div>
          )}
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleAddToProject}
              disabled={!selectedProjectId}
              className="w-full py-3 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Selected Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      calculations: PropTypes.array.isRequired
    })
  ).isRequired,
  onCreateProject: PropTypes.func.isRequired,
  onAddToProject: PropTypes.func.isRequired
};

export default ProjectList;
