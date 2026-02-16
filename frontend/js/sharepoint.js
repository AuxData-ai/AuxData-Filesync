// SharePoint configuration management module
const SharePointManager = {
    modal: null,
    form: null,
    currentId: null,

    init() {
        this.modal = document.getElementById('sharepoint-modal');
        this.form = document.getElementById('sharepoint-form');
        
        document.getElementById('add-sharepoint-btn').addEventListener('click', () => this.openModal());
        document.getElementById('sharepoint-show-active-only').addEventListener('change', (e) => this.loadConfigs(e.target.checked));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.modal.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        this.loadConfigs();
    },

    async loadConfigs(activeOnly = false) {
        try {
            if (activeOnly) {
                const data = await api.sharepoint.getActive();
                this.renderTable(data);
            } else {
                    const data = await api.sharepoint.getAll();
                this.renderTable(data);
            }
        } catch (error) {
            alert('Failed to load SharePoint configs');
        }
    },

    renderTable(configs) {

         if (!configs) {
            const tbody = document.querySelector('#sharepoint-table tbody');
            tbody.innerHTML = `<tr><td colspan="9">no entries</td></tr>`
            return
        }

        const tbody = document.querySelector('#sharepoint-table tbody');

        tbody.innerHTML = configs.map(config => {
            const active = config.active ? '✓' : '✗';
            const recursive = config.includeSubDirs ? '✓' : '✗'
            return `
                <tr>
                    <td>${config.id}</td>
                    <td>${config.hostname}</td>
                    <td>${config.sitepath || '-'}</td>
                    <td>${config.folderpath || '-'}</td>
                    <td>${config.uploadconfig.agentId || '-'}</td>
                    <td>${config.uploadconfig.containerId || '-'}</td>
                    <td>${recursive}</td>
                    <td>${active}</td>
                    <td class="actions">
                        <button class="btn-primary btn-small" onclick="SharePointManager.edit(${config.id})">Edit</button>
                        <button class="btn-primary btn-small" onclick="SharePointManager.copy(${config.id})">Copy</button>
                        <button class="btn-danger btn-small" onclick="SharePointManager.delete(${config.id})">Delete</button>
                    </td>
                </tr>
            `;}).join('');
    },

    openModal(data = null) {
        this.currentId = data?.id || null;
        document.getElementById('sharepoint-modal-title').textContent = data ? 'Edit SharePoint Config' : 'Add SharePoint Config';
        document.getElementById('sharepoint-id').value = data?.id || '';
        document.getElementById('sharepoint-active').checked = data?.active || false;
        document.getElementById('sharepoint-host').value = data?.hostname || '';
        document.getElementById('sharepoint-site').value = data?.sitepath || '';
        document.getElementById('sharepoint-driveid').value = data?.driveid || '';
        document.getElementById('sharepoint-folder').value = data?.folderpath || '';
        document.getElementById('sharepoint-recursive').checked = data?.includeSubDirs || false;
        document.getElementById('sharepoint-tenant-id').value = data?.credentials.TenantId || '';
        document.getElementById('sharepoint-client-id').value = data?.credentials.ClientId || '';
        document.getElementById('sharepoint-client-secret').value = data?.credentials.ClientSecret || '';
        document.getElementById('sharepoint-platformurl').value = data?.uploadconfig.platformurl || 'https://auxdata.ai';
        document.getElementById('sharepoint-agentid').value = data?.uploadconfig.agentId || '';
        document.getElementById('sharepoint-containerid').value = data?.uploadconfig.containerId || '';
        document.getElementById('sharepoint-accesstoken').value = data?.uploadconfig.accessToken || '';
        document.getElementById('sharepoint-vision').checked = data?.uploadconfig.computerVision || false;
        
        this.modal.classList.add('active');
    },

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    },

    async handleSubmit(e) {
        e.preventDefault();

        const credentials = {
            ClientId: document.getElementById('sharepoint-client-id').value,
            ClientSecret: document.getElementById('sharepoint-client-secret').value,
            TenantId: document.getElementById('sharepoint-tenant-id').value,
        }

        const uploadconfig = {
            platformurl: document.getElementById('sharepoint-platformurl').value,
            agentId: parseInt(document.getElementById('sharepoint-agentid').value) || 0,
            containerId: parseInt(document.getElementById('sharepoint-containerid').value) || 0,
            accessToken: document.getElementById('sharepoint-accesstoken').value,
            computerVision: document.getElementById('sharepoint-vision').checked,
        }

        const data = {
            id: parseInt(document.getElementById('sharepoint-id').value) || 0,
            active: document.getElementById('sharepoint-active').checked,
            hostname: document.getElementById('sharepoint-host').value,
            sitepath: document.getElementById('sharepoint-site').value,
            driveid: document.getElementById('sharepoint-driveid').value,
            folderpath: document.getElementById('sharepoint-folder').value,
            includeSubDirs: document.getElementById('sharepoint-recursive').checked,
            credentials: credentials,
            uploadconfig: uploadconfig,
            
        };

        try {
            if (this.currentId) {
                data.Id = this.currentId;
                await api.sharepoint.update(this.currentId, data);
            } else {
                await api.sharepoint.create(data);
            }
            this.closeModal();
            this.loadConfigs();
        } catch (error) {
            alert('Failed to save SharePoint config');
        }
    },

    async edit(id) {
        try {
            const config = await api.sharepoint.getById(id);
            this.openModal(config);
        } catch (error) {
            alert('Failed to load SharePoint config');
        }
    },

    async copy(id) {
        try {
            const config = await api.sharepoint.getById(id);
            config.id = null;
            this.openModal(config);
        } catch (error) {
            alert('Failed to load SharePoint config');
        }
    },

    async delete(id) {
        if (!confirm('Delete this SharePoint configuration?')) return;
        try {
            await api.sharepoint.delete(id);
            this.loadConfigs();
        } catch (error) {
            alert('Failed to delete SharePoint config');
        }
    }
};