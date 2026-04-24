import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');

titleElement.textContent = `${projects.length} Projects`;

renderProjects(projects, projectsContainer, 'h2');