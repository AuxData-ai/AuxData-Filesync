// Sync management module
const SyncManager = {
    statusDiv: null,

    init() {
        this.statusDiv = document.getElementById('sync-status');
        document.getElementById('execute-sync-btn').addEventListener('click', () => this.executeSync());
        document.getElementById('refresh-protocol-btn').addEventListener('click', () => this.loadProtocols());
        this.loadProtocols();
    },

    async executeSync() {
        this.showStatus('Executing synchronization...', 'info');
        try {
            await api.sync.execute();
            this.showStatus('Synchronization started and runs in background', 'success');
            setTimeout(() => this.loadProtocols(), 1000);
        } catch (error) {
            this.showStatus('Synchronization failed: ' + error.message, 'error');
        }
    },

    async loadProtocols() {
        try {
            const protocols = await api.protocols.getAll();
            this.renderProtocols(protocols);
        } catch (error) {
            console.error('Failed to load protocols:', error);
        }
    },

    renderProtocols(protocols) {
        const container = document.getElementById('protocols-list');
        if (!protocols || protocols.length === 0) {
            container.innerHTML = '<p>No upload protocols found.</p>';
            return;
        }

        const escape = text => {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(String(text ?? '')));
            return div.innerHTML;
        };

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>State</th>
                        <th>Last Uploaded</th>
                        <th>Message</th>
                        <th>Directory</th>
                    </tr>
                </thead>
                <tbody>
                    ${protocols.map(p => `
                        <tr>
                            <td class="protocol-filename">${escape(p.filename)}</td>
                            <td><span class="protocol-state protocol-state-${escape(p.lastState)}">${escape(p.lastState)}</span></td>
                            <td class="log-timestamp">${p.lastUploaded ? new Date(p.lastUploaded).toLocaleString() : '—'}</td>
                            <td>${escape(p.message)}</td>
                            <td class="protocol-dir">${escape(p.directoryid)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status-message ${type}`;
        if (type !== 'info') {
            setTimeout(() => {
                this.statusDiv.className = 'status-message';
            }, 5000);
        }
    }
};