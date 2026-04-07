const ProtocolManager = {
    init() {
        document.getElementById('refresh-protocol-btn').addEventListener('click', () => {
            this.loadProtocols();
        });
        this.loadProtocols();
    },

    async loadProtocols() {
        const container = document.getElementById('protocols-list');
        container.innerHTML = '<p>Loading...</p>';

        try {
            const protocols = await api.protocols.getAll();
            this.render(protocols || []);
        } catch (err) {
            container.innerHTML = `<p class="error-message">Failed to load protocols: ${this.escapeHtml(err.message)}</p>`;
        }
    },

    render(protocols) {
        const container = document.getElementById('protocols-list');

        if (protocols.length === 0) {
            container.innerHTML = '<p>No upload protocols found.</p>';
            return;
        }

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
                            <td class="protocol-filename">${this.escapeHtml(p.filename)}</td>
                            <td><span class="protocol-state protocol-state-${this.escapeHtml(p.lastState)}">${this.escapeHtml(p.lastState)}</span></td>
                            <td class="log-timestamp">${p.lastUploaded ? new Date(p.lastUploaded).toLocaleString() : '—'}</td>
                            <td>${this.escapeHtml(p.message || '')}</td>
                            <td><span class="protocol-dir">${this.escapeHtml(p.directoryid || '')}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(String(text)));
        return div.innerHTML;
    }
};
