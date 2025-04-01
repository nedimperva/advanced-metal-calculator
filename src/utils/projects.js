const PROJECTS_KEY = 'metalCalculator.projects';

export const loadProjects = () => {
  try {
    const saved = localStorage.getItem(PROJECTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveProject = (project) => {
  try {
    // Load existing projects
    const projects = loadProjects();
    console.log('Current projects:', projects);
    
    // Create new project object with all required fields
    const newProject = {
      ...project,
      id: project.id || Date.now().toString(),
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calculations: project.calculations || []
    };

    console.log('New project to save:', newProject);

    // Check if this is a new project or an update
    const existingProjectIndex = projects.findIndex(p => p.id === project.id);
    let updatedProjects;
    
    if (existingProjectIndex >= 0) {
      // Update existing project
      updatedProjects = [...projects];
      updatedProjects[existingProjectIndex] = newProject;
    } else {
      // Add new project to the beginning of the array
      updatedProjects = [newProject, ...projects];
    }

    console.log('Updated projects array before save:', updatedProjects);
    
    // Save to localStorage
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    
    // Return the updated projects array
    return updatedProjects;
  } catch (error) {
    console.error('Error saving project:', error);
    return null;
  }
};

export const deleteProject = (id) => {
  try {
    const projects = loadProjects();
    const updatedProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    return updatedProjects;
  } catch (error) {
    console.error('Error deleting project:', error);
    return null;
  }
};

export const addCalculationsToProject = (projectId, calculations) => {
  try {
    const projects = loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const updatedProject = {
      ...project,
      calculations: [...project.calculations, ...calculations],
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = projects.map(p => 
      p.id === projectId ? updatedProject : p
    );

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    return updatedProjects;
  } catch (error) {
    console.error('Error adding calculations to project:', error);
    return null;
  }
};

export const groupCalculationsByType = (calculations) => {
  return calculations.reduce((groups, calc) => {
    const type = calc.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(calc);
    return groups;
  }, {});
};

export const deleteCalculationFromProject = (projectId, calculationId) => {
  try {
    const projects = loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const updatedProject = {
      ...project,
      calculations: project.calculations.filter(calc => calc.id !== calculationId),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = projects.map(p => 
      p.id === projectId ? updatedProject : p
    );

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    return updatedProjects;
  } catch (error) {
    console.error('Error deleting calculation from project:', error);
    return null;
  }
};
