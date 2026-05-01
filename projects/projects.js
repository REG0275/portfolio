import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');

titleElement.textContent = `${projects.length} Projects`;

let query = '';
let selectedYear = null;

updateDisplay();

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    updateDisplay();
});

function updateDisplay() {
    let searchFilteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    let visibleProjects = selectedYear
        ? searchFilteredProjects.filter((project) => String(project.year) === String(selectedYear))
        : searchFilteredProjects;

    renderProjects(visibleProjects, projectsContainer, 'h2');
    renderPieChart(searchFilteredProjects);
}

function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal([
        '#2ca02c', // green
        '#a6d96a', // light green
        '#1f77b4', // blue
        '#9ecae1', // light blue
    ]);

    let svg = d3.select('#projects-pie-plot');
    let legend = d3.select('.legend');

    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    arcs.forEach((arc, idx) => {
        let year = data[idx].label;

        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .classed('selected', String(year) === String(selectedYear))
            .on('click', () => {
                selectedYear = String(selectedYear) === String(year) ? null : year;
                updateDisplay();
            });
    });

    data.forEach((d, idx) => {
        legend
            .append('li')
            .attr('class', 'legend-item')
            .classed('selected', String(d.label) === String(selectedYear))
            .attr('style', `--color: ${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => {
                selectedYear = String(selectedYear) === String(d.label) ? null : d.label;
                updateDisplay();
            });
    });
}