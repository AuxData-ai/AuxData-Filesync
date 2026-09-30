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
        document.getElementById('directory-splitbysubdir').addEventListener('change', () => this.syncContainerIdRequirement());
        document.getElementById('btn-context-refresh').addEventListener('click', () => this.refreshContext());
        document.getElementById('btn-path-preview').addEventListener('click', () => this.previewPathMigration());
        document.getElementById('btn-path-apply').addEventListener('click', () => this.applyPathMigration());
        // Any edit to the target path invalidates the last "Check" result -
        // "Move" must stay locked until a fresh preview confirms the new value.
        document.getElementById('directory-newpath').addEventListener('input', () => {
            document.getElementById('btn-path-apply').disabled = true;
        });

        // Close modal
        this.modal.querySelector('.close').addEventListener('click', () => this.closeModal());

        this.loadDirectories();
    },

    // With "one container per subfolder" the containers are created on the fly,
    // so the container id is only the fallback for files lying directly in the
    // configured path. Demanding it up front would block exactly the setup the
    // split mode exists for.
    syncContainerIdRequirement() {
        const split = document.getElementById('directory-splitbysubdir').checked;
        document.getElementById('directory-containerid').required = !split;
        document.getElementById('directory-containerid-hint').textContent =
            split ? '(optional — only used for files directly in the path)' : '';
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
            tbody.innerHTML = `<tr><td  colspan="8">no entries</td></tr>`
            return
        }

        const tbody = document.querySelector('#directories-table tbody');
        tbody.innerHTML = directories.map(dir => {
            const active = dir.active ? '✓' : '✗';
            const recursive = dir.includeSubDirs ? '✓' : '✗'
            return `
            <tr>
                <td>${dir.id}</td>
                <td>${dir.name || dir.path || '-'}</td>
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
        document.getElementById('directory-name').value = data?.name || '';
        document.getElementById('directory-path').value = data?.path || '';
        document.getElementById('directory-webLinkPrefix').value = data?.webLinkPrefix || '';
        document.getElementById('directory-recursive').checked = data?.includeSubDirs || false;
        document.getElementById('directory-splitbysubdir').checked = data?.splitBySubDir || false;
        document.getElementById('directory-sharedcontainer').value = data?.sharedContainerName || '';
        document.getElementById('directory-sharedthreshold').value = data?.sharedThreshold || 2;
        document.getElementById('directory-metadatatemplate').value = data?.metadataTemplate ?? 'Produkt: ${ordner} | Dokument: ${dateiname}';
        document.getElementById('directory-maxlistedproducts').value = data?.maxListedProducts ?? 10;
        document.getElementById('directory-uploadconcurrency').value = data?.uploadConcurrency || 4;
        document.getElementById('directory-active').checked = data?.active || false;
        document.getElementById('directory-platformurl').value = data?.uploadconfig.platformurl || 'https://auxdata.ai';
        document.getElementById('directory-agentid').value = data?.uploadconfig.agentId || '';
        document.getElementById('directory-containerid').value = data?.uploadconfig.containerId || '';
        document.getElementById('directory-accesstoken').value = data?.uploadconfig.accessToken || '';
        document.getElementById('directory-vision').checked = data?.uploadconfig.computerVision || false;
        document.getElementById('directory-includepatterns').value = (data?.includePatterns || []).join('\n');
        document.getElementById('directory-excludepatterns').value = (data?.excludePatterns || []).join('\n');
        this.syncContainerIdRequirement();

        // Re-apply context and path migration act on an already-saved directory
        // - there is nothing to operate on until "Add Directory" has been saved
        // once and reopened for editing.
        document.getElementById('btn-context-refresh').disabled = !this.currentId;
        document.getElementById('btn-path-preview').disabled = !this.currentId;
        document.getElementById('directory-newpath').value = '';
        document.getElementById('path-migration-result').textContent = '';
        document.getElementById('btn-path-apply').disabled = true;

        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    },

    async handleSubmit(e) {
        e.preventDefault();
        const splitPatterns = (id) => document.getElementById(id).value
            .split('\n').map(s => s.trim()).filter(s => s.length > 0);

         const uploadconfig = {
            platformurl: document.getElementById('directory-platformurl').value,
            agentId: parseInt(document.getElementById('directory-agentid').value) || 0,
            containerId: parseInt(document.getElementById('directory-containerid').value) || 0,
            accessToken: document.getElementById('directory-accesstoken').value,
            computerVision: document.getElementById('directory-vision').checked,
        }

        const data = {
            id: parseInt(document.getElementById('directory-id').value) || 0,
            name: document.getElementById('directory-name').value,
            webLinkPrefix: document.getElementById('directory-webLinkPrefix').value,
            path: document.getElementById('directory-path').value,
            includeSubDirs: document.getElementById('directory-recursive').checked,
            splitBySubDir: document.getElementById('directory-splitbysubdir').checked,
            sharedContainerName: document.getElementById('directory-sharedcontainer').value,
            sharedThreshold: parseInt(document.getElementById('directory-sharedthreshold').value) || 0,
            metadataTemplate: document.getElementById('directory-metadatatemplate').value,
            maxListedProducts: parseInt(document.getElementById('directory-maxlistedproducts').value, 10) || 0,
            uploadConcurrency: parseInt(document.getElementById('directory-uploadconcurrency').value) || 1,
            active: document.getElementById('directory-active').checked,
            includePatterns: splitPatterns('directory-includepatterns'),
            excludePatterns: splitPatterns('directory-excludepatterns'),
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
    },

    async refreshContext() {
        if (!this.currentId) return;
        if (!confirm('Re-label all existing documents of this directory with the current metadata template on the next run?')) return;
        try {
            await api.directories.triggerContextRefresh(this.currentId);
            alert('Context refresh armed for the next run.');
        } catch (error) {
            alert('Failed to arm context refresh');
        }
    },

    async previewPathMigration() {
        if (!this.currentId) return;
        const resultEl = document.getElementById('path-migration-result');
        const newPath = document.getElementById('directory-newpath').value.trim();
        document.getElementById('btn-path-apply').disabled = true;
        if (!newPath) {
            resultEl.textContent = 'Enter a new path first.';
            return;
        }
        try {
            const result = await api.directories.previewPathMigration(this.currentId, newPath);
            resultEl.textContent = `${result.existing} of ${result.sampled} sampled paths exist (${result.affected} rows affected).`;
            document.getElementById('btn-path-apply').disabled = false;
        } catch (error) {
            resultEl.textContent = 'Failed to preview path migration.';
        }
    },

    async applyPathMigration() {
        if (!this.currentId) return;
        const newPath = document.getElementById('directory-newpath').value.trim();
        if (!newPath) return;
        if (!confirm(`Move base path to "${newPath}"? This rewrites the stored file paths.`)) return;
        const resultEl = document.getElementById('path-migration-result');
        try {
            const result = await api.directories.applyPathMigration(this.currentId, newPath);
            resultEl.textContent = `Moved: ${result.changed} rows updated.`;
            document.getElementById('directory-path').value = result.path;
            document.getElementById('btn-path-apply').disabled = true;
        } catch (error) {
            resultEl.textContent = 'Failed to apply path migration.';
        }
    }
};