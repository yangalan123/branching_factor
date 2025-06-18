// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Lazy loading functionality for PDF figures only
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('.lazy-load');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const src = element.getAttribute('data-src');
                
                if (src && src.endsWith('.pdf')) {
                    renderPDFToElement(element, src);
                    element.removeAttribute('data-src');
                    observer.unobserve(element);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
    
    lazyElements.forEach(element => {
        observer.observe(element);
    });
}

// Render PDF to element
function renderPDFToElement(element, pdfUrl) {
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-canvas';
    element.innerHTML = '';
    element.appendChild(canvas);
    
    // Calculate container width for scaling
    const containerWidth = element.clientWidth || 800;
    
    pdfjsLib.getDocument(pdfUrl).promise
        .then(pdf => pdf.getPage(1))
        .then(page => {
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = containerWidth / viewport.width * 0.95;
            const scaledViewport = page.getViewport({ scale: scale });
            
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: scaledViewport
            };
            
            return page.render(renderContext);
        })
        .catch(error => {
            console.error(`Error rendering PDF ${pdfUrl}:`, error);
            element.innerHTML = '<div class="error-message">Error loading PDF</div>';
        });
}

// Initialize figure selectors for appendix
function initFigureSelectors() {
    // Find all figure groups that need selectors
    const figureGroups = document.querySelectorAll('.figure-group');
    
    figureGroups.forEach((group, groupIndex) => {
        const figures = group.querySelectorAll('d-figure');
        if (figures.length > 1) {
            // Create selector container
            const selectorContainer = document.createElement('div');
            selectorContainer.className = 'figure-selector';
            selectorContainer.style.cssText = `
                margin: 1rem 0;
                padding: 0.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            `;
            
            // Get group name from data attribute or use default
            const groupName = group.getAttribute('data-group-name') || `Figure Group ${groupIndex + 1}`;
            
            // Create label
            const label = document.createElement('label');
            label.textContent = `Select ${groupName}: `;
            label.style.cssText = `
                font-weight: 600;
                color: #495057;
                margin-right: 0.5rem;
            `;
            
            // Create select dropdown
            const select = document.createElement('select');
            select.style.cssText = `
                padding: 0.25rem 0.5rem;
                border: 1px solid #ced4da;
                border-radius: 4px;
                background: white;
                font-size: 0.9rem;
                min-width: 200px;
            `;
            
            // Add default "Select a figure" option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Select a figure --';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);
            
            // Add options for each figure
            figures.forEach((figure, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = figure.querySelector('figcaption')?.textContent || `Figure ${index + 1}`;
                select.appendChild(option);
            });
            
            // Add change event listener
            select.addEventListener('change', function() {
                const selectedIndex = this.value;
                
                if (selectedIndex === '') {
                    // Hide all figures if no selection
                    figures.forEach(fig => {
                        fig.style.display = 'none';
                    });
                } else {
                    // Show only the selected figure
                    figures.forEach((fig, idx) => {
                        fig.style.display = idx === parseInt(selectedIndex) ? 'block' : 'none';
                    });
                }
            });
            
            // Assemble selector
            selectorContainer.appendChild(label);
            selectorContainer.appendChild(select);
            
            // Insert selector before the figure group
            group.parentNode.insertBefore(selectorContainer, group);
            
            // Hide all figures initially
            figures.forEach(fig => {
                fig.style.display = 'none';
            });
        }
    });
    
    // Also handle any existing figure selectors in the appendix
    initAppendixFigureSelectors();
}

function initAppendixFigureSelectors() {
    // Initialize existing figure selectors in the appendix
    if (typeof window.showAEPFigure === 'function') {
        window.showAEPFigure();
    }
    if (typeof window.showBFDynamicsFigure === 'function') {
        window.showBFDynamicsFigure();
    }
    if (typeof window.showParetoFigure === 'function') {
        window.showParetoFigure();
    }
    if (typeof window.showNudgingFigure === 'function') {
        window.showNudgingFigure();
    }
}

// Legacy functions for backward compatibility
function showModule(moduleNumber) {
    // Hide all slides
    document.querySelectorAll('.module-slide').forEach(slide => {
        slide.classList.remove('active');
    });

    // Show selected slide
    document.getElementById('module-' + moduleNumber).classList.add('active');

    // Update button styling
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    const activeBtn = document.querySelectorAll('.slider-btn')[moduleNumber - 1];
    activeBtn.classList.add('active');
}

// Add this function for initializing and managing all carousels
function initCarousels() {
    // Initialize image carousels (Personalization Module)
    initImageCarousel('preference-carousel');

    // Initialize PDF carousels (AI-Simulation)
    initPDFCarousel('simulation-carousel');
}

// Function for image-based carousels
function initImageCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const buttons = carousel.querySelectorAll('.carousel-btn');

    // Set up click handlers for buttons
    buttons.forEach((button, index) => {
        button.onclick = function () {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show selected slide
            slides[index].classList.add('active');

            // Update button styling
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');
        };
    });
}

// Function for PDF-based carousels
function initPDFCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const buttons = carousel.querySelectorAll('.carousel-btn');

    // Render PDFs for this carousel
    renderCarouselPDFs(carouselId);

    // Set up click handlers for buttons
    buttons.forEach((button, index) => {
        button.onclick = function () {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show selected slide
            slides[index].classList.add('active');

            // Update button styling
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');
        };
    });
}

// Function to render PDFs specifically for a carousel
function renderCarouselPDFs(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    // Map of PDF configurations for this carousel
    const pdfConfigs = {
        'simulation-carousel': [
            { url: 'figures/user_simulation/shotwise_accuracy.pdf', canvasId: 'simulation-canvas-0' },
            { url: 'figures/user_simulation/accuracy_histogram.pdf', canvasId: 'simulation-canvas-1' },
            { url: 'figures/user_simulation/simulation_diagnostic.pdf', canvasId: 'simulation-canvas-2' }
        ]
    };

    // If no PDFs for this carousel, exit
    if (!pdfConfigs[carouselId]) return;

    // Calculate the width once
    const carouselWidth = carousel.querySelector('.carousel-container').clientWidth;

    // Render each PDF
    pdfConfigs[carouselId].forEach(config => {
        const canvas = document.getElementById(config.canvasId);
        if (!canvas) return;

        // Load and render PDF
        pdfjsLib.getDocument(config.url).promise
            .then(pdf => pdf.getPage(1))
            .then(page => {
                // Calculate scale based on carousel width
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = carouselWidth / viewport.width * 0.95;
                const scaledViewport = page.getViewport({ scale: scale });

                // Set canvas dimensions
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                // Render PDF
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: scaledViewport
                };

                page.render(renderContext);
            })
            .catch(error => {
                console.error(`Error rendering PDF ${config.url}:`, error);
            });
    });
}

// Replace the existing JavaScript functions
document.addEventListener('DOMContentLoaded', function () {
    // Initialize lazy loading for PDF figures
    initLazyLoading();
    
    // Initialize figure selectors
    initFigureSelectors();
    
    // Initialize carousels
    initCarousels();

    // Render standalone PDFs
    renderStandalonePDFs();

    // Initialize zoomable images
    initZoomableImages();

    // Initialize citations
    initCitations();
});

// Function to render standalone PDFs (not in carousels)
function renderStandalonePDFs() {
    const standalonePDFs = [
        { url: 'figures/AI-realtor.pdf', canvasId: 'pipeline-canvas' },
        { url: 'figures/elo_ratings_grouped.pdf', canvasId: 'elo-canvas' },
        { url: 'figures/model_hallucination_comparison.pdf', canvasId: 'hallucination-canvas' }
    ];

    standalonePDFs.forEach(config => {
        const canvas = document.getElementById(config.canvasId);
        if (!canvas) return;

        const container = canvas.closest('.pdf-container');
        if (!container) return;

        const containerWidth = container.clientWidth;

        // Load and render PDF
        pdfjsLib.getDocument(config.url).promise
            .then(pdf => pdf.getPage(1))
            .then(page => {
                // Calculate scale
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = containerWidth / viewport.width * 0.95;
                const scaledViewport = page.getViewport({ scale: scale });

                // Set canvas dimensions
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                // Render PDF
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: scaledViewport
                };

                page.render(renderContext);
            })
            .catch(error => {
                console.error(`Error rendering PDF ${config.url}:`, error);
            });
    });
}

function renderPDFToCanvas(page, canvas, container) {
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = container.clientWidth / viewport.width * 0.95;
    const scaledViewport = page.getViewport({ scale: scale });

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: scaledViewport
    };

    return page.render(renderContext);
}

function showPreferenceSlide(index) {
    const slides = document.querySelectorAll('.preference-slide');
    const buttons = document.querySelectorAll('.preference-btn');

    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Show selected slide
    slides[index].classList.add('active');

    // Update button styling
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    const activeBtn = document.querySelectorAll('.preference-btn')[index];
    activeBtn.classList.add('active');
}

function showSimulationSlide(index) {
    const slides = document.querySelectorAll('.simulation-slide');
    const buttons = document.querySelectorAll('.simulation-btn');

    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Show selected slide
    slides[index].classList.add('active');

    // Update button styling
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Get the clicked button
    const activeBtn = document.querySelectorAll('.simulation-btn')[index];
    activeBtn.classList.add('active');
}

function initZoomableImages() {
    const zoomableImages = document.querySelectorAll('.zoomable-image');
    
    zoomableImages.forEach(img => {
        img.addEventListener('click', function() {
            if (this.classList.contains('zoomed')) {
                this.classList.remove('zoomed');
            } else {
                this.classList.add('zoomed');
            }
        });
        
        img.addEventListener('mouseleave', function() {
            this.classList.remove('zoomed');
        });
    });
}

// Citation processing system
function initCitations() {
    // Parse bibliography.bib to extract citation data
    fetch('bibliography.bib')
        .then(response => response.text())
        .then(bibText => {
            const citations = parseBibTeX(bibText);
            processCitations(citations);
        })
        .catch(error => {
            console.error('Error loading bibliography:', error);
            // Fallback: process citations without bibliography
            processCitations({});
        });
}

function parseBibTeX(bibText) {
    const citations = {};
    const entries = bibText.split('@');
    
    entries.forEach(entry => {
        if (!entry.trim()) return;
        
        const lines = entry.split('\n');
        const firstLine = lines[0].trim();
        const typeMatch = firstLine.match(/^(\w+)\{([^,]+)/);
        
        if (typeMatch) {
            const type = typeMatch[1];
            const key = typeMatch[2];
            
            let title = '';
            let author = '';
            let year = '';
            let journal = '';
            let booktitle = '';
            let url = '';
            
            // Join all lines and extract fields
            const fullEntry = lines.join('\n');
            
            // Extract title
            const titleMatch = fullEntry.match(/title\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            if (titleMatch) {
                title = cleanBibTeXValue(titleMatch[1]);
            }
            
            // Extract author
            const authorMatch = fullEntry.match(/author\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            if (authorMatch) {
                author = cleanBibTeXValue(authorMatch[1]);
            }
            
            // Extract year
            const yearMatch = fullEntry.match(/year\s*=\s*\{([^}]+)\}/);
            if (yearMatch) {
                year = cleanBibTeXValue(yearMatch[1]);
            }
            
            // Extract journal
            const journalMatch = fullEntry.match(/journal\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            if (journalMatch) {
                journal = cleanBibTeXValue(journalMatch[1]);
            }
            
            // Extract booktitle
            const booktitleMatch = fullEntry.match(/booktitle\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            if (booktitleMatch) {
                booktitle = cleanBibTeXValue(booktitleMatch[1]);
            }
            
            // Extract url
            const urlMatch = fullEntry.match(/url\s*=\s*\{([^}]+)\}/);
            if (urlMatch) {
                url = cleanBibTeXValue(urlMatch[1]);
            }
            
            citations[key] = {
                type,
                title,
                author,
                year,
                journal,
                booktitle,
                url
            };
        }
    });
    
    return citations;
}

function cleanBibTeXValue(value) {
    if (!value) return '';
    
    // Remove LaTeX commands and braces
    let cleaned = value
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove LaTeX commands with braces
        .replace(/\\[a-zA-Z]+/g, '') // Remove simple LaTeX commands
        .replace(/\{[^}]*\}/g, '') // Remove remaining braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    return cleaned;
}

function processCitations(citations) {
    const citeElements = document.querySelectorAll('d-cite');
    const usedCitations = new Set();
    const citationOrder = [];
    const citationFirstAppearance = new Map(); // Track first appearance position
    
    // First pass: collect all used citations and track their first appearance
    let position = 0;
    citeElements.forEach(element => {
        const key = element.getAttribute('key');
        if (key && !usedCitations.has(key)) {
            usedCitations.add(key);
            citationOrder.push(key);
            citationFirstAppearance.set(key, position);
        }
        position++;
    });
    
    // Sort citations by their first appearance order
    citationOrder.sort((a, b) => citationFirstAppearance.get(a) - citationFirstAppearance.get(b));
    
    // Second pass: replace d-cite elements with citation numbers
    citeElements.forEach(element => {
        const key = element.getAttribute('key');
        if (key && citations[key]) {
            const citationNumber = citationOrder.indexOf(key) + 1;
            const citationSpan = document.createElement('span');
            citationSpan.className = 'citation';
            citationSpan.textContent = `[${citationNumber}]`;
            citationSpan.title = formatCitation(citations[key]);
            // Add click handler for cross-reference
            citationSpan.onclick = () => {
                showReferencedCitations([citationNumber]);
            };
            element.parentNode.replaceChild(citationSpan, element);
        } else {
            // Fallback for missing citations
            const citationSpan = document.createElement('span');
            citationSpan.className = 'citation';
            citationSpan.textContent = '[?]';
            citationSpan.title = `Citation not found: ${key}`;
            element.parentNode.replaceChild(citationSpan, element);
        }
    });
    
    // Create collapsible bibliography section
    createCollapsibleBibliography(citations, citationOrder);
}

function showReferencedCitations(citationNumbers) {
    const bibliographySection = document.querySelector('.bibliography-section');
    if (!bibliographySection) return;
    
    // Hide all bibliography items first
    const allItems = bibliographySection.querySelectorAll('.bibliography-list li');
    allItems.forEach(item => {
        item.style.display = 'none';
    });
    
    // Show only the referenced items
    citationNumbers.forEach(number => {
        const item = document.getElementById(`citation-${number}`);
        if (item) {
            item.style.display = 'block';
            // Highlight the item briefly
            item.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                item.style.backgroundColor = '';
            }, 2000);
        }
    });
    
    // Show the bibliography section if it's hidden
    bibliographySection.style.display = 'block';
    
    // Scroll to the bibliography
    bibliographySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Keep the title as "References" but add a subtitle showing which citations are displayed
    const header = bibliographySection.querySelector('h2');
    if (header) {
        header.textContent = 'References';
        
        // Remove existing subtitle if present
        const existingSubtitle = bibliographySection.querySelector('.references-subtitle');
        if (existingSubtitle) {
            existingSubtitle.remove();
        }
        
        // Add subtitle showing which citations are displayed
        if (citationNumbers.length > 0) {
            const subtitle = document.createElement('p');
            subtitle.className = 'references-subtitle';
            subtitle.style.fontSize = '0.9em';
            subtitle.style.color = '#666';
            subtitle.style.marginTop = '-10px';
            subtitle.style.marginBottom = '15px';
            subtitle.style.fontStyle = 'italic';
            
            const citationText = citationNumbers.length === 1 ? 
                `Showing reference [${citationNumbers[0]}]` : 
                `Showing references [${citationNumbers.join('], [')}]`;
            subtitle.textContent = citationText;
            
            // Insert subtitle after the header
            header.parentNode.insertBefore(subtitle, header.nextSibling);
        }
    }
}

function createCollapsibleBibliography(citations, citationOrder) {
    // Remove existing bibliography if present
    const existingBib = document.querySelector('.bibliography-section');
    if (existingBib) {
        existingBib.remove();
    }
    
    const bibliographySection = document.createElement('section');
    bibliographySection.className = 'bibliography-section';
    bibliographySection.style.display = 'none'; // Initially hidden
    
    const header = document.createElement('h2');
    header.textContent = 'References';
    header.style.cursor = 'pointer';
    header.onclick = () => {
        toggleFullBibliography();
    };
    header.title = 'Click to show all references';
    
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.textContent = ' ▼';
    toggleIcon.style.fontSize = '0.8em';
    toggleIcon.style.marginLeft = '10px';
    header.appendChild(toggleIcon);
    
    bibliographySection.appendChild(header);
    
    const bibliographyList = document.createElement('ol');
    bibliographyList.className = 'bibliography-list';
    
    citationOrder.forEach((key, index) => {
        const citation = citations[key];
        if (citation) {
            const listItem = document.createElement('li');
            listItem.id = `citation-${index + 1}`;
            listItem.style.display = 'none'; // Initially hidden
            listItem.innerHTML = formatBibliographyEntry(citation);
            bibliographyList.appendChild(listItem);
        }
    });
    
    bibliographySection.appendChild(bibliographyList);
    
    // Insert bibliography before the appendix
    const appendix = document.querySelector('#appendix');
    if (appendix) {
        appendix.parentNode.insertBefore(bibliographySection, appendix);
    } else {
        // Fallback: append to the end of the article
        const article = document.querySelector('d-article');
        if (article) {
            article.appendChild(bibliographySection);
        }
    }
    
    // Store reference to toggle function
    window.toggleFullBibliography = function() {
        const allItems = bibliographySection.querySelectorAll('.bibliography-list li');
        const isHidden = allItems[0] && allItems[0].style.display === 'none';
        
        allItems.forEach(item => {
            item.style.display = isHidden ? 'block' : 'none';
        });
        
        const header = bibliographySection.querySelector('h2');
        const toggleIcon = bibliographySection.querySelector('.toggle-icon');
        const existingSubtitle = bibliographySection.querySelector('.references-subtitle');
        
        if (isHidden) {
            header.textContent = 'References';
            toggleIcon.textContent = ' ▲';
            header.title = 'Click to hide all references';
            
            // Remove subtitle when showing all references
            if (existingSubtitle) {
                existingSubtitle.remove();
            }
        } else {
            header.textContent = 'References';
            toggleIcon.textContent = ' ▼';
            header.title = 'Click to show all references';
            
            // Remove subtitle when hiding all references
            if (existingSubtitle) {
                existingSubtitle.remove();
            }
        }
    };
}

function formatCitation(citation) {
    let formatted = '';
    if (citation.title) {
        formatted += citation.title;
    }
    if (citation.author) {
        formatted += ` by ${citation.author}`;
    }
    if (citation.year) {
        formatted += ` (${citation.year})`;
    }
    if (citation.journal) {
        formatted += `. ${citation.journal}`;
    } else if (citation.booktitle) {
        formatted += `. ${citation.booktitle}`;
    }
    return formatted;
}

function formatBibliographyEntry(citation) {
    let entry = '';
    
    // Start with title (no bold)
    if (citation.title) {
        entry += `<em>${citation.title}</em>`;
    }
    
    // Add authors (no bold)
    if (citation.author) {
        entry += `. ${citation.author}`;
    }
    
    // Add year
    if (citation.year) {
        entry += ` (${citation.year})`;
    }
    
    // Add venue
    if (citation.journal) {
        entry += `. ${citation.journal}`;
    } else if (citation.booktitle) {
        entry += `. ${citation.booktitle}`;
    }
    
    // Add URL if available
    if (citation.url) {
        entry += `. <a href="${citation.url}" target="_blank">${citation.url}</a>`;
    }
    
    return entry;
}
