// Main application controller
const App = {
    init() {
        this.setupNavigation();
        this.initModules();
    },

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const views = document.querySelectorAll('.view');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewName = btn.dataset.view;
                
                // Update active states
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                views.forEach(v => v.classList.remove('active'));
                document.getElementById(`${viewName}-view`).classList.add('active');
            });
        });
    },

    initModules() {
        DirectoryManager.init();
        SharePointManager.init();
        SyncManager.init();
        LogsManager.init();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());