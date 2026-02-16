// Directory management module
const DirectoryManager = {
    modal: null,
    form: null,
    currentId: null,

    init() {
        this.modal = document.getElementById('directory-modal');
        this.form = document.getElementById('directory-form');
        
        // Event listeners
        document.getElementById('add-directory-btn').addEventListener('click', () => this.openModal());
        document.getElementById('show-active-only').addEventListener('change', (e) => this.loadDirectories(e.target.checked));
        document.getElementById('directory-form').addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal
        this.modal.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        this.loadDirectories();
    },

    async loadDirectories(activeOnly = false) {
        try {
            const data = activeOnly ? await api.directories.getActive() : await api.directories.getAll();
            this.renderTable(data);
        } catch (error) {
            alert('Failed to load directories');
        }
    },

    renderTable(directories) {

        if (!directories) {
            const tbody = document.querySelector('#directories-table tbody');
            tbody.innerHTML = `<tr><td  colspan="7">no entries</td></tr>`
            return
        }

        const tbody = document.querySelector('#directories-table tbody');
        tbody.innerHTML = directories.map(dir => {
            const active = dir.active ? '✓' : '✗';
            const recursive = dir.includeSubDirs ? '✓' : '✗'
            return `
            <tr>
                <td>${dir.id}</td>
                <td>${dir.path || '-'}</td>
                <td>${dir.uploadconfig.agentId || '-'}</td>
                <td>${dir.uploadconfig.containerId || '-'}</td>
                <td>${recursive}</td>
                <td>${active}</td>
                <td class="actions">
                    <button class="btn-primary btn-small" onclick="DirectoryManager.edit(${dir.id})">Edit</button>
                    <button class="btn-primary btn-small" onclick="DirectoryManager.copy(${dir.id})">Copy</button>
                    <button class="btn-danger btn-small" onclick="DirectoryManager.delete(${dir.id})">Delete</button>
                </td>
            </tr>
        `}).join('');
    },

      openModal(data = null) {
        this.currentId = data?.id || null;
        document.getElementById('directory-modal-title').textContent = data ? 'Edit Directory' : 'Add Directory';
        document.getElementById('directory-id').value = data?.id || '';
        document.getElementById('directory-path').value = data?.path || '';
        document.getElementById('directory-webLinkPrefix').value = data?.webLinkPrefix || '';
        document.getElementById('directory-recursive').checked = data?.includeSubDirs || false;
        document.getElementById('directory-active').checked = data?.active || false;
        document.getElementById('directory-platformurl').value = data?.uploadconfig.platformurl || 'https://auxdata.ai';
        document.getElementById('directory-agentid').value = data?.uploadconfig.agentId || '';
        document.getElementById('directory-containerid').value = data?.uploadconfig.containerId || '';
        document.getElementById('directory-accesstoken').value = data?.uploadconfig.accessToken || '';
        document.getElementById('directory-vision').checked = data?.uploadconfig.computerVision || false;
        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    },

    async handleSubmit(e) {
        e.preventDefault();

         const uploadconfig = {
            platformurl: document.getElementById('directory-platformurl').value,
            agentId: parseInt(document.getElementById('directory-agentid').value) || 0,
            containerId: parseInt(document.getElementById('directory-containerid').value) || 0,
            accessToken: document.getElementById('directory-accesstoken').value,
            computerVision: document.getElementById('directory-vision').checked,
        }

        const data = {
            id: parseInt(document.getElementById('directory-id').value) || 0,
            webLinkPrefix: document.getElementById('directory-webLinkPrefix').value,
            path: document.getElementById('directory-path').value,
            includeSubDirs: document.getElementById('directory-recursive').checked,
            active: document.getElementById('directory-active').checked,
            uploadconfig: uploadconfig,
        };

        try {
            if (this.currentId) {
                await api.directories.update(this.currentId, data);
            } else {
                await api.directories.create(data);
            }
            this.closeModal();
            this.loadDirectories();
        } catch (error) {
            alert('Failed to save directory');
        }
    },

    async edit(id) {
        try {
            const directories = await api.directories.getAll();
            const directory = directories.find(d => d.id === id);
            this.openModal(directory);
        } catch (error) {
            alert('Failed to load directory');
        }
    },

    async copy(id) {
        try {
            const directories = await api.directories.getAll();
            const directory = directories.find(d => d.id === id);
            directory.id = null;
            this.openModal(directory);
        } catch (error) {
            alert('Failed to load directory');
        }
    },

    async delete(id) {
        if (!confirm('Delete this directory?')) return;
        try {
            await api.directories.delete(id);
            this.loadDirectories();
        } catch (error) {
            alert('Failed to delete directory');
        }
    }
};