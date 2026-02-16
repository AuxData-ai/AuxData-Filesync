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

        container.innerHTML = protocols.map(protocol => `
            <div class="protocol-item">
                <table>
                    <tr>
                        <td><strong>File:</strong></td><td>${protocol.filename || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td><td>${protocol.lastState || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Timestamp:</strong></td><td>${protocol.lastUploaded ? new Date(protocol.lastUploaded).toLocaleString() : '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Agent ID:</strong></td><td>${protocol.agentid || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Container ID:</strong></td><td>${protocol.containerid || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Document ID:</strong></td><td>${protocol.documentId || '-'}</td>
                    </tr>
                    <tr>
                        ${protocol.message ? `<td><strong>Error:</strong></td><td>${protocol.message}</td>` : ''}
                    </tr>
                </table>
            </div>
        `).join('');
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