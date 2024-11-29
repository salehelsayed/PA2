document.addEventListener('DOMContentLoaded', function() {
    const directoryTree = document.getElementById('directory-tree');
    const browseButton = document.getElementById('browse-button');
    const directoryInput = document.getElementById('directory-input');

    // Map to store file paths to file objects for quick access
    const fileMap = {};

    // Event listener for the "Load Directory" button
    browseButton.addEventListener('click', () => {
        // Trigger the hidden file input when the button is clicked
        directoryInput.click();
    });

    directoryInput.addEventListener('change', (event) => {
        // Handle directory selection and build the directory tree
        const files = event.target.files;
        const directoryData = [];

        // Convert FileList to array and sort it
        const sortedFiles = Array.from(files).sort((a, b) => {
            // Directories come first in the sorting
            const aIsDir = a.webkitRelativePath.split('/').length > 2;
            const bIsDir = b.webkitRelativePath.split('/').length > 2;
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.webkitRelativePath.localeCompare(b.webkitRelativePath);
        });

        // Build directory structure and populate fileMap
        sortedFiles.forEach(file => {
            const path = file.webkitRelativePath;
            fileMap[path] = file; // Store the file object in the map

            const parts = path.split('/');
            let currentLevel = directoryData;

            parts.forEach((part, index) => {
                if (index === 0) return; // Skip the root folder name

                let existingPath = currentLevel.find(item => item.name === part);
                if (!existingPath) {
                    existingPath = {
                        name: part,
                        type: index === parts.length - 1 ? 'file' : 'directory',
                        path: path,
                        children: []
                    };
                    currentLevel.push(existingPath);
                }
                currentLevel = existingPath.children;
            });
        });

        // Clear existing directory tree
        directoryTree.innerHTML = '';
        // Build the directory tree UI elements
        buildDirectoryTree(directoryData, directoryTree);
    });

    /**
     * Recursively builds the directory tree UI.
     * 
     * DO NOT MODIFY:
     * - The structure of this function, as it is critical for correctly displaying the directory tree.
     * - The class names and IDs used, as they are tied to CSS and other JS functions.
     * 
     * @param {Array} nodes - The directory or file nodes to be added.
     * @param {HTMLElement} parentElement - The parent DOM element to append the nodes to.
     */
    function buildDirectoryTree(nodes, parentElement) {
        nodes.forEach(node => {
            const item = document.createElement('div');
            item.classList.add('directory-item');

            if (node.type === 'directory') {
                // Create directory header with icons and name
                const header = document.createElement('div');
                header.classList.add('directory-header');
                header.innerHTML = `
                    <div class="directory-icon">
                        <i class="fas fa-chevron-right"></i>
                        <i class="fas fa-folder"></i>
                    </div>
                    <span class="directory-name">${node.name}</span>
                `;
                item.appendChild(header);

                // Container for child nodes (files and subdirectories)
                const childrenContainer = document.createElement('div');
                childrenContainer.classList.add('children-container');
                childrenContainer.style.display = 'none'; // Initially collapsed
                item.appendChild(childrenContainer);

                // Toggle display of child nodes on header click
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const chevron = header.querySelector('.fa-chevron-right');
                    const folder = header.querySelector('.fa-folder');
                    
                    if (childrenContainer.style.display === 'none') {
                        // Expand directory
                        childrenContainer.style.display = 'block';
                        chevron.style.transform = 'rotate(90deg)';
                        folder.classList.replace('fa-folder', 'fa-folder-open');
                    } else {
                        // Collapse directory
                        childrenContainer.style.display = 'none';
                        chevron.style.transform = 'rotate(0deg)';
                        folder.classList.replace('fa-folder-open', 'fa-folder');
                    }
                });

                // Recursively build the tree for child nodes
                buildDirectoryTree(node.children, childrenContainer);
            } else {
                // Create file item
                const fileItem = document.createElement('div');
                fileItem.classList.add('file-item');
                fileItem.innerHTML = `
                    <div class="file-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <span class="file-name">${node.name}</span>
                `;
                // Add click event to display file content
                fileItem.addEventListener('click', () => {
                    viewFileContent(node.path);
                });
                item.appendChild(fileItem);
            }
            parentElement.appendChild(item);
        });
    }

    /**
     * Finds a file object based on its file path.
     * 
     * @param {string} filePath - The relative path to the file.
     * @returns {File} The file object corresponding to the given path.
     * 
     * Constraints:
     * - Assumes fileMap is properly populated with file objects.
     */
    function findFileByPath(filePath) {
        return fileMap[filePath];
    }

    /**
     * Loads and displays the content of a selected file.
     * 
     * @param {string} filePath - The path of the file to view.
     * 
     * Important:
     * - Supports only text and Markdown files.
     * - Binary files are not supported and will result in unreadable content.
     */
    function viewFileContent(filePath) {
        const file = findFileByPath(filePath);

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const content = event.target.result;
                displayFileContent(content, file.name);
            };
            reader.readAsText(file);
        } else {
            alert('File not found.');
        }
    }

    /**
     * Displays the content of a file in the file view area.
     * 
     * @param {string} content - The content of the file.
     * @param {string} fileName - The name of the file.
     * 
     * Constraints:
     * - Expects the file-view elements to be present in the DOM.
     * - Relies on IDs 'chat-view', 'file-view', 'app-title', and 'file-name'.
     * 
     * DO NOT CHANGE:
     * - The DOM manipulation logic within this function.
     */
    function displayFileContent(content, fileName) {
        const chatView = document.getElementById('chat-view');
        const fileView = document.getElementById('file-view');
        const appTitle = document.getElementById('app-title');
        const fileNameElement = document.getElementById('file-name');
        
        // Hide chat view and show file view
        chatView.style.display = 'none';
        fileView.style.display = 'flex';
        appTitle.style.display = 'none';
        
        // Update and show the file name in the header
        fileNameElement.textContent = fileName;
        fileNameElement.style.display = 'block';
        
        const fileContentElement = document.getElementById('file-content');
        if (fileContentElement) {
            fileContentElement.innerHTML = '';
            
            if (fileName.toLowerCase().endsWith('.md')) {
                // Add the markdown-body class to the container
                fileContentElement.classList.add('markdown-body');
                // Configure marked options for GitHub-like rendering
                marked.setOptions({
                    gfm: true, // GitHub Flavored Markdown
                    breaks: true, // Add <br> on single line breaks
                    headerIds: true, // Add IDs to headers
                    mangle: false, // Don't escape HTML
                    highlight: function(code, lang) {
                        // Optional: Add syntax highlighting here
                        return code;
                    }
                });
                fileContentElement.innerHTML = marked.parse(content);
            } else {
                fileContentElement.classList.remove('markdown-body');
                const pre = document.createElement('pre');
                pre.textContent = content;
                fileContentElement.appendChild(pre);
            }
        }
    }

    /**
     * Restores the chat view when the user navigates back from the file view.
     * 
     * DO NOT MODIFY:
     * - The event listener attached to 'back-to-chat-btn'.
     * - The IDs used in this function.
     */
    function restoreChatView() {
        // Show chat elements and hide file elements
        const chatView = document.getElementById('chat-view');
        const fileView = document.getElementById('file-view');
        const appTitle = document.getElementById('app-title');
        const fileName = document.getElementById('file-name');
        
        chatView.style.display = 'flex';
        appTitle.style.display = 'block';
        fileView.style.display = 'none';
        fileName.style.display = 'none';
        
        // Clear file content to free up memory
        const fileContentElement = document.getElementById('file-content');
        if (fileContentElement) {
            fileContentElement.innerHTML = '';
        }
    }

    // Event listener for the 'Back to Chat' button
    document.getElementById('back-to-chat-btn').addEventListener('click', restoreChatView);
}); 