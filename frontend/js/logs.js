const LogsManager = {
    currentOffset: 0,
    limit: 200,
    showDetails: false,
    _lastLogs: [],
    _lastTotal: 0,

    init() {
        const today = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        document.getElementById('logs-from').value = `${dateStr}T07:30`;
        document.getElementById('logs-to').value   = `${dateStr}T18:00`;

        document.getElementById('load-logs-btn').addEventListener('click', () => {
            this.currentOffset = 0;
            this.loadLogs();
        });
        document.getElementById('logs-prev-btn').addEventListener('click', () => {
            this.currentOffset = Math.max(0, this.currentOffset - this.limit);
            this.loadLogs();
        });
        document.getElementById('logs-next-btn').addEventListener('click', () => {
            this.currentOffset += this.limit;
            this.loadLogs();
        });
        document.getElementById('logs-toggle-details-btn').addEventListener('click', () => {
            this.showDetails = !this.showDetails;
            document.getElementById('logs-toggle-details-btn').textContent =
                this.showDetails ? 'Hide Details' : 'Show Details';
            this.renderTable(this._lastLogs, this._lastTotal);
        });

        document.getElementById('logs-delete-btn').addEventListener('click', () => {
            this.deleteLogs();
        });
    },

    async deleteLogs() {
        const beforeVal = document.getElementById('logs-delete-before').value;
        const statusEl = document.getElementById('logs-delete-status');

        if (!beforeVal) {
            statusEl.textContent = 'Please select a date/time.';
            statusEl.className = 'logs-delete-error';
            return;
        }

        const before = new Date(beforeVal).toISOString();
        statusEl.textContent = 'Deleting…';
        statusEl.className = '';

        try {
            const result = await api.logs.deleteBefore(before);
            statusEl.textContent = `${result.deleted} entr${result.deleted === 1 ? 'y' : 'ies'} deleted.`;
            statusEl.className = 'logs-delete-ok';
            // Reload current view if logs are displayed
            if (this._lastLogs.length > 0 || this._lastTotal > 0) {
                this.currentOffset = 0;
                this.loadLogs();
            }
        } catch (err) {
            statusEl.textContent = `Delete failed: ${this.escapeHtml(err.message)}`;
            statusEl.className = 'logs-delete-error';
        }
    },

    async loadLogs() {
        const params = {};
        const from = document.getElementById('logs-from').value;
        const to = document.getElementById('logs-to').value;
        const search = document.getElementById('logs-search').value.trim();
        const level = document.getElementById('logs-level').value;

        if (from) params.from = new Date(from).toISOString();
        if (to)   params.to   = new Date(to).toISOString();
        if (search) params.search = search;
        if (level)  params.level  = level;
        params.limit  = this.limit;
        params.offset = this.currentOffset;

        try {
            const result = await api.logs.getAll(params);
            this._lastLogs = result.logs;
            this._lastTotal = result.total;
            this.renderTable(result.logs, result.total);
        } catch (err) {
            document.getElementById('logs-table-body').innerHTML =
                `<tr><td colspan="3" class="error-message">Failed to load logs: ${this.escapeHtml(err.message)}</td></tr>`;
            document.getElementById('logs-pagination-info').textContent = '';
            document.getElementById('logs-prev-btn').disabled = true;
            document.getElementById('logs-next-btn').disabled = true;
        }
    },

    // Strips embedded timestamp, level prefix and extracts file:line from log messages
    // written via the Go log package: "2026/04/07 10:30:45.123456 [Error]   file.go:42: msg"
    parseMessage(raw) {
        let msg = (raw || '').trimEnd();
        msg = msg.replace(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? /, '');
        msg = msg.replace(/^\[\w+\]\s+/, '');
        const m = msg.match(/^(.+:\d+): ([\s\S]*)$/);
        if (m) {
            return { fileInfo: m[1], cleanMessage: m[2] };
        }
        return { fileInfo: null, cleanMessage: msg };
    },

    renderTable(logs, total) {
        const tbody = document.getElementById('logs-table-body');
        const info  = document.getElementById('logs-pagination-info');

        const from = this.currentOffset + 1;
        const to   = this.currentOffset + logs.length;

        info.textContent = logs.length === 0
            ? 'No results'
            : `Showing ${from}–${to} of ${total}`;

        document.getElementById('logs-prev-btn').disabled = this.currentOffset === 0;
        document.getElementById('logs-next-btn').disabled = to >= total;

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No log entries found.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.map(log => {
            const levelClass = log.level.toLowerCase().replace(/[^a-z0-9-]/g, '');
            const levelBadge = `<span class="log-level log-level-${levelClass}">${this.escapeHtml(log.level)}</span>`;
            const ts = new Date(log.timestamp).toLocaleString();

            if (this.showDetails) {
                return `<tr>
                    <td class="log-timestamp">${ts}</td>
                    <td>${levelBadge}</td>
                    <td class="log-message log-message-raw">${this.escapeHtml(log.message.trimEnd())}</td>
                </tr>`;
            }

            const parsed = this.parseMessage(log.message);
            const fileHtml = parsed.fileInfo
                ? `<span class="log-file-info" title="Click Details to see full path">${this.escapeHtml(parsed.fileInfo)}</span>`
                : '';
            return `<tr>
                <td class="log-timestamp">${ts}</td>
                <td>${levelBadge}</td>
                <td class="log-message">${this.escapeHtml(parsed.cleanMessage)}${fileHtml}</td>
            </tr>`;
        }).join('');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
};
