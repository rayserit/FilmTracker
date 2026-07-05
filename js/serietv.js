const OMDb_API_KEY = "2526ef70";
        const TMDB_KEY = atob("MmNkOGJiNDgzYWIxMjE0ZDY2MDIwZTcwYjBhMzZmYTQ=");
        const MDBLIST_PROXY_URL = "https://serietvtracker.rayser.workers.dev";

        const DEFAULT_POSTER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiB2aWV3Qm94PSIwIDAgMzAwIDQ1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSIxNTAiIHk9IjIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5OZXNzYSBpbWFnaW5lPC90ZXh0Pjwvc3ZnPg==";
        const DEFAULT_ACTOR_PHOTO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJiMmIyYiIvPgogIDxnIGZpbGw9IiM0NDQiPgogICAgPGNpcmNsZSBjeD0iNTAiIGN5PSIzOCIgcj0iMTgiLz4KICAgIDxwYXRoIGQ9Ik0yMCw5NSBDMjAsNjUgMzAsNTggNTAsNTggQzcwLDU4IDgwLDY1IDgwLDk1IEw4MCwxMDAgTDIwLDEwMCBaIi8+CiAgPC9nPgo8L3N2Zz4=";
        const EMPTY_STILL_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTY5Ij4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2OSIgZmlsbD0iIzJiMmIyYiIvPgogIDxwYXRoIGZpbGw9IiM0NDQiIGQ9Ik0xMzUsNjUgTDE3NSw4NC41IEwxMzUsMTA0IFoiLz4KPC9zdmc+";
        const IMDB_STAR_ICON = "https://upload.wikimedia.org/wikipedia/commons/2/29/Gold_Star.svg";
        const ROTTEN_TOMATOES_ICONS = { certified: "https://upload.wikimedia.org/wikipedia/uk/b/b2/Certified_Fresh_2018.svg", fresh: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg", rotten: "https://upload.wikimedia.org/wikipedia/commons/5/52/Rotten_Tomatoes_rotten.svg" };
        const POPCORN_ICONS = { positive: "https://upload.wikimedia.org/wikipedia/commons/d/da/Rotten_Tomatoes_positive_audience.svg", negative: "https://upload.wikimedia.org/wikipedia/commons/6/63/Rotten_Tomatoes_negative_audience.svg" };
        const LETTERBOXD_ICON = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH45TgrphrMnMTlMx9wpG_Jj7JoBzrI9zAfg&s";
        const METACRITIC_ICON = "https://upload.wikimedia.org/wikipedia/commons/f/f2/Metacritic_M.png";
        const firebaseConfig = { apiKey: "AIzaSyDm946nISfZs8ugkuYPraNTzFhvgQmnMUk", authDomain: "gametrackerdb.firebaseapp.com", databaseURL: "https://gametrackerdb-default-rtdb.europe-west1.firebasedatabase.app", projectId: "gametrackerdb" };
        const MAX_LOG_SIZE = 15;
        const MAX_NOTIFICATIONS = 50;
        const HOME_STATS_PREF_KEY = 'showHomeStats';
        const CARD_RATINGS_PREF_KEY = 'showCardRatings';
        const SHOW_DETAILS_CACHE_KEY = 'tvDetailsModalCacheV1';
        const SHOW_DETAILS_CACHE_TTL = 12 * 60 * 60 * 1000;
        const SHOW_DETAILS_CACHE_MAX_AGE = 21 * 24 * 60 * 60 * 1000;
        const SHOW_DETAILS_CACHE_MAX_ENTRIES = 50;

        const DEFAULT_CATEGORIES = ["In Corso", "Completate", "Da Vedere"];
        let mediaList = [], categories = [], currentTMDbSelection = null, debounceTimeout, lazyLoadObserver, currentShowCache = null;
        let calendarOnlyInCorso = true;
        let updateHistory = JSON.parse(localStorage.getItem('tvUpdateHistory') || "[]");
        let currentUser = null, currentUsername = "", isViewMode = false, followedFriends = [], friendListeners = {};
        let isAuthActionInProgress = false;
        let lastCheckedTimestamps = {};
        let statContributorIds = new Set();
        let ignoredDuplicateIds = new Set();
        let currentRewatchContext = {};
        let isUpdateInProgress = false; // Il nostro "semaforo" per gli aggiornamenti
        let showDetailsCache = new Map();
        let showDetailsRequests = new Map();
        let activeShowDetailsRequestToken = 0;

        const getDefaultShowProps = () => ({
            category: 'Da Vedere', addedAt: new Date().toISOString(), lastActivityAt: null, poster: "",
            lastTmdbCheckAt: null,
            year: "", imdbID: null, tmdbID: null, imdbRating: "N/A", rottenTomatoes: "N/A", popcornRating: "N/A", metacriticRating: "N/A", letterboxdRating: "N/A", status: "Unknown",
            seasons: {}, progress: {}, rewatches: {}, isFavorite: false, italianTitle: null,
            includeSpecialsInProgress: false // Nuova proprietà per la logica degli speciali
        });

        const elements = {
            appLoader: document.getElementById("appLoader"), mediaManagementBtn: document.getElementById("mediaManagementBtn"),
            settingsBtn: document.getElementById("settingsBtn"),
            mobileSettingsBtn: document.getElementById("mobileSettingsBtn"),
            importFile: document.getElementById("importFile"),
            themeToggle: document.getElementById("themeToggle"), searchInput: document.getElementById("searchInput"),
            statsPanel: document.querySelector(".stats-panel"),
            backToTopBtn: document.getElementById("backToTopBtn"),
            toggleHomeStatsBtn: document.getElementById("toggleHomeStats"),
            toggleCardRatingsBtn: document.getElementById("toggleCardRatings"),
            categoryFilter: document.getElementById("categoryFilter"), sortFilter: document.getElementById("sortFilter"),
            statTotal: document.getElementById("statTotal"), statFollowing: document.getElementById("statInCorso"),
            statCompleted: document.getElementById("statCompletate"), statToWatch: document.getElementById("statDaVedere"),
            statPaused: document.getElementById("statInPausaDroppata"),
            statEpisodes: document.getElementById("statEpisodiVisti"),
            statEpisodiRivisti: document.getElementById("statEpisodiRivisti"), // NEW STATISTIC
            statHours: document.getElementById("statTempoTotale"),
            advancedStatTotal: document.getElementById("advancedStatTotal"),
            advancedStatToWatch: document.getElementById("advancedStatToWatch"),
            advancedStatFollowing: document.getElementById("advancedStatFollowing"),
            advancedStatCompleted: document.getElementById("advancedStatCompleted"),
            advancedStatPaused: document.getElementById("advancedStatPaused"),
            advancedStatEpisodes: document.getElementById("advancedStatEpisodes"),
            advancedStatRewatched: document.getElementById("advancedStatRewatched"),
            advancedStatHours: document.getElementById("advancedStatHours"),
            mediaSectionsContainer: document.getElementById("mediaSectionsContainer"), mediaManagementModal: document.getElementById("mediaManagementModal"),
            mediaTitle: document.getElementById("mediaTitle"), searchTMDbBtn: document.getElementById("searchTMDbBtn"), tmdbResults: document.getElementById("tmdbResults"),
            closeManagementModal: document.getElementById("closeManagementModal"), notification: document.getElementById("notification"), notificationText: document.getElementById("notificationText"),
            detailsModal: document.getElementById('detailsModal'), detailsModalContent: document.getElementById('detailsModalContent'), detailsModalClose: document.getElementById('detailsModalClose'),
            episodesModal: document.getElementById('episodesModal'), episodesModalContent: document.getElementById('episodesModalContent'), episodesModalClose: document.getElementById('episodesModalClose'),
            actorModal: document.getElementById('actorModal'), actorModalContent: document.getElementById('actorModalContent'), actorModalClose: document.getElementById('actorModalClose'),
            posterModal: document.getElementById('posterModal'), posterGrid: document.getElementById('posterGrid'), savePosterChange: document.getElementById('savePosterChange'),
            cancelPosterChange: document.getElementById('cancelPosterChange'), confirmModal: document.getElementById("confirmModal"), confirmModalTitle: document.getElementById("confirmModalTitle"),
            confirmModalBody: document.getElementById("confirmModalBody"), confirmModalConfirm: document.getElementById("confirmModalConfirm"), confirmModalCancel: document.getElementById("confirmModalCancel"),
            categoriesList: document.getElementById("categoriesList"),
            newCategoryName: document.getElementById("newCategoryName"), addCategoryBtn: document.getElementById("addCategoryBtn"),
            toggleCategoryManagementBtn: document.getElementById("toggleCategoryManagementBtn"),
            manageCategoriesPanel: document.getElementById("manageCategoriesPanel"),
            authModal: document.getElementById('authModal'), authToggle: document.getElementById('authToggle'),
            loginBtn: document.getElementById('loginBtn'), registerBtn: document.getElementById('registerBtn'),
            logoutBtn: document.getElementById('logoutBtn'), userInfo: document.getElementById('userInfo'),
            shareBtn: document.getElementById('shareBtn'), shareModal: document.getElementById('shareModal'),
            copyShareLinkBtn: document.getElementById('copyShareLinkBtn'), closeShareModalBtn: document.getElementById('closeShareModalBtn'),
            friendsModal: document.getElementById('friendsModal'),
            viewModeBanner: document.getElementById('viewModeBanner'), viewModeUserEmail: document.getElementById('viewModeUserEmail'), closeViewBtn: document.getElementById('closeViewBtn'),
            addFriendBtn: document.getElementById('addFriendBtn'), friendsList: document.getElementById('friendsList'), friendIdInput: document.getElementById('friendIdInput'),
            myIdInput: document.getElementById('myIdInput'), copyMyIdBtn: document.getElementById('copyMyIdBtn'),
            myUsernameInput: document.getElementById('myUsernameInput'), saveUsernameBtn: document.getElementById('saveUsernameBtn'),
            notificationBellContainer: document.getElementById('notificationBellContainer'), bellIcon: document.getElementById('bellIcon'),
            notificationDropdown: document.getElementById('notificationDropdown'),
            notificationBadge: document.getElementById('notificationBadge'),
            rewatchModal: document.getElementById("rewatchModal"), rewatchModalTitle: document.getElementById("rewatchModalTitle"),
            rewatchCountInput: document.getElementById("rewatchCountInput"), confirmRewatchBtn: document.getElementById("confirmRewatchBtn"), cancelRewatchBtn: document.getElementById("cancelRewatchBtn"),
            dropModal: document.getElementById("dropModal"), dropCategorySelect: document.getElementById("dropCategorySelect"),
            confirmDropBtn: document.getElementById("confirmDropBtn"), cancelDropBtn: document.getElementById("cancelDropBtn"),
            updateProgressModal: document.getElementById('updateProgressModal'),
            updateProgressBarFill: document.getElementById('updateProgressBarFill'),
            updateProgressText: document.getElementById('updateProgressText'),
            updateProgressTitle: document.getElementById('updateProgressTitle'),
            updateSummaryModal: document.getElementById('updateSummaryModal'),
            updateSummaryList: document.getElementById('updateSummaryList'),
            closeSummaryBtn: document.getElementById('closeSummaryBtn'),
            // Bottom Nav Bar Elements
            bottomNavAdd: document.getElementById('bottomNavAdd'),
            bottomNavManage: document.getElementById('bottomNavManage'),
            bottomNavCalendar: document.getElementById('bottomNavCalendar'),
            bottomNavNotifications: document.getElementById('bottomNavNotifications'),
            bottomNavHome: document.getElementById('bottomNavHome'),
            notificationBadgeMobile: document.getElementById('notificationBadgeMobile'),
            // Mobile Modals and Buttons
            mobileMenuModal: document.getElementById('mobileMenuModal'),
            mobileMenuCloseBtn: document.getElementById('mobileMenuCloseBtn'),
            mobileMenuUserActionBtn: document.getElementById('mobileMenuUserActionBtn'),
            mobileMenuExportBtn: document.getElementById('mobileMenuExportBtn'),
            mobileMenuImportBtn: document.getElementById('mobileMenuImportBtn'),
            mobileMenuThemeBtn: document.getElementById('mobileMenuThemeBtn'),
            mobileMenuResetBtn: document.getElementById('mobileMenuResetBtn'),
            mobileNotificationsModal: document.getElementById('mobileNotificationsModal'),
            mobileNotificationsCloseBtn: document.getElementById('mobileNotificationsCloseBtn'),
            notificationListMobile: document.getElementById('notificationListMobile'),
            markAllReadMobileBtn: document.querySelector('#mobileNotificationsModal #markReadAll'),
            // Filter Modal
            filterSortModal: document.getElementById('filterSortModal'),
            mobileFilterBtn: document.getElementById('mobileFilterBtn'),
            mobileCategoryFilter: document.getElementById('mobileCategoryFilter'),
            mobileSortFilter: document.getElementById('mobileSortFilter'),
            applyFiltersBtn: document.getElementById('applyFiltersBtn'),
            // Update Section
            completeUpdateBtnDesktop: document.getElementById('completeUpdateBtnDesktop'),
            dailyUpdateBtnDesktop: document.getElementById('dailyUpdateBtnDesktop'),
            lastUpdateTimestampDesktop: document.getElementById('lastUpdateTimestampDesktop'),
            updateSectionDesktop: document.getElementById('updateSectionDesktop'),
            // Category Navigation Modal
            categoryNavModal: document.getElementById('categoryNavModal'),
            categoryNavList: document.getElementById('categoryNavList'),
            closeCategoryNavBtn: document.getElementById('closeCategoryNavBtn')
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        window.addEventListener("load", init);

        function init() {
            loadPersistedShowDetailsCache();
            setupEventListeners();
            applySavedHomeStatsPreference();
            applySavedCardRatingsPreference();
            setupBackToTopButton();
            setupSidebarCompact();
            window.addEventListener('resize', updateEpisodesToolbarOffset);
            window.addEventListener('resize', syncDesktopModalChrome);
            loadSortOrder();
            updateSwitcherLinksInViewMode();
            handleViewMode() || setupAuthListeners();
            loadData(); // Moved here to ensure custom selects are set up first

            // Hide/show top bar on scroll (mobile only)
            if (window.innerWidth <= 768) {
                let lastScrollY = 0;
                let ticking = false;

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            const currentScrollY = window.scrollY;
                            const topBar = document.querySelector('.top-bar');

                            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                                // Scroll verso il basso: nascondi
                                topBar.classList.add('hidden');
                            } else {
                                // Scroll verso l'alto: mostra
                                topBar.classList.remove('hidden');
                            }

                            lastScrollY = currentScrollY;
                            ticking = false;
                        });
                        ticking = true;
                    }
                }, { passive: true });
            }
        }

        function toggleHomeStats(isVisible, immediate = false) {
            const panel = elements.statsPanel;
            if (!panel) return;

            if (isVisible) {
                document.body.classList.remove('home-stats-hidden');
                panel.style.display = 'block';
                if (immediate) {
                    panel.classList.remove('is-hidden');
                    return;
                }
                requestAnimationFrame(() => panel.classList.remove('is-hidden'));
            } else {
                document.body.classList.add('home-stats-hidden');

                if (immediate) {
                    panel.classList.add('is-hidden');
                    panel.style.display = 'none';
                    return;
                }

                panel.classList.add('is-hidden');
                window.setTimeout(() => {
                    if (panel.classList.contains('is-hidden')) panel.style.display = 'none';
                }, 280);
            }
        }

        function applySavedHomeStatsPreference() {
            const savedPreference = localStorage.getItem(HOME_STATS_PREF_KEY);
            const shouldShow = savedPreference === 'true';
            if (elements.toggleHomeStatsBtn) elements.toggleHomeStatsBtn.checked = shouldShow;
            toggleHomeStats(shouldShow, true);
        }

        function applySavedCardRatingsPreference() {
            const savedPreference = localStorage.getItem(CARD_RATINGS_PREF_KEY);
            const shouldShow = savedPreference === null ? true : savedPreference === 'true';
            document.body.classList.toggle('hide-ratings-ui', !shouldShow);
            if (elements.toggleCardRatingsBtn) elements.toggleCardRatingsBtn.checked = shouldShow;
        }

        function setupBackToTopButton() {
            const btn = elements.backToTopBtn;
            if (!btn) return;
            const updateVisibility = () => btn.classList.toggle('visible', window.scrollY > 300);
            window.addEventListener('scroll', updateVisibility, { passive: true });
            btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            updateVisibility();
        }

        function closeSocialHubSurfaces() {
            const hadMobileNotifications = !!elements.mobileNotificationsModal?.classList.contains('visible');
            hideNotificationDropdown();
            if (hadMobileNotifications) {
                closeModal(elements.mobileNotificationsModal);
            }
            return hadMobileNotifications ? 340 : 0;
        }

        function handleShare() {
            if (!currentUser) return showNotification("Devi essere loggato.", "warning");
            const link = window.location.href.split('?')[0] + '?view=' + currentUser.uid;
            document.getElementById('shareLinkInput').value = link;
            openModal(document.getElementById('shareModal'));
        }

        function openFriendsHub() {
            const delay = closeSocialHubSurfaces();
            window.setTimeout(() => {
                renderFriendsList();
                openModal(document.getElementById('friendsModal'));
            }, delay);
        }

        function bindSocialHubButtons() {
            document.querySelectorAll('.hub-friends-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    openFriendsHub();
                };
            });

            document.querySelectorAll('.hub-share-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    hideNotificationDropdown();
                    closeModal(document.getElementById('mobileNotificationsModal'));

                    if (!currentUser) {
                        showNotification("Devi essere loggato per condividere.", "warning");
                        return;
                    }
                    setTimeout(() => {
                        const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                        const isTV = window.location.pathname.includes('serietv');
                        const link = `${window.location.origin}${path}${isTV ? 'serietv_tracker.html' : 'film_tracker.html'}?view=${currentUser.uid}`;

                        const shareInput = document.getElementById('shareLinkInput');
                        if (shareInput) shareInput.value = link;
                        openModal(document.getElementById('shareModal'));
                    }, 300);
                };
            });

            document.querySelectorAll('#markReadAll').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    markAllNotificationsAsRead();
                };
            });
        }

        function updateSwitcherLinksInViewMode() {
            const params = new URLSearchParams(window.location.search);
            const viewId = params.get('view');
            if (viewId) {
                const filmTrackerLink = document.querySelector('.tracker-switch-btn[href="film_tracker.html"], .side-switcher-link[href="film_tracker.html"]');
                const tvTrackerLink = document.querySelector('.tracker-switch-btn[href="serietv_tracker.html"], .side-switcher-link[href="serietv_tracker.html"]');
                if (filmTrackerLink) filmTrackerLink.href = `film_tracker.html?view=${viewId}`;
                if (tvTrackerLink) tvTrackerLink.href = `serietv_tracker.html?view=${viewId}`;
            }
        }

        function addToUpdateHistory(changes) {
            if (!changes || changes.length === 0) return;

            const newEntry = {
                timestamp: new Date().toISOString(),
                items: changes // l'array di stringhe con i cambiamenti
            };

            updateHistory.unshift(newEntry); // Aggiunge in cima
            updateHistory = updateHistory.slice(0, 50); // Mantiene solo gli ultimi 50 aggiornamenti

            localStorage.setItem('tvUpdateHistory', JSON.stringify(updateHistory));

            // Se l'utente è loggato, salviamo anche su Firebase
            if (currentUser) {
                const path = `users/${currentUser.uid}/tvUpdateHistory`;
                db.ref(path).set(updateHistory);
            }
        }

        function renderUpdateHistory() {
            const container = document.getElementById('historyList');
            if (!container) return;

            if (updateHistory.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding: 2rem;">Nessun aggiornamento registrato.</p>`;
                return;
            }

            container.innerHTML = updateHistory.map(entry => `
                <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                    <div style="font-size: 0.8rem; color: var(--primary); font-weight: bold; margin-bottom: 0.5rem;">
                        <i class="fas fa-clock"></i> ${new Date(entry.timestamp).toLocaleString('it-IT')}
                    </div>
                    <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
                        ${entry.items.map(item => `<li style="margin-bottom: 0.3rem;">${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }

        function hideLoader() { elements.appLoader.style.opacity = '0'; setTimeout(() => elements.appLoader.style.display = 'none', 300); }

        function loadData() {
            if (!currentUser) return;
            const path = `users/${currentUser.uid}`;
            loadOwnUsername();
            db.ref(`${path}/tvShowTracker`).on("value", snapshot => {
                const data = snapshot.val() || {};
                mediaList = (data.mediaList || []).map(item => {
                    const cleanItem = { ...getDefaultShowProps(), ...item };
                    if (typeof cleanItem.seasons !== 'object' || cleanItem.seasons === null) {
                        cleanItem.seasons = {}; // Bonifica dati vecchi
                    }
                    return cleanItem;
                });
                categories = (data.categories || DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false }))).map(cat => (typeof cat === 'string') ? { name: cat, hideProgress: false } : cat);
                if (data.lastBackgroundUpdate) {
                    const localLastUpdate = parseInt(localStorage.getItem('lastBackgroundUpdate') || '0');
                    const cloudLastUpdate = parseInt(data.lastBackgroundUpdate || '0');
                    localStorage.setItem('lastBackgroundUpdate', Math.max(localLastUpdate, cloudLastUpdate));
                }

                if (isUpdateInProgress) return;

                if (!isViewMode) {
                    renderFullUI();
                    triggerNewEpisodeCheck();
                    // Passiamo il timestamp di Firebase per coordinare PWA e APK
                    updateAllShowsInBackground(false, data.lastBackgroundUpdate);
                }
            });

            db.ref(`${path}/social`).once("value", async snapshot => {
                const data = snapshot.val() || {};
                followedFriends = data.followedFriends || [];
                lastCheckedTimestamps = data.lastCheckedTimestamps || {};
                currentUsername = data.username || "";
                if (elements.myUsernameInput) elements.myUsernameInput.value = currentUsername;
                await syncFollowedFriendProfiles();
                if (!isViewMode) {
                    setupFriendListeners();
                    renderFriendsList();
                }
            });

            // Sincronizzazione Storico Firebase
            db.ref(`${path}/tvUpdateHistory`).on("value", snapshot => {
                if (snapshot.exists()) {
                    updateHistory = snapshot.val();
                    localStorage.setItem('tvUpdateHistory', JSON.stringify(updateHistory));
                }
            });

            hideLoader();
        }

        function renderCalendar() {
            const container = document.getElementById('calendarList');
            if (!container) return;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filtriamo gli episodi: da 3 giorni fa a 30 giorni nel futuro
            let allEpisodes = [];
            mediaList.forEach(show => {
                if (calendarOnlyInCorso && show.category !== "In Corso") return;
                if (show.isDropped) return;

                Object.entries(show.seasons).forEach(([sNum, season]) => {
                    (season.episodes || []).forEach(ep => {
                        if (!ep.air_date) return;
                        const d = new Date(ep.air_date);
                        const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                        if (diff >= -3 && diff <= 30) {
                            allEpisodes.push({
                                showId: show.id,
                                showTitle: show.title,
                                season: sNum,
                                episode: ep.episode_number,
                                name: ep.name,
                                airDate: ep.air_date,
                                dateObj: d,
                                still: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : EMPTY_STILL_PLACEHOLDER,
                                diffDays: diff
                            });
                        }
                    });
                });
            });

            allEpisodes.sort((a, b) => a.dateObj - b.dateObj);

            if (allEpisodes.length === 0) {
                container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nessun episodio trovato con questi filtri.</p>
                </div>`;
                return;
            }

            let html = '';
            let currentDay = '';

            allEpisodes.forEach(ep => {
                const epDateStr = ep.dateObj.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

                if (epDateStr !== currentDay) {
                    if (currentDay !== '') html += `</div>`;
                    html += `
                        <div class="calendar-day-group">
                            <div class="calendar-date-header">
                                <span>${epDateStr}</span>
                                <span style="font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">${getRelativeDayLabel(ep.diffDays)}</span>
                            </div>`;
                    currentDay = epDateStr;
                }

                html += `
                    <div class="calendar-item" onclick="closeModal(document.getElementById('calendarModal')); setTimeout(() => showDetailsModal('${ep.showId}'), 300)">
                        <div class="calendar-still-wrapper">
                            <img src="${ep.still}" class="calendar-still" onerror="this.src='${EMPTY_STILL_PLACEHOLDER}'">
                        </div>
                        <div class="calendar-info">
                            <div class="calendar-show-title">${ep.showTitle}</div>
                            <div class="calendar-ep-title">${ep.name || 'Episodio ' + ep.episode}</div>
                            <div class="calendar-ep-number">S${ep.season} · Episodio ${ep.episode}</div>
                        </div>
                    </div>`;
            });

            html += '</div>';
            container.innerHTML = html;
        }

        function getRelativeDayLabel(diff) {
            if (diff === 0) return "OGGI";
            if (diff === 1) return "DOMANI";
            if (diff === -1) return "IERI";
            if (diff < 0) return `${Math.abs(diff)} GIORNI FA`;
            return `TRA ${diff} GIORNI`;
        }

        function loadLocalData() {
            try {
                const localList = JSON.parse(localStorage.getItem("tvShowList") || "[]");
                mediaList = localList.map(item => {
                    const cleanItem = { ...getDefaultShowProps(), ...item };
                    if (typeof cleanItem.seasons !== 'object' || cleanItem.seasons === null) {
                        cleanItem.seasons = {}; // Bonifica dati vecchi
                    }
                    return cleanItem;
                });
                const storedCategories = JSON.parse(localStorage.getItem("tvShowCategories") || JSON.stringify(DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false }))));
                categories = storedCategories.map(cat => (typeof cat === 'string') ? { name: cat, hideProgress: false } : cat);
                renderFullUI();
                updateAllShowsInBackground();
            } catch (err) {
                mediaList = [];
                categories = DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false }));
                renderFullUI();
            }
        }

        let genresChartInstance = null;
        let activityChartInstance = null;

        function getMonthKeyFromDate(value) {
            if (!value) return '';

            const isoMonth = String(value).match(/^(\d{4})-(\d{2})/);
            if (isoMonth) return `${isoMonth[1]}-${isoMonth[2]}`;

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';

            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        function getLastMonthKeys(totalMonths, referenceDate = new Date()) {
            const currentMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
            const keys = [];

            for (let i = totalMonths - 1; i >= 0; i--) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
                keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
            }

            return keys;
        }

        function formatMonthLabel(monthKey, options = { month: 'short' }) {
            const [year, month] = monthKey.split('-').map(Number);
            return new Date(year, month - 1, 1).toLocaleDateString('it-IT', options);
        }

        function renderAdvancedStats() {
            // --- LOGICA MESE CORRENTE ---
            const now = new Date();
            const currentMonthKey = getMonthKeyFromDate(now);
            document.getElementById('currentMonthName').textContent = now.toLocaleDateString('it-IT', { month: 'long' });

            let addedCount = 0;
            let watchedCount = 0;

            mediaList.forEach(m => {
                if (getMonthKeyFromDate(m.addedAt) === currentMonthKey) {
                    addedCount++;
                }
                if (getMonthKeyFromDate(m.lastActivityAt) === currentMonthKey) {
                    if (!m.isDropped && m.category !== 'Da Vedere') {
                        watchedCount++;
                    }
                }
            });

            document.getElementById('monthAdded').textContent = addedCount;
            document.getElementById('monthWatched').textContent = watchedCount;

            // --- 1. PREPARAZIONE DATI GENERI ---
            const genreCounts = {};
            mediaList.forEach(show => {
                if (show.isDropped || show.category === 'Da Vedere') return;
                if (show.genres && Array.isArray(show.genres)) {
                    show.genres.forEach(g => {
                        genreCounts[g] = (genreCounts[g] || 0) + 1;
                    });
                }
            });

            const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const genreLabels = sortedGenres.map(g => g[0]);
            const genreData = sortedGenres.map(g => g[1]);

            // --- 2. PREPARAZIONE DATI ATTIVITÀ MENSILE ---
            const monthCounts = {};
            const last6Months = getLastMonthKeys(6, now);
            last6Months.forEach(key => { monthCounts[key] = 0; });

            mediaList.forEach(show => {
                if (show.lastActivityAt && !show.isDropped) {
                    const key = getMonthKeyFromDate(show.lastActivityAt);
                    if (monthCounts[key] !== undefined) {
                        monthCounts[key]++;
                    }
                }
            });

            const activityData = last6Months.map(m => monthCounts[m]);
            const activityLabels = last6Months.map(m => formatMonthLabel(m, { month: 'short', year: '2-digit' }).toUpperCase());
            const activityDetailLabels = last6Months.map(m => formatMonthLabel(m, { month: 'long', year: 'numeric' }));

            // --- VARIABILI DI TEMA ---
            const isDark = document.body.classList.contains('dark');
            const textColor = isDark ? '#aaaaaa' : '#666666';
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            const bgColor = isDark ? '#1e1e1e' : '#ffffff';

            // Palette Colori Moderna (Vivida)
            const modernColors = ['#FF3366', '#20A4F3', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];

            // --- 3. GRAFICO A CIAMBELLA "POP" (GENERI) ---
            const ctxGenres = document.getElementById('genresChart').getContext('2d');
            Chart.getChart(ctxGenres.canvas)?.destroy();
            genresChartInstance = null;

            genresChartInstance = new Chart(ctxGenres, {
                type: 'doughnut',
                data: {
                    labels: genreLabels.length ? genreLabels : ['Dati in elaborazione...'],
                    datasets: [{
                        data: genreData.length ? genreData : [1],
                        backgroundColor: genreData.length ? modernColors : ['#444'],
                        borderWidth: 3, // Spazio tra le fette
                        borderColor: bgColor, // Usa il colore di sfondo del modale per lo spazio
                        hoverOffset: 15, // L'EFFETTO MAGICO: la fetta esce fuori al passaggio
                        borderRadius: 5 // Arrotonda gli spigoli interni delle fette
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: 15 }, // Dà spazio per far uscire la fetta
                    onHover: (event, chartElement) => {
                        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                    },
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const selectedGenre = genreLabels[index]; // Es: "Drama"
                            showChartDetails('genre', selectedGenre);
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: textColor, font: { family: 'Inter', size: 12 }, usePointStyle: true, boxWidth: 8 }
                        },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                            titleColor: isDark ? '#000' : '#fff',
                            bodyColor: isDark ? '#000' : '#fff',
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false
                        }
                    }
                }
            });

            // --- 4. GRAFICO FLUIDO AD AREA (ATTIVITÀ) ---
            const ctxActivity = document.getElementById('activityChart').getContext('2d');
            Chart.getChart(ctxActivity.canvas)?.destroy();
            activityChartInstance = null;

            // Creazione del Gradiente per il riempimento della curva
            let gradient = ctxActivity.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(42, 157, 143, 0.6)'); // Teal semi-trasparente in alto
            gradient.addColorStop(1, 'rgba(42, 157, 143, 0.0)'); // Trasparente in basso

            activityChartInstance = new Chart(ctxActivity, {
                type: 'line', // Cambiato da 'bar' a 'line'
                data: {
                    labels: activityLabels,
                    datasets: [{
                        label: 'Serie Attive',
                        data: activityData,
                        backgroundColor: gradient,
                        borderColor: '#2a9d8f', // Linea Teal brillante
                        borderWidth: 3,
                        fill: true, // Attiva il gradiente sotto la linea
                        tension: 0.4, // L'EFFETTO MAGICO: Arrotonda la linea rendendola una curva fluida
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#2a9d8f',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onHover: (event, chartElement) => {
                        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                    },
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const selectedMonthKey = last6Months[index]; // Es: "2026-02"
                            const displayMonth = activityDetailLabels[index]; // Es: "febbraio 2026"
                            showChartDetails('activity', selectedMonthKey, displayMonth);
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#2a9d8f',
                            titleFont: { size: 13 },
                            bodyFont: { size: 14, weight: 'bold' },
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    return context.raw + ' Serie modificate';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: textColor, precision: 0, stepSize: 1 },
                            grid: { color: gridColor, drawBorder: false }
                        },
                        x: {
                            ticks: { color: textColor, font: { family: 'Inter', weight: '600' } },
                            grid: { display: false, drawBorder: false }
                        }
                    }
                }
            });

            setupMonthStatsListeners();
        }

        function setupMonthStatsListeners() {
            const now = new Date();
            const currentMonthKey = getMonthKeyFromDate(now);

            document.getElementById('btnMonthAdded').onclick = () => {
                showChartDetails('monthAdded', currentMonthKey, now.toLocaleDateString('it-IT', { month: 'long' }));
            };

            document.getElementById('btnMonthWatched').onclick = () => {
                showChartDetails('monthWatched', currentMonthKey, now.toLocaleDateString('it-IT', { month: 'long' }));
            };
        }

        // --- NUOVA FUNZIONE PER MOSTRARE LA LISTA ---
        function showChartDetails(type, key, displayLabel = '') {
            let filteredShows = [];
            let title = '';

            // Filtriamo i dati in base a cosa hai cliccato
            if (type === 'genre') {
                title = `Genere: ${key}`;
                filteredShows = mediaList.filter(show =>
                    !show.isDropped && show.category !== 'Da Vedere' &&
                    show.genres && show.genres.includes(key)
                );
            } else if (type === 'activity') {
                title = `Attività di ${displayLabel}`;
                filteredShows = mediaList.filter(show => {
                    if (show.isDropped || !show.lastActivityAt) return false;
                    const showKey = getMonthKeyFromDate(show.lastActivityAt);
                    return showKey === key;
                });
            } else if (type === 'monthAdded') {
                title = `Aggiunte a ${displayLabel}`;
                filteredShows = mediaList.filter(show => getMonthKeyFromDate(show.addedAt) === key);
            } else if (type === 'monthWatched') {
                title = `Viste/Attive a ${displayLabel}`;
                filteredShows = mediaList.filter(show =>
                    getMonthKeyFromDate(show.lastActivityAt) === key &&
                    !show.isDropped &&
                    show.category !== 'Da Vedere'
                );
            }

            // 1. Raggruppamento
            const grouped = filteredShows.reduce((acc, show) => {
                const cat = show.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(show);
                return acc;
            }, {});

            document.getElementById('chartDetailsTitle').textContent = title;
            const listContainer = document.getElementById('chartDetailsList');
            listContainer.innerHTML = '';

            if (filteredShows.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center; padding:2rem; opacity:0.5;">Nessun dato corrispondente.</p>';
            } else {
                // 2. Creazione sezioni divise
                Object.keys(grouped).forEach(cat => {
                    const groupDiv = document.createElement('div');
                    groupDiv.className = 'stats-category-group';

                    // Ottieni il nome vero della categoria TV da categories[]
                    const catObj = categories.find(c => c.id === cat);
                    const displayCatName = catObj ? catObj.name : cat;

                    groupDiv.innerHTML = `
                        <div class="stats-category-title">
                            ${displayCatName}
                            <span class="stats-category-count">${grouped[cat].length}</span>
                        </div>
                        <div class="category-items-list"></div>
                    `;

                    const itemsList = groupDiv.querySelector('.category-items-list');

                    grouped[cat].sort((a, b) => a.title.localeCompare(b.title)).forEach(show => {
                        const item = document.createElement('div');
                        item.className = 'chart-detail-item';
                        item.style.marginBottom = '8px';
                        item.innerHTML = `
                            <img src="${show.poster || DEFAULT_POSTER}" class="chart-detail-poster" onerror="this.src='${DEFAULT_POSTER}'">
                            <div class="chart-detail-info">
                                <span style="font-weight: 700; font-size: 0.95rem;">${show.title}</span>
                                <span style="font-size: 0.75rem; color: var(--text-secondary);">${show.year || 'N/D'}</span>
                            </div>
                        `;
                        itemsList.appendChild(item);
                    });
                    listContainer.appendChild(groupDiv);
                });
            }
            openModal(document.getElementById('chartDetailsModal'));
        }

        async function saveData() {
            if (isViewMode) return;
            if (currentUser) {
                return db.ref(`users/${currentUser.uid}/tvShowTracker`).update({ mediaList, categories });
            } else {
                try {
                    localStorage.setItem("tvShowList", JSON.stringify(mediaList));
                    localStorage.setItem("tvShowCategories", JSON.stringify(categories));
                } catch (err) {
                    showNotification("Errore nel salvataggio dei dati", "error");
                }
                return Promise.resolve();
            }
        }

        function saveSocialData() {
            if (isViewMode || !currentUser) return;
            return db.ref(`users/${currentUser.uid}/social`).set({ followedFriends, lastCheckedTimestamps, username: currentUsername || null });
        }

        function renderFullUI() {
            renderCategorySections();
            updateCategoryFilter();
            updateStats();
            renderMedia();
            displayLastUpdateTime();
        }

        function calculateProgress(show) {
            const watchedEpisodes = Object.keys(show.progress || {}).length;

            // Se la modalità speciale è attiva, calcola il totale includendo TUTTI gli speciali
            if (show.includeSpecialsInProgress) {
                return {
                    watchedEpisodes,
                    totalEpisodes: Object.values(show.seasons || {}).reduce((sum, season) => sum + (season.episodes || []).length, 0)
                };
            }

            // Altrimenti, calcola il totale standard (solo stagioni > 0)
            const totalEpisodes = Object.entries(show.seasons || {})
                .filter(([seasonNum]) => parseInt(seasonNum) > 0)
                .reduce((sum, [, season]) => sum + (season.episodes || []).length, 0);

            return { watchedEpisodes, totalEpisodes };
        }


        function getRottenTomatoesState(score) { if (!score || score === "N/A") return null; const value = parseInt(String(score).replace('%', '')); return isNaN(value) ? null : value >= 75 ? "certified" : value >= 60 ? "fresh" : "rotten"; }
        function getPopcornState(score) { if (!score || score === "N/A") return null; const value = parseInt(String(score).replace('%', '')); return isNaN(value) ? null : value >= 60 ? "positive" : "negative"; }

        function sanitizeForId(text) {
            return text.replace(/[^a-zA-Z0-9]/g, '');
        }

        function updateStats() {
            statContributorIds.clear();
            ignoredDuplicateIds.clear();
            const processed = new Set();
            mediaList.forEach(media => {
                const uniqueId = (media.imdbID || media.tmdbID) || media.title.toLowerCase().trim();
                if (!uniqueId || processed.has(uniqueId)) return;
                processed.add(uniqueId);
                const instances = mediaList.filter(m => ((m.imdbID && m.imdbID === media.imdbID) || (m.tmdbID && m.tmdbID === media.tmdbID)) || (!m.imdbID && !m.tmdbID && m.title.toLowerCase() === media.title.toLowerCase()));
                let contributor = instances.find(m => DEFAULT_CATEGORIES.includes(m.category)) || instances[0];
                if (contributor) {
                    statContributorIds.add(contributor.id);
                    instances.forEach(inst => {
                        if (inst.id !== contributor.id) ignoredDuplicateIds.add(inst.id);
                    });
                }
            });

            const stats = { InCorso: 0, Completate: 0, DaVedere: 0, InPausaDroppata: 0, episodesWatched: 0, episodesRewatched: 0, minutesWatched: 0 };
            statContributorIds.forEach(id => {
                const show = mediaList.find(m => m.id === id);
                if (!show) return;

                if (show.isDropped) {
                    stats.InPausaDroppata++;
                } else {
                    const categoryKey = sanitizeForId(show.category);
                    if (stats.hasOwnProperty(categoryKey)) {
                        stats[categoryKey]++;
                    }
                }

                // Usiamo il conteggio degli episodi visti per le statistiche generali
                const watchedEpisodes = Object.keys(show.progress || {}).length;
                stats.episodesWatched += watchedEpisodes;

                // Calcolo episodi rivisti (somma dei conteggi)
                if (show.rewatches) {
                    const totalRewatches = Object.values(show.rewatches).reduce((sum, count) => sum + count, 0);
                    stats.episodesRewatched += totalRewatches;
                }

                if (show.seasons) {
                    Object.keys(show.progress).forEach(progressKey => {
                        const [seasonNum, episodeNum] = progressKey.split('-').map(Number);
                        const season = show.seasons[seasonNum];
                        if (season && season.episodes) {
                            const episode = season.episodes.find(e => e.episode_number == episodeNum);
                            if (episode && episode.runtime) {
                                const rewatches = show.rewatches?.[progressKey] || 0;
                                stats.minutesWatched += episode.runtime * (1 + rewatches);
                            }
                        }
                    });
                }
            });

            elements.statTotal.textContent = statContributorIds.size;
            elements.statFollowing.textContent = stats.InCorso || 0;
            elements.statCompleted.textContent = stats.Completate || 0;
            elements.statToWatch.textContent = stats.DaVedere || 0;
            elements.statPaused.textContent = stats.InPausaDroppata || 0;
            elements.statEpisodes.textContent = stats.episodesWatched;
            elements.statEpisodiRivisti.textContent = stats.episodesRewatched;

            const hours = Math.floor(stats.minutesWatched / 60);
            const minutes = stats.minutesWatched % 60;
            const formattedHours = `${hours}h ${minutes}m`;
            elements.statHours.textContent = formattedHours;
            if (elements.advancedStatTotal) elements.advancedStatTotal.textContent = statContributorIds.size;
            if (elements.advancedStatToWatch) elements.advancedStatToWatch.textContent = stats.DaVedere || 0;
            if (elements.advancedStatFollowing) elements.advancedStatFollowing.textContent = stats.InCorso || 0;
            if (elements.advancedStatCompleted) elements.advancedStatCompleted.textContent = stats.Completate || 0;
            if (elements.advancedStatPaused) elements.advancedStatPaused.textContent = stats.InPausaDroppata || 0;
            if (elements.advancedStatEpisodes) elements.advancedStatEpisodes.textContent = stats.episodesWatched;
            if (elements.advancedStatRewatched) elements.advancedStatRewatched.textContent = stats.episodesRewatched;
            if (elements.advancedStatHours) elements.advancedStatHours.textContent = formattedHours;
        }

        function renderMedia() {
            const selectedCategory = document.getElementById('categoryFilter').dataset.value || 'all';
            const searchTerm = elements.searchInput.value.toLowerCase();
            const sortBy = document.getElementById('sortFilter').dataset.value || 'added';

            document.querySelectorAll(".media-section").forEach(s => s.style.display = 'block');
            document.querySelectorAll(".media-grid").forEach(g => g.innerHTML = '');

            let filteredMedia = [...mediaList];

            if (searchTerm) {
                filteredMedia = filteredMedia.filter(m =>
                    m.title.toLowerCase().includes(searchTerm) ||
                    (m.italianTitle && m.italianTitle.toLowerCase().includes(searchTerm))
                );
            }

            if (selectedCategory === 'favorites') {
                filteredMedia = filteredMedia.filter(m => m.isFavorite);
            } else if (selectedCategory !== 'all') {
                filteredMedia = filteredMedia.filter(m => m.category === selectedCategory);
            }

            filteredMedia.sort((a, b) => {
                switch (sortBy) {
                    case "alpha": return a.title.localeCompare(b.title);
                    case "rating": return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
                    case "year": return (b.year.split('–')[0] || 0) - (a.year.split('–')[0] || 0);
                    case "activity":
                        // Sort dropped shows to the bottom
                        if (a.isDropped && !b.isDropped) return 1;
                        if (!a.isDropped && b.isDropped) return -1;
                        return new Date(b.lastActivityAt || b.addedAt) - new Date(a.lastActivityAt || a.addedAt);
                    case "added":
                    default:
                        // Sort dropped shows to the bottom
                        if (a.isDropped && !b.isDropped) return 1;
                        if (!a.isDropped && b.isDropped) return -1;
                        return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
                }
            });

            // --- INIZIO OTTIMIZZAZIONE RENDERING ---
            const fragments = {};
            categories.forEach(cat => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                fragments[sanitizeForId(catName)] = document.createDocumentFragment();
            });

            filteredMedia.forEach(media => {
                const gridId = sanitizeForId(media.category);
                if (fragments[gridId]) {
                    fragments[gridId].appendChild(createMediaCard(media));
                }
            });

            categories.forEach(cat => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const gridId = sanitizeForId(catName) + "Grid";
                const grid = document.getElementById(gridId);

                if (grid && fragments[sanitizeForId(catName)].childNodes.length > 0) {
                    grid.appendChild(fragments[sanitizeForId(catName)]);
                }
            });
            // --- FINE OTTIMIZZAZIONE RENDERING ---

            let hasContent = false;
            categories.forEach(catObj => {
                const categoryName = typeof catObj === 'string' ? catObj : catObj.name;
                const section = document.querySelector(`.media-section[data-category="${categoryName}"]`);
                if (!section) return;

                const grid = section.querySelector('.media-grid');
                const countEl = section.querySelector('.category-count');
                if (!grid) return;

                const count = grid.children.length;
                if (countEl) countEl.textContent = count;

                // Se la griglia è vuota, nascondi l'intera sezione fluidamente
                if (count === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                    hasContent = true;
                }
            });

            // Show global empty state if NO categories have content
            const noResultsMsg = document.getElementById('noResultsGlobal');
            if (noResultsMsg) {
                noResultsMsg.style.display = hasContent ? 'none' : 'block';
            }

            if (selectedCategory === 'favorites' && !filteredMedia.length) {
                renderCategorySections();
                elements.mediaSectionsContainer.innerHTML = `<div class="media-section"><div class="empty-state"><i class="fas fa-heart-crack"></i><p>Nessun preferito aggiunto.</p></div></div>`;
            } else if (selectedCategory === 'favorites' && filteredMedia.length > 0) {
                document.querySelectorAll('.media-section').forEach(s => {
                    if (s.querySelector('.media-grid').children.length === 0) s.style.display = 'none';
                })
            }

            setupLazyLoading();
        }


        function createMediaCard(show) {
            const card = document.createElement("div");
            card.className = "media-card";
            card.dataset.id = show.id;

            // Ripristino logica status e priorità
            if (show.priority === 'high') card.classList.add("is-high-priority");
            if (statContributorIds.has(show.id)) card.classList.add("is-stat-contributor");
            if (ignoredDuplicateIds.has(show.id)) card.classList.add("is-duplicate");

            // --- LOGICA LONG PRESS ---
            let pressTimer;
            let isLongPress = false;

            const startPress = (e) => {
                isLongPress = false;
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    // Feedback aptico (vibrazione) se supportato
                    if (navigator.vibrate) navigator.vibrate(50);

                    // Prende le coordinate del tocco (se mobile) o del mouse
                    const touch = e.touches ? e.touches[0] : e;
                    showContextMenu(show, { x: touch.clientX, y: touch.clientY });
                }, 500); // 500 millisecondi = Long Tap
            };

            const cancelPress = () => {
                clearTimeout(pressTimer);
            };

            // Eventi Touch (Mobile)
            card.addEventListener('touchstart', startPress, { passive: true });
            card.addEventListener('touchend', cancelPress);
            card.addEventListener('touchmove', cancelPress); // Annulla se scorri la pagina

            // Eventi Mouse (Desktop: click sinistro trattenuto)
            card.addEventListener('mousedown', (e) => { if (e.button === 0) startPress(e); });
            card.addEventListener('mouseup', cancelPress);
            card.addEventListener('mouseleave', cancelPress);

            // Click normale
            card.addEventListener('click', (e) => {
                // Se abbiamo appena fatto un long press, blocchiamo l'apertura del modale dettagli
                if (isLongPress) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                if (e.target.closest('.favorite-btn') || e.target.closest('.card-actions')) return;
                showDetailsModal(show.id);
            });

            // Click Destro (Desktop) apre direttamente il menu
            card.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(show, { x: e.clientX, y: e.clientY });
            });
            // -------------------------

            const { watchedEpisodes, totalEpisodes } = calculateProgress(show);
            const percentage = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

            let progressBarClass = "progress-bar";
            if (show.status === "Ended" || show.status === "Canceled") {
                progressBarClass += " ended";
            }
            if (show.isDropped) {
                card.classList.add('dropped');
                progressBarClass += " dropped";
                // Force red counter for dropped shows
                const counter = card.querySelector('.unwatched-counter');
                if (counter) counter.style.backgroundColor = 'var(--danger)';
            }
            if (show.category === 'In Pausa / Droppata') {
                progressBarClass += " dropped";
            }

            let ratingsHTML = '';
            const rtState = getRottenTomatoesState(show.rottenTomatoes);
            const popcornState = getPopcornState(show.popcornRating);

            // IMDb
            if (show.imdbRating && show.imdbRating !== "N/A") {
                ratingsHTML += `<span class="rating-badge"><img src="${IMDB_STAR_ICON}" class="rating-icon">&nbsp;${show.imdbRating}</span>`;
            }
            // Rotten Tomatoes Critica
            if (rtState) {
                ratingsHTML += `<span class="rating-badge"><img src="${ROTTEN_TOMATOES_ICONS[rtState]}" class="rating-icon">&nbsp;${show.rottenTomatoes}</span>`;
            }
            // Rotten Tomatoes Pubblico
            if (popcornState) {
                ratingsHTML += `<span class="rating-badge"><img src="${POPCORN_ICONS[popcornState]}" class="rating-icon">&nbsp;${show.popcornRating}</span>`;
            }

            const ratingsSection = ratingsHTML ? `<div class="media-ratings">${ratingsHTML}</div>` : "";

            const actionsHTML = isViewMode ? '' : `
        <div class="card-actions">
            <button class="card-btn" data-action="menu" title="Azioni"><i class="fas fa-ellipsis-h"></i></button>
        </div>`;

            const categoryObject = categories.find(c => c.name === show.category);
            const episodeMetaHTML = totalEpisodes > 0 ? `
            <span class="episode-count-meta"><i class="fas fa-list-check"></i>${watchedEpisodes}/${totalEpisodes}</span>` : '';
            const mobileRatingHTML = (episodeMetaHTML || (show.imdbRating && show.imdbRating !== "N/A"))
                ? `<div class="progress-text">
                    ${episodeMetaHTML}
                    ${(show.imdbRating && show.imdbRating !== "N/A") ? `<span class="mobile-imdb-rating"><img src="${IMDB_STAR_ICON}" class="rating-icon" alt=""> ${show.imdbRating}</span>` : ''}
                  </div>`
                : '';
            const progressHTML = (categoryObject && categoryObject.hideProgress) ? '' : `
        <div class="media-progress">
          <div class="media-progress-row">
            <div class="progress-bar-container"><div class="${progressBarClass}" style="width: ${percentage}%;"></div></div>
            ${episodeMetaHTML}
          </div>
          ${mobileRatingHTML}
        </div>`;

            const optimizedPoster = (show.poster && show.poster.includes('w500'))
                ? show.poster.replace('w500', 'w342')
                : (show.poster || DEFAULT_POSTER);
            card.innerHTML = `
        <div class="poster-container">
            <img data-src="${optimizedPoster}" class="media-poster lazy" onerror="this.src='${DEFAULT_POSTER}'">
            <button class="favorite-btn ${show.isFavorite ? 'is-favorite' : ''}" title="Aggiungi ai preferiti"><i class="fas fa-heart"></i></button>
            ${actionsHTML}
        </div>
        <div class="media-info">
          <h3 class="media-title" title="${show.title}">${show.title}</h3>
          <div class="media-meta">
            <span class="media-meta-year" title="${show.year || ''}">${show.year}</span>
          </div>
          <div class="media-ratings">${ratingsHTML}</div>
          ${progressHTML}
        </div>`;

            card.querySelector('.favorite-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(show.id); });
            if (!isViewMode) {
                card.querySelector('[data-action="menu"]').addEventListener("click", e => { e.stopPropagation(); showContextMenu(show, { x: e.clientX, y: e.clientY }); });
            }
            return card;
        }

        function refreshSingleMedia(id) {
            const show = mediaList.find(m => m.id === id);
            if (!show) return;
            const oldCard = document.querySelector(`.media-card[data-id="${id}"]`);
            if (oldCard) {
                const oldCategory = oldCard.closest('.media-section').dataset.category;
                if (oldCategory !== show.category) {
                    renderMedia();
                } else {
                    const newCard = createMediaCard(show);
                    oldCard.parentElement.replaceChild(newCard, oldCard);
                    if (lazyLoadObserver) lazyLoadObserver.observe(newCard.querySelector(".lazy"));
                }
            } else {
                renderMedia();
            }
            updateStats();
        }

        async function addNewMedia(tmdbId) {
            showNotification("Recupero dettagli della serie...", "warning");
            try {
                const [enDetails, itDetails] = await Promise.all([
                    fetchFullTMDbDetails(tmdbId, 'en-US'),
                    fetchFullTMDbDetails(tmdbId, 'it-IT')
                ]);

                if (!enDetails) {
                    return showNotification("Dettagli della serie non trovati su TMDb.", "error");
                }

                const imdbID = enDetails.external_ids.imdb_id || null;
                const category = window.innerWidth <= 768
                    ? document.getElementById('addMediaCategorySelect').value
                    : document.getElementById('addMediaCategoryCustom').dataset.value;
                localStorage.setItem("lastUsedTvShowCategory", category);

                const isDuplicateInDefaultCategory = mediaList.some(m =>
                    ((imdbID && m.imdbID === imdbID) || m.tmdbID === tmdbId) && DEFAULT_CATEGORIES.includes(m.category)
                );
                if (DEFAULT_CATEGORIES.includes(category) && isDuplicateInDefaultCategory) {
                    return showNotification("Questa serie è già in una categoria principale.", "warning");
                }

                const isDuplicateInSameCategory = mediaList.some(m =>
                    ((imdbID && m.imdbID === imdbID) || m.tmdbID === tmdbId) && m.category === category
                );
                if (isDuplicateInSameCategory) {
                    return showNotification(`Questa serie è già in "${category}"`, "warning");
                }

                let newShow = {
                    ...getDefaultShowProps(),
                    id: Date.now().toString(),
                    title: enDetails.name,
                    italianTitle: itDetails ? itDetails.name : enDetails.name,
                    genres: enDetails.genres ? enDetails.genres.map(g => g.name) : [],
                    imdbID: imdbID,
                    tmdbID: tmdbId,
                    category: category,
                    poster: enDetails.poster_path ? `https://image.tmdb.org/t/p/w500${enDetails.poster_path}` : DEFAULT_POSTER,
                    addedAt: new Date().toISOString(),
                    lastActivityAt: new Date().toISOString()
                };

                const existingShow = mediaList.find(m => (imdbID && m.imdbID === imdbID) || (m.tmdbID === tmdbId));
                if (existingShow) {
                    newShow.progress = JSON.parse(JSON.stringify(existingShow.progress));
                    newShow.rewatches = JSON.parse(JSON.stringify(existingShow.rewatches || {}));
                }

                let omdbDetails = null;
                let mdbListRatings = null;
                if (newShow.imdbID) {
                    [omdbDetails, mdbListRatings] = await Promise.all([
                        getOMDbShowDetails(newShow.imdbID),
                        fetchMDBListRatings(newShow.imdbID)
                    ]);
                }

                const firstYear = enDetails.first_air_date ? enDetails.first_air_date.split('-')[0] : '';
                const status = enDetails.status;
                const lastYear = (status === 'Ended' || status === 'Canceled') && enDetails.last_air_date ? enDetails.last_air_date.split('-')[0] : '';

                if (firstYear && lastYear && firstYear !== lastYear) {
                    newShow.year = `${firstYear}–${lastYear}`;
                } else if (firstYear && (status === 'Returning Series' || status === 'In Production' || status === 'Planned')) {
                    newShow.year = `${firstYear} – In corso`;
                } else {
                    newShow.year = firstYear;
                }

                newShow.status = status;
                newShow.imdbRating = (omdbDetails?.imdbRating && omdbDetails.imdbRating !== "N/A") ? omdbDetails.imdbRating : (enDetails.vote_average ? enDetails.vote_average.toFixed(1) : "N/A");

                // Per le nuove serie, scarica solo le stagioni regolari per evitare di aggiungere speciali non richiesti
                const seasonPromises = enDetails.seasons
                    .filter(s => s.season_number > 0)
                    .map(s => fetchTMDbSeasonDetailsWithFallback(enDetails.id, s.season_number));

                const seasonsData = await Promise.all(seasonPromises);
                seasonsData.forEach(season => {
                    if (season) {
                        newShow.seasons[season.season_number] = {
                            name: season.name,
                            episodes: (season.episodes || []).map(ep => ({
                                name: ep.name,
                                overview: ep.overview,
                                episode_number: ep.episode_number,
                                runtime: ep.runtime || 0,
                                still_path: ep.still_path,
                                air_date: ep.air_date
                            }))
                        };
                    }
                });

                if (category === "Completate" && !existingShow) {
                    Object.keys(newShow.seasons).forEach(seasonNum => {
                        (newShow.seasons[seasonNum].episodes || []).forEach(ep => {
                            newShow.progress[`${seasonNum}-${ep.episode_number}`] = true;
                        });
                    });
                }

                if (mdbListRatings) {
                    const rtRating = mdbListRatings.find(r => r.source === 'tomatoes');
                    const popcornRating = mdbListRatings.find(r => r.source === 'tomatoesaudience');
                    const letterboxdRating = mdbListRatings.find(r => r.source === 'letterboxd');
                    const metacriticRating = mdbListRatings.find(r => r.source === 'metacritic');

                    if (rtRating) newShow.rottenTomatoes = rtRating.value;
                    if (popcornRating) newShow.popcornRating = popcornRating.value;
                    if (letterboxdRating) newShow.letterboxdRating = letterboxdRating.value;
                    if (metacriticRating) newShow.metacriticRating = metacriticRating.value;

                } else if (omdbDetails && omdbDetails.Ratings) {
                    const rt = omdbDetails.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                    if (rt) newShow.rottenTomatoes = rt.Value;
                }

                mediaList.push(newShow);
                await logActivity('add_show', newShow.title, `alla categoria '${newShow.category}'`);
                await saveData();

                elements.mediaTitle.value = '';
                elements.tmdbResults.innerHTML = '';
                currentTMDbSelection = null;
                renderFullUI();
                showNotification(`"${newShow.title}" aggiunto!`, "success");
                closeModal(elements.mediaManagementModal);
            } catch (error) {
                console.error("Errore durante l'aggiunta della serie:", error);
                showNotification("Errore nel recuperare i dettagli della serie.", "error");
            }
        }

        async function getOMDbShowDetails(imdbId) { if (!imdbId) return null; const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${imdbId}`); return res.ok ? await res.json() : null; }

        async function fetchTMDbDetailsWithFallback(imdbId) {
            let details = await fetchTMDbShowDetailsByIMDb(imdbId, 'it-IT');
            if (details && !details.overview) {
                const en_details = await fetchTMDbShowDetailsByIMDb(imdbId, 'en-US');
                if (en_details) details.overview = en_details.overview;
            }
            return details;
        }

        async function fetchTMDbShowDetailsByIMDb(imdbId, lang = 'it-IT') {
            if (!imdbId) return null;
            const findRes = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`);
            if (!findRes.ok) return null;
            const findData = await findRes.json();
            const tmdbShow = findData.tv_results[0];
            if (!tmdbShow) return null;
            return await fetchFullTMDbDetails(tmdbShow.id, lang);
        }

        async function fetchFullTMDbDetails(tmdbId, lang = 'en-US') {
            const detailsRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=${lang}&append_to_response=credits,external_ids`);
            return detailsRes.ok ? await detailsRes.json() : null;
        }

        async function fetchTMDbSeasonDetailsWithFallback(tvId, seasonNumber) {
            let season = await fetchTMDbSeasonDetails(tvId, seasonNumber, 'it-IT');
            if (season && (!season.overview || (season.episodes && season.episodes.some(e => !e.name || !e.overview)))) {
                const en_season = await fetchTMDbSeasonDetails(tvId, seasonNumber, 'en-US');
                if (en_season) {
                    if (!season.overview) season.overview = en_season.overview;
                    if (season.episodes) {
                        season.episodes.forEach((ep, index) => {
                            if (!ep.name && en_season.episodes[index]) ep.name = en_season.episodes[index].name;
                            if (!ep.overview && en_season.episodes[index]) ep.overview = en_season.episodes[index].overview;
                        });
                    }
                }
            }
            return season;
        }
        async function fetchTMDbSeasonDetails(tvId, seasonNumber, lang = 'it-IT') {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_KEY}&language=${lang}`);
            return res.ok ? await res.json() : null;
        }

        async function fetchMDBListRatings(imdbId) {
            if (!imdbId || !MDBLIST_PROXY_URL || MDBLIST_PROXY_URL === "INCOLLA_L_URL_DEL_TUO_WORKER_QUI") return null;
            try {
                const res = await fetch(`${MDBLIST_PROXY_URL}?i=${imdbId}`);
                if (!res.ok) return null;
                const data = await res.json();
                return data.ratings || null;
            } catch (error) {
                console.error("Errore nel recupero dati da MDBList:", error);
                return null;
            }
        }

        async function fetchBestTMDbDetails(show) {
            let details = null;
            if (show.tmdbID) {
                details = await fetchFullTMDbDetails(show.tmdbID, 'it-IT');
                if (details && !details.overview) {
                    const en_details = await fetchFullTMDbDetails(show.tmdbID, 'en-US');
                    if (en_details) details.overview = en_details.overview;
                }
            } else if (show.imdbID) {
                details = await fetchTMDbDetailsWithFallback(show.imdbID);
            }
            return details;
        }

        async function showDetailsModal(showId, force = false, silent = false) {
            const show = mediaList.find(m => m.id === showId);
            if (!show) return [];

            if (force) {
                return await forceRefreshShow(showId, silent);
            }

            const requestToken = ++activeShowDetailsRequestToken;
            const cachedEntry = getCachedShowDetails(show);
            const hasFreshCache = isShowDetailsCacheFresh(cachedEntry);

            openModal(elements.detailsModal);
            renderDetailsShell(show);

            if (cachedEntry?.data) {
                currentShowCache = { show, tmdbDetails: cachedEntry.data };
                populateDetailsModal(cachedEntry.data, show);
                if (hasFreshCache) return [];
            }

            try {
                const tmdbDetails = await fetchShowDetailsForModal(show, { forceRefresh: !hasFreshCache });
                if (!tmdbDetails) {
                    if (!cachedEntry?.data) {
                        elements.detailsModalContent.innerHTML = "<p>Dettagli non trovati.</p>";
                        elements.detailsModalContent.classList.remove('is-loading');
                        elements.detailsModalContent.classList.add('is-ready');
                        elements.detailsModalContent.setAttribute('aria-busy', 'false');
                    }
                    return [];
                }

                const metadataResult = applyShowMetadataFromDetails(show, tmdbDetails);
                if (metadataResult.hasChanges) {
                    saveData();
                }

                currentShowCache = { show, tmdbDetails };
                if (requestToken === activeShowDetailsRequestToken && isModalVisible(elements.detailsModal)) {
                    populateDetailsModal(tmdbDetails, show);
                }
            } catch (error) {
                console.error("Errore caricamento dettagli serie:", error);
                if (!cachedEntry?.data) {
                    elements.detailsModalContent.classList.remove('is-loading');
                    elements.detailsModalContent.classList.add('is-ready');
                    elements.detailsModalContent.setAttribute('aria-busy', 'false');
                }
            }

            return [];
        }

        function buildDetailsShellPillRow(widths = []) {
            return `<div class="details-shell-pill-row">${widths.map(width => `<span class="details-shell-pill skeleton" style="width:${width};"></span>`).join('')}</div>`;
        }

        function buildDetailsShellParagraph(widths = []) {
            return `<div class="details-shell-paragraph">${widths.map(width => `<span class="details-shell-line skeleton" style="width:${width};"></span>`).join('')}</div>`;
        }

        function buildDetailsCastSkeleton(count = 6) {
            return Array.from({ length: count }, () => `
                <div class="details-shell-cast-card">
                    <div class="details-shell-cast-photo skeleton"></div>
                    <span class="details-shell-line skeleton" style="width:76%; margin:0 auto 8px;"></span>
                    <span class="details-shell-line skeleton" style="width:58%; margin:0 auto;"></span>
                </div>
            `).join('');
        }

        function renderDetailsShell(media) {
            const posterUrl = media.poster || DEFAULT_POSTER;
            const metaSkeleton = buildDetailsShellPillRow(['112px']);
            const ratingsSkeleton = buildDetailsShellPillRow(['84px', '96px', '90px']);
            const episodesBtnSkeleton = `<div class="details-shell-btn skeleton" style="width:118px; flex:0 0 118px;"></div>`;
            const infoSkeleton = `
                <div class="details-shell-stack">
                    ${buildDetailsShellPillRow(['64px', '88px'])}
                    ${buildDetailsShellPillRow(['74px', '92px', '68px'])}
                </div>
            `;
            const creatorSkeleton = `<div class="details-shell-slot">${buildDetailsShellParagraph(['52%'])}</div>`;
            const taglineSkeleton = `<span class="details-shell-line skeleton" style="width:54%;"></span>`;
            const overviewSkeleton = buildDetailsShellParagraph(['100%', '94%', '88%', '76%']);
            elements.detailsModalContent.classList.add('is-loading');
            elements.detailsModalContent.classList.remove('is-ready');
            elements.detailsModalContent.setAttribute('aria-busy', 'true');
            elements.detailsModalContent.innerHTML = `
                <div class="details-hero">
                    <div class="details-backdrop"></div>
                    <div class="details-hero-content">
                        <img id="detailsModalPoster" src="${posterUrl}" onerror="this.src='${DEFAULT_POSTER}'">
                        <div class="details-title-area">
                            <div class="details-title-row">
                                <h2 id="detailsModalTitle">${media.title}</h2>
                                <div id="shell-episodes-btn">${episodesBtnSkeleton}</div>
                            </div>
                            <div id="detailsModalMeta" class="meta-badges">${metaSkeleton}</div>
                            <div id="shell-ratings" class="details-ratings-container">${ratingsSkeleton}</div>
                            <div id="detailsModalTagline">${taglineSkeleton}</div>
                            <!-- CHEVRON -->
                            <button id="detailsChevronBtn" class="details-chevron-btn">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- PANNELLO ESPANDIBILE -->
                <div id="detailsExpandPanel" class="details-expand-panel">
                    <div class="details-main-grid">
                        <div class="details-left-col">
                            <h4 class="section-label" style="margin-bottom:0.5rem;">TRAMA</h4>
                            <div class="plot-container">
                                <div class="expandable-text details-shell-paragraph" id="detailsModalOverview" style="margin-top:0; margin-bottom:0;">${overviewSkeleton}</div>
                                <button class="read-more-btn" onclick="togglePlot(this)">Leggi Tutto</button>
                            </div>
                        </div>
                        <div class="details-right-col">
                            <div id="shell-year-runtime">${infoSkeleton}</div>
                            <h4 class="section-label" style="margin-bottom:0.5rem;">CREATORE / RETE</h4>
                            <div id="shell-creator" style="font-weight:600; color:white; margin-bottom:0;">${creatorSkeleton}</div>
                        </div>
                        <div class="details-cast-row">
                            <h4 class="section-label" style="margin-top:0.5rem; margin-bottom:0.5rem;">CAST PRINCIPALE</h4>
                            <div class="cast-scroller details-shell-cast" id="detailsModalCast">${buildDetailsCastSkeleton()}</div>
                        </div>
                    </div>
                </div>`;

            // Nasconde il pannello su mobile all'apertura
            if (window.innerWidth <= 768) {
                document.getElementById('detailsExpandPanel').style.display = 'none';
            }

            // --- GESTIONE PANNELLO ESPANDIBILE (SWIPE & CLICK) ---
            const chevronBtn = document.getElementById('detailsChevronBtn');
            const hero = elements.detailsModalContent.querySelector('.details-hero');
            const panel = document.getElementById('detailsExpandPanel');

            if (chevronBtn && panel) {
                // 1. Rende la freccetta cliccabile col dito!
                chevronBtn.style.pointerEvents = 'auto';
                chevronBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (panel.style.display === 'none' || panel.style.display === '') {
                        panel.style.display = 'block';
                        chevronBtn.classList.add('expanded');
                        panel.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        panel.style.display = 'none';
                        chevronBtn.classList.remove('expanded');
                    }
                };

                // 2. Mantiene il supporto allo Swipe per chi preferisce trascinare
                let swipeStartY = 0;
                hero.addEventListener('touchstart', (e) => {
                    swipeStartY = e.touches[0].clientY;
                }, { passive: true });

                hero.addEventListener('touchend', (e) => {
                    const swipeEndY = e.changedTouches[0].clientY;
                    const deltaY = swipeEndY - swipeStartY;

                    if (deltaY < -40) { // Swipe SU
                        panel.style.display = 'block';
                        chevronBtn.classList.add('expanded');
                        panel.scrollIntoView({ behavior: 'smooth' });
                    } else if (deltaY > 40) { // Swipe GIÙ
                        panel.style.display = 'none';
                        chevronBtn.classList.remove('expanded');
                    }
                }, { passive: true });
            }
        }

        function populateDetailsModal(details, media) {
            // 1. Sfondo
            const backdrop = elements.detailsModalContent.querySelector('.details-backdrop');
            if (details.backdrop_path && backdrop) {
                backdrop.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${details.backdrop_path})`;
            }

            // 2. Metadata Pills (Solo Preferiti in Hero)
            let metaHTML = '';
            if (!isViewMode) {
                metaHTML += `<button id="modalFavBtn" class="meta-pill" style="color:${media.isFavorite ? '#ff4444' : 'rgba(255,255,255,0.7)'}; transition: color 0.2s;"><i class="fas fa-heart"></i> ${media.isFavorite ? 'Preferito' : 'Aggiungi'}</button>`;
            }
            const totalRewatches = Object.values(media.rewatches || {}).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
            if (totalRewatches > 0) {
                metaHTML += `<span class="meta-pill" title="Episodi rivisti"><i class="fas fa-sync-alt"></i> Rewatch ${totalRewatches} ep</span>`;
            }
            document.getElementById('detailsModalMeta').innerHTML = metaHTML;

            // 2.1 Info e Generi Unificati (Destra)
            let rightMetaHTML = `
                <h4 class="section-label" style="margin-bottom:0.4rem;">INFO</h4>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1rem;">
                    <span class="genre-pill" style="background:var(--primary); color:white; border:none; cursor:default;">${media.year || 'N/D'}</span>
                    <span class="genre-pill" style="background:rgba(255,255,255,0.1); border:none; cursor:default;">${details.status || 'N/D'}</span>
                </div>
                <h4 class="section-label" style="margin-bottom:0.5rem;">GENERI</h4>
                <div class="genre-badges" style="margin-bottom:1rem;">
                    ${details.genres ? details.genres.map(g => `<span class="genre-pill">${g.name}</span>`).join('') : ''}
                </div>
            `;
            document.getElementById('shell-year-runtime').innerHTML = rightMetaHTML;

            // Il Tasto Episodi ancorato in alto a destra, di fianco al titolo ("come nel vecchio")
            const episodesContainer = document.getElementById('shell-episodes-btn');
            if (episodesContainer) {
                episodesContainer.innerHTML = `<button id="showEpisodesBtn" class="btn btn-primary"><i class="fas fa-list-check"></i> Episodi</button>`;
            }

            // 3. Voti
            const rtState = getRottenTomatoesState(media.rottenTomatoes);
            const popcornState = getPopcornState(media.popcornRating);
            let ratingsHTML = '';
            if (media.imdbRating && media.imdbRating !== "N/A") ratingsHTML += `<span class="rating-badge" title="IMDb"><img src="${IMDB_STAR_ICON}" class="rating-icon">&nbsp;${media.imdbRating}</span>`;
            if (rtState) ratingsHTML += `<span class="rating-badge" title="Rotten Tomatoes"><img src="${ROTTEN_TOMATOES_ICONS[rtState]}" class="rating-icon">&nbsp;${media.rottenTomatoes}</span>`;
            if (popcornState) ratingsHTML += `<span class="rating-badge" title="Audience Score"><img src="${POPCORN_ICONS[popcornState]}" class="rating-icon">&nbsp;${media.popcornRating}</span>`;
            if (media.letterboxdRating && media.letterboxdRating !== "N/A") ratingsHTML += `<span class="rating-badge" title="Letterboxd"><img src="${LETTERBOXD_ICON}" class="rating-icon">&nbsp;${media.letterboxdRating}</span>`;
            if (media.metacriticRating && media.metacriticRating !== "N/A") ratingsHTML += `<span class="rating-badge" title="Metacritic"><img src="${METACRITIC_ICON}" class="rating-icon">&nbsp;${media.metacriticRating}</span>`;
            document.getElementById('shell-ratings').innerHTML = ratingsHTML;

            // 4. Testi
            document.getElementById('detailsModalTagline').textContent = details.tagline ? `"${details.tagline}"` : '';
            const overview = document.getElementById('detailsModalOverview');
            overview.classList.remove('skeleton-text');
            overview.classList.remove('details-shell-paragraph');
            overview.classList.remove('expanded');
            overview.textContent = details.overview || 'Trama non disponibile.';
            if (window.applyTextTruncation) window.applyTextTruncation('detailsModalOverview');

            // --- CREATORE CLICCABILE ---
            const creator = details.created_by && details.created_by.length > 0 ? details.created_by[0] : null;
            const creatorEl = document.getElementById('shell-creator');

            if (creator) {
                creatorEl.innerHTML = `<span style="cursor:pointer; color:var(--primary); font-weight:700;" onclick="showActorModal('${creator.id}')">${creator.name}</span>`;
            } else {
                // Se non c'è un creatore (es. serie vecchie), mostra la rete televisiva (Network)
                const network = details.networks && details.networks.length > 0 ? details.networks[0].name : 'N/D';
                creatorEl.textContent = network;
            }

            // 6. Cast
            const cast = (details.credits && details.credits.cast) ? details.credits.cast : [];
            document.getElementById('detailsModalCast').innerHTML = cast.slice(0, 12).map(a => `
                <div class="actor-card" onclick="showActorModal('${a.id}')">
                    <img src="${a.profile_path ? 'https://image.tmdb.org/t/p/w200' + a.profile_path : DEFAULT_ACTOR_PHOTO}" class="actor-photo" onerror="this.src='${DEFAULT_ACTOR_PHOTO}'">
                    <div class="actor-name">${a.name}</div>
                    <div class="actor-character">${a.character}</div>
                </div>`).join('');

            const episodesBtn = document.getElementById('showEpisodesBtn');
            if (episodesBtn) episodesBtn.onclick = () => showEpisodesModal(media);

            const favBtn = document.getElementById('modalFavBtn');
            if (favBtn) favBtn.onclick = () => { toggleFavorite(media.id); populateDetailsModal(details, mediaList.find(m => m.id === media.id)); };
            elements.detailsModalContent.classList.remove('is-loading');
            requestAnimationFrame(() => {
                elements.detailsModalContent.classList.add('is-ready');
                elements.detailsModalContent.setAttribute('aria-busy', 'false');
            });
        }

        function getSortedSeasonNumbers(show) {
            return Object.keys(show.seasons || {}).map(Number).sort((a, b) => {
                if (a === 0) return 1;
                if (b === 0) return -1;
                return a - b;
            });
        }

        function getNextUnwatchedEpisodeInfo(show, sortedSeasonNumbers = getSortedSeasonNumbers(show)) {
            for (const seasonNum of sortedSeasonNumbers) {
                const season = show.seasons?.[seasonNum];
                if (!season?.episodes) continue;

                for (const ep of season.episodes) {
                    if (!show.progress[`${seasonNum}-${ep.episode_number}`]) {
                        return {
                            seasonNumber: seasonNum,
                            episodeNumber: ep.episode_number,
                            episodeId: `item-${show.id}-${seasonNum}-${ep.episode_number}`,
                            shortLabel: `${seasonNum > 0 ? `S${seasonNum}` : 'SP'}E${ep.episode_number}`,
                            fullLabel: `${seasonNum > 0 ? `Stagione ${seasonNum}` : 'Speciali'} · Episodio ${ep.episode_number}`,
                            title: ep.name || `Episodio ${ep.episode_number}`
                        };
                    }
                }
            }

            return null;
        }

        function getEpisodesModalSummary(show, sortedSeasonNumbers = getSortedSeasonNumbers(show)) {
            let watchedEpisodes = 0;
            let totalEpisodes = 0;
            let completedSeasons = 0;
            let totalSeasons = 0;

            sortedSeasonNumbers.forEach(seasonNum => {
                const episodes = show.seasons?.[seasonNum]?.episodes || [];
                if (episodes.length === 0) return;

                totalSeasons++;
                totalEpisodes += episodes.length;

                const watchedInSeason = episodes.filter(ep => show.progress[`${seasonNum}-${ep.episode_number}`]).length;
                watchedEpisodes += watchedInSeason;
                if (watchedInSeason === episodes.length) completedSeasons++;
            });

            return {
                watchedEpisodes,
                totalEpisodes,
                completedSeasons,
                totalSeasons,
                nextEpisode: getNextUnwatchedEpisodeInfo(show, sortedSeasonNumbers)
            };
        }

        function isSeasonExpanded(seasonNumber) {
            const target = document.getElementById(`season-episodes-${seasonNumber}`);
            return !!(target && target.style.maxHeight && target.style.maxHeight !== '0px');
        }

        function setSeasonExpanded(seasonNumber, shouldExpand) {
            const target = document.getElementById(`season-episodes-${seasonNumber}`);
            if (!target) return;
            target.style.maxHeight = shouldExpand ? `${target.scrollHeight}px` : null;
        }

        function areAllSeasonBlocksExpanded() {
            const show = currentShowCache?.show;
            if (!show) return false;

            const seasonNumbers = getSortedSeasonNumbers(show).filter(seasonNum => {
                const episodes = show.seasons?.[seasonNum]?.episodes || [];
                return episodes.length > 0;
            });

            return seasonNumbers.length > 0 && seasonNumbers.every(isSeasonExpanded);
        }

        function updateEpisodesToolbarOffset() {
            const toolbar = document.getElementById('episodesModalToolbar');
            if (!elements.episodesModalContent || !toolbar) return;
            elements.episodesModalContent.style.setProperty('--episodes-toolbar-offset', `${toolbar.offsetHeight}px`);
        }

        function refreshEpisodesToolbar(show = currentShowCache?.show) {
            if (!show) return;

            const summary = getEpisodesModalSummary(show);
            const episodeProgressEl = document.getElementById('episodesToolbarEpisodes');
            const seasonProgressEl = document.getElementById('episodesToolbarSeasons');
            const nextInfoEl = document.getElementById('episodesToolbarNext');
            const nextBtn = document.getElementById('episodesToolbarNextBtn');
            const toggleAllBtn = document.getElementById('episodesToolbarToggleAllBtn');

            if (episodeProgressEl) {
                episodeProgressEl.innerHTML = `<i class="fas fa-play-circle"></i><span><strong>${summary.watchedEpisodes}/${summary.totalEpisodes || 0}</strong> episodi</span>`;
            }

            if (seasonProgressEl) {
                seasonProgressEl.innerHTML = `<i class="fas fa-layer-group"></i><span><strong>${summary.completedSeasons}/${summary.totalSeasons || 0}</strong> stagioni</span>`;
            }

            if (nextInfoEl) {
                const nextLabel = summary.nextEpisode
                    ? `<i class="fas fa-forward"></i><span><strong>${summary.nextEpisode.shortLabel}</strong> ${summary.nextEpisode.title}</span>`
                    : `<i class="fas fa-check-circle"></i><span><strong>Completata</strong> Nessun episodio in sospeso</span>`;
                nextInfoEl.classList.toggle('is-highlight', !!summary.nextEpisode);
                nextInfoEl.classList.toggle('is-complete', !summary.nextEpisode);
                nextInfoEl.innerHTML = nextLabel;
            }

            if (nextBtn) {
                nextBtn.disabled = !summary.nextEpisode;
                nextBtn.title = summary.nextEpisode
                    ? `Vai a ${summary.nextEpisode.shortLabel} ${summary.nextEpisode.title}`
                    : 'Serie completata';
                nextBtn.setAttribute('aria-label', summary.nextEpisode
                    ? `Vai al prossimo episodio: ${summary.nextEpisode.shortLabel} ${summary.nextEpisode.title}`
                    : 'Serie completata');
                nextBtn.innerHTML = summary.nextEpisode
                    ? `<i class="fas fa-bolt"></i><span class="episodes-toolbar-btn-label">Vai al prossimo</span>`
                    : `<i class="fas fa-check"></i><span class="episodes-toolbar-btn-label">Serie completata</span>`;
            }

            if (toggleAllBtn) {
                const allExpanded = areAllSeasonBlocksExpanded();
                toggleAllBtn.title = allExpanded ? 'Chiudi tutte le stagioni' : 'Espandi tutte le stagioni';
                toggleAllBtn.setAttribute('aria-label', allExpanded ? 'Chiudi tutte le stagioni' : 'Espandi tutte le stagioni');
                toggleAllBtn.innerHTML = allExpanded
                    ? `<i class="fas fa-compress-alt"></i><span class="episodes-toolbar-btn-label">Chiudi tutto</span>`
                    : `<i class="fas fa-expand-alt"></i><span class="episodes-toolbar-btn-label">Espandi tutto</span>`;
            }

            requestAnimationFrame(updateEpisodesToolbarOffset);
        }

        function scrollEpisodesModalToNextEpisode(behavior = 'smooth') {
            const show = currentShowCache?.show;
            if (!show) return;

            const nextEpisode = getEpisodesModalSummary(show).nextEpisode;
            if (!nextEpisode) {
                showNotification("Hai gia completato tutti gli episodi disponibili.", "success");
                return;
            }

            setSeasonExpanded(nextEpisode.seasonNumber, true);
            refreshEpisodesToolbar(show);

            requestAnimationFrame(() => {
                const episodeEl = document.getElementById(nextEpisode.episodeId);
                if (episodeEl) {
                    episodeEl.scrollIntoView({ behavior, block: 'center' });
                }
            });
        }

        function toggleAllEpisodesSeasons() {
            const show = currentShowCache?.show;
            if (!show) return;

            const seasonNumbers = getSortedSeasonNumbers(show).filter(seasonNum => {
                const episodes = show.seasons?.[seasonNum]?.episodes || [];
                return episodes.length > 0;
            });

            const shouldExpand = !areAllSeasonBlocksExpanded();
            seasonNumbers.forEach(seasonNum => setSeasonExpanded(seasonNum, shouldExpand));
            refreshEpisodesToolbar(show);
        }

        function showEpisodesModal(show) {
            currentShowCache = { show };
            populateEpisodesModal();
            openModal(elements.episodesModal);
            requestAnimationFrame(updateEpisodesToolbarOffset);
        }

        function populateEpisodesModal() {
            const { show } = currentShowCache;
            const sortedSeasonNumbers = getSortedSeasonNumbers(show);
            const summary = getEpisodesModalSummary(show, sortedSeasonNumbers);

            const seasonsHTML = sortedSeasonNumbers.map(seasonNum => {
                const season = show.seasons[seasonNum];
                return createSeasonBlockHTML(show, { ...season, season_number: seasonNum });
            }).join('');

                elements.episodesModalContent.innerHTML = `
                <div class="episodes-modal-toolbar" id="episodesModalToolbar">
                    <div class="episodes-toolbar-summary">
                        <div class="episodes-toolbar-pill" id="episodesToolbarEpisodes"></div>
                        <div class="episodes-toolbar-pill" id="episodesToolbarSeasons"></div>
                        <div class="episodes-toolbar-pill ${summary.nextEpisode ? 'is-highlight' : 'is-complete'}" id="episodesToolbarNext"></div>
                    </div>
                    <div class="episodes-toolbar-actions">
                        <button type="button" class="btn btn-primary" id="episodesToolbarNextBtn" onclick="scrollEpisodesModalToNextEpisode()"></button>
                        <button type="button" class="btn btn-secondary" id="episodesToolbarToggleAllBtn" onclick="toggleAllEpisodesSeasons()"></button>
                    </div>
                </div>
                <div class="seasons-container">${seasonsHTML}</div>`;

            sortedSeasonNumbers.forEach(setupSeasonEventListeners);
            refreshEpisodesToolbar(show);

        }

        function formatAirDate(airDateString) {
            if (!airDateString) return '';
            const airDate = new Date(airDateString + 'T00:00:00Z');
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            // Calcolo differenza giorni
            const diffTime = airDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const options = { day: 'numeric', month: 'short', year: '2-digit' };
            const dateStr = airDate.toLocaleDateString('it-IT', options);

            // HTML Base della data
            const baseDateHTML = `<span class="episode-date-badge"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>`;

            // Aggiunta Badge Countdown
            if (diffDays === 0) {
                return `${baseDateHTML} <span class="episode-countdown-badge today">Oggi</span>`;
            } else if (diffDays === 1) {
                return `${baseDateHTML} <span class="episode-countdown-badge future">Domani</span>`;
            } else if (diffDays > 1 && diffDays <= 30) {
                return `${baseDateHTML} <span class="episode-countdown-badge future">-${diffDays}gg</span>`;
            } else {
                return baseDateHTML;
            }
        }


        function createSeasonBlockHTML(show, season) {
            const seasonNumber = season.season_number;
            const episodes = season.episodes || [];
            const watchedInSeason = Object.keys(show.progress || {}).filter(key => key.startsWith(`${seasonNumber}-`)).length;
            const episodeCount = episodes.length;
            const isSeasonComplete = watchedInSeason === episodeCount && episodeCount > 0;
            const hasEpisodes = episodeCount > 0;

            let isSeasonRewatched = false;
            if (hasEpisodes && show.rewatches) {
                isSeasonRewatched = episodes.every(ep => (show.rewatches[`${seasonNumber}-${ep.episode_number}`] || 0) > 0);
            }

            const markAllButtonHTML = isSeasonComplete
                ? `<button class="btn btn-warning season-toggle-all-btn" title="Segna tutti come non visti" data-show-id="${show.id}" data-season-number="${seasonNumber}" data-action="unwatch"><i class="fas fa-times"></i></button>`
                : `<button class="btn btn-success season-toggle-all-btn" title="Segna tutti come visti" data-show-id="${show.id}" data-season-number="${seasonNumber}" data-action="watch"><i class="fas fa-check-double"></i></button>`;

            const seasonRewatchBtnHTML = `<button class="btn btn-secondary season-rewatch-btn" title="Imposta rewatch per la stagione" data-show-id="${show.id}" data-season-number="${seasonNumber}"><i class="fas fa-sync-alt"></i></button>`;

            let firstUnwatchedFound = false;
            const isMobile = window.innerWidth <= 768;
            const stillSize = isMobile ? 'w185' : 'w300';

            const allSeasonEpisodes = hasEpisodes ? episodes.map(ep => {
                const isWatched = show.progress[`${seasonNumber}-${ep.episode_number}`];
                const rewatchCount = show.rewatches?.[`${seasonNumber}-${ep.episode_number}`] || 0;
                let titleSpoilerClass = '';

                if (!isWatched) {
                    if (!firstUnwatchedFound) firstUnwatchedFound = true;
                    else titleSpoilerClass = 'spoiler';
                }

                return `
            <div class="episode-item ${isWatched ? 'watched' : ''}" id="item-${show.id}-${seasonNumber}-${ep.episode_number}" onclick="toggleEpisodeWatched('${show.id}', '${seasonNumber}', '${ep.episode_number}')">
                <div class="episode-still-wrapper">
                    <img data-src="${ep.still_path ? `https://image.tmdb.org/t/p/${stillSize}${ep.still_path}` : EMPTY_STILL_PLACEHOLDER}" class="episode-still lazy" onerror="this.src='${EMPTY_STILL_PLACEHOLDER}'">
                    <div class="episode-status-overlay"><i class="fas fa-check"></i></div>
                </div>
                <div class="episode-details">
                    <div class="episode-meta-row">
                        <div class="episode-meta-left">
                            <span class="episode-number">${seasonNumber > 0 ? `S${seasonNumber}` : 'SP'} E${ep.episode_number}</span>
                            ${formatAirDate(ep.air_date)}
                        </div>
                        <div class="episode-meta-right">
                             <div class="episode-rewatch-badge ${rewatchCount === 0 ? 'zero-count' : ''}" onclick="event.stopPropagation(); openRewatchModal({showId: '${show.id}', seasonNumber: '${seasonNumber}', episodeNumber: '${ep.episode_number}'})">
                                <i class="fas fa-sync-alt"></i>
                                ${rewatchCount > 0 ? `<span class="count">${rewatchCount}</span>` : ''}
                             </div>
                        </div>
                    </div>
                    <div class="episode-title ${titleSpoilerClass}">
                        ${ep.name || `Episodio ${ep.episode_number}`}
                        ${ep.runtime ? `<span class="episode-runtime-badge"><i class="fas fa-clock"></i> ${ep.runtime}m</span>` : ''}
                    </div>
                    <p class="episode-overview">${ep.overview || 'Nessuna trama disponibile.'}</p>
                </div>
            </div>`;
            }).join('') : '<div class="no-episodes-info">Dettagli episodi non ancora disponibili.</div>';

            return `
        <div class="season-block" id="season-block-${seasonNumber}">
            <div class="season-header" data-season-target="${seasonNumber}">
                <div class="season-title-container">
                    <span class="season-title">${season.name}</span>
                    ${isSeasonRewatched ? '<span class="season-rewatch-badge" title="Stagione rivista"><i class="fas fa-sync-alt"></i></span>' : ''}
                    <div class="season-progress-text" style="margin-left:auto; margin-right:10px;">${watchedInSeason} / ${episodeCount}</div>
                </div>
                <div class="season-actions">${hasEpisodes ? seasonRewatchBtnHTML + markAllButtonHTML : ''}</div>
            </div>
            <div class="season-episodes" id="season-episodes-${seasonNumber}">${allSeasonEpisodes}</div>
        </div>`;
        }

        function updateSeasonSpoilerState(show, seasonNumber) {
            const episodes = show.seasons?.[seasonNumber]?.episodes || [];
            let firstUnwatchedFound = false;

            episodes.forEach(ep => {
                const key = `${seasonNumber}-${ep.episode_number}`;
                const isWatched = !!show.progress?.[key];
                const item = document.getElementById(`item-${show.id}-${seasonNumber}-${ep.episode_number}`);
                if (!item) return;

                item.classList.toggle('watched', isWatched);

                const title = item.querySelector('.episode-title');
                if (!title) return;

                let shouldHideTitle = false;
                if (!isWatched) {
                    if (!firstUnwatchedFound) firstUnwatchedFound = true;
                    else shouldHideTitle = true;
                }

                title.classList.toggle('spoiler', shouldHideTitle);
            });
        }

        function getLinkedShowInstances(show) {
            if (!show) return [];

            return mediaList.filter(item =>
                item.id === show.id ||
                (show.imdbID && item.imdbID === show.imdbID) ||
                (show.tmdbID && item.tmdbID === show.tmdbID)
            );
        }

        function setupSeasonEventListeners(seasonNumber) {
            const seasonBlock = document.getElementById(`season-block-${seasonNumber}`);
            if (!seasonBlock) return;

            setupLazyLoading();

            seasonBlock.querySelector('.season-header').addEventListener('click', e => {
                if (!e.target.closest('.season-actions')) {
                    const target = document.getElementById(`season-episodes-${seasonNumber}`);
                    const isExpanded = target.style.maxHeight && target.style.maxHeight !== '0px';
                    if (isExpanded) {
                        target.style.maxHeight = null;
                    } else {
                        target.style.maxHeight = target.scrollHeight + 'px';
                    }
                    refreshEpisodesToolbar(currentShowCache?.show);
                }
            });

            const toggleAllBtn = seasonBlock.querySelector('.season-toggle-all-btn');
            if (toggleAllBtn) {
                toggleAllBtn.addEventListener('click', e => {
                    const { showId, seasonNumber, action } = e.currentTarget.dataset;
                    toggleSeasonWatched(showId, seasonNumber, action === 'watch');
                });
            }

            const seasonRewatchBtn = seasonBlock.querySelector('.season-rewatch-btn');
            if (seasonRewatchBtn) {
                seasonRewatchBtn.addEventListener('click', (e) => {
                    const { showId, seasonNumber } = e.currentTarget.dataset;
                    openRewatchModal({ showId, seasonNumber });
                });
            }
        }

        async function toggleSeasonWatched(showId, seasonNumber, watch) {
            if (isViewMode) return;
            const show = mediaList.find(m => m.id === showId);
            if (!show) return;

            const episodes = show.seasons[seasonNumber]?.episodes || [];
            const duplicates = getLinkedShowInstances(show);

            duplicates.forEach(dup => {
                if (dup.progress) {
                    episodes.forEach(ep => {
                        const key = `${seasonNumber}-${ep.episode_number}`;
                        if (watch) dup.progress[key] = true;
                        else delete dup.progress[key];
                    });
                    updateShowCategoryAndTimestamps(dup, true);
                }
            });

            if (watch) await logActivity('complete_season', show.title, `la stagione ${seasonNumber}`);

            currentShowCache.show = show;

            // 2. Aggiorna il DOM (Interfaccia)
            const seasonBlock = document.getElementById(`season-block-${seasonNumber}`);

            // Controllo se il modale è aperto e il blocco esiste
            if (seasonBlock && elements.episodesModal.style.display === 'flex') {
                // Memorizza se la stagione era aperta
                const episodesDiv = seasonBlock.querySelector('.season-episodes');
                const isExpanded = episodesDiv && episodesDiv.style.maxHeight && episodesDiv.style.maxHeight !== '0px';

                // Crea il nuovo HTML
                const newSeasonHTML = createSeasonBlockHTML(show, { ...show.seasons[seasonNumber], season_number: seasonNumber });

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newSeasonHTML;

                // --- FIX IMPORTANTE ---
                // Usa firstElementChild invece di firstChild per ignorare gli spazi vuoti/testo
                const newBlock = tempDiv.firstElementChild;

                if (newBlock) {
                    // Sostituisci il blocco vecchio con quello nuovo
                    seasonBlock.parentNode.replaceChild(newBlock, seasonBlock);
                    setupSeasonEventListeners(seasonNumber);

                    // Ripristina lo stato di apertura (se era aperta, riaprila)
                    if (isExpanded) {
                        const newEpisodesContainer = newBlock.querySelector('.season-episodes');
                        if (newEpisodesContainer) {
                            newEpisodesContainer.style.maxHeight = newEpisodesContainer.scrollHeight + 'px';
                        }
                    }
                }
            }

            refreshEpisodesToolbar(show);

            // 3. Salva e aggiorna statistiche
            await saveData();
            updateStats();
        }

        let isTogglingEpisode = false;
        function toggleEpisodeWatched(showId, season, episode) {
            if (isViewMode) return;
            if (isTogglingEpisode) return;
            isTogglingEpisode = true;
            setTimeout(() => { isTogglingEpisode = false; }, 150);
            // Find the show
            const show = mediaList.find(m => m.id === showId);
            if (!show) return;

            // Determine current state from data (not HTML)
            const key = `${season}-${episode}`;
            const wasWatched = show.progress[key] ? true : false;
            const isWatched = !wasWatched; // Toggle state

            // UI Optimistic Update (Instant Feedback)
            const item = document.getElementById(`item-${showId}-${season}-${episode}`);
            if (item) {
                if (isWatched) {
                    item.classList.add('watched');
                } else {
                    item.classList.remove('watched');
                }
            }

            // Update Logic for all duplicates
            const duplicates = getLinkedShowInstances(show);

            duplicates.forEach(dup => {
                if (isWatched) dup.progress[key] = true;
                else delete dup.progress[key];
                updateShowCategoryAndTimestamps(dup);
            });

            // Debounce save to avoid spamming if user clicks fast
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                saveData();
                updateStats();
                // Don't refresh media cards here - it causes the modal season to disappear
                // duplicates.forEach(dup => refreshSingleMedia(dup.id));
            }, 500);

            currentShowCache.show = show;

            // Update Season Header Progress Text
            const seasonBlock = document.getElementById(`season-block-${season}`);
            if (seasonBlock) {
                updateSeasonSpoilerState(show, season);

                const watchedInSeason = Object.keys(show.progress).filter(k => k.startsWith(`${season}-`)).length;
                const episodeCount = (show.seasons[season]?.episodes || []).length;
                seasonBlock.querySelector('.season-progress-text').textContent = `${watchedInSeason} / ${episodeCount}`;

                // Toggle the 'Mark All' button state
                const isSeasonComplete = watchedInSeason === episodeCount && episodeCount > 0;
                const actionButton = seasonBlock.querySelector('.season-toggle-all-btn');
                if (actionButton) {
                    actionButton.className = `btn season-toggle-all-btn ${isSeasonComplete ? 'btn-warning' : 'btn-success'}`;
                    actionButton.title = isSeasonComplete ? 'Segna tutti come non visti' : 'Segna tutti come visti';
                    actionButton.dataset.action = isSeasonComplete ? 'unwatch' : 'watch';
                    actionButton.innerHTML = `<i class="fas ${isSeasonComplete ? 'fa-times' : 'fa-check-double'}"></i>`;
                }
            }

            refreshEpisodesToolbar(show);
        }


        function updateShowCategoryAndTimestamps(show, forceLog = false) {
            show.lastActivityAt = new Date().toISOString();
            show.lastActivityAt = new Date().toISOString();

            const isCustomCategory = !DEFAULT_CATEGORIES.includes(show.category);
            if (isCustomCategory) return;

            const { watchedEpisodes, totalEpisodes } = calculateProgress(show);
            const oldCategory = show.category;

            if (watchedEpisodes === 0) show.category = "Da Vedere";
            else if (watchedEpisodes >= totalEpisodes && totalEpisodes > 0) {
                // Check if rewatching
                const hasRewatches = show.rewatches && Object.values(show.rewatches).some(c => c > 0);

                // If currently In Corso and has rewatches, don't move to Completate
                if (oldCategory === 'In Corso' && hasRewatches) {
                    // Keep in In Corso
                    show.category = "In Corso";
                } else {
                    show.category = "Completate";
                    if (oldCategory !== 'Completate' || forceLog) {
                        showNotification(`Hai completato ${show.title}!`, "success");
                        logActivity('complete_show', show.title, '');
                    }
                }
            }
            else show.category = "In Corso";
        }

        async function moveShowToCategory(showId, newCategory) {
            const show = mediaList.find(m => m.id === showId);
            if (show && show.category !== newCategory) {
                const oldCategory = show.category;
                show.category = newCategory;
                if (newCategory === 'Completate') {
                    Object.keys(show.seasons).forEach(seasonNum => {
                        (show.seasons[seasonNum].episodes || []).forEach(ep => {
                            show.progress[`${seasonNum}-${ep.episode_number}`] = true;
                        });
                    });
                }
                show.lastActivityAt = new Date().toISOString();
                await logActivity('move_show', show.title, `da '${oldCategory}' a '${newCategory}'`);
                await saveData();
                renderFullUI();
                showNotification(`"${show.title}" spostato in ${newCategory}.`, "success");
            }
        }

        async function markAsCompleted(showId) {
            const show = mediaList.find(m => m.id === showId);
            if (show && show.category !== 'Completate') {
                const oldCategory = show.category;
                show.category = 'Completate';
                show.lastActivityAt = new Date().toISOString();
                await logActivity('mark_completed', show.title, `dalla categoria '${oldCategory}'`);
                await saveData();
                renderFullUI();
                showNotification(`"${show.title}" segnato come completato.`, "success");
            }
        }

        function showContextMenu(show, pos) {
            if (isViewMode) return;

            // Chiude menu aperti in precedenza
            document.querySelectorAll(".context-menu, .context-menu-backdrop").forEach(m => m.remove());

            // 1. Crea il fondale scuro (Backdrop)
            const backdrop = document.createElement("div");
            backdrop.className = "context-menu-backdrop";
            document.body.appendChild(backdrop);

            // 2. Crea il Menu
            const menu = document.createElement("div");
            menu.className = "context-menu";

            // Funzione di chiusura universale
            const hide = () => {
                menu.classList.remove("visible");
                backdrop.style.opacity = "0";
                setTimeout(() => { menu.remove(); backdrop.remove(); }, 200);
            };

            backdrop.addEventListener("click", hide);

            // 3. Intestazione Menu
            const header = document.createElement("div");
            header.className = "context-menu-header";
            header.innerHTML = `
                <div class="context-menu-eyebrow">Serie TV</div>
                <div class="context-menu-title"></div>
                <div class="context-menu-meta">Categoria attuale: ${show.category}</div>
            `;
            header.querySelector('.context-menu-title').textContent = show.title;
            menu.appendChild(header);

            const moveHeader = document.createElement("div");
            moveHeader.className = "context-menu-section-label";
            moveHeader.textContent = "Sposta in";
            menu.appendChild(moveHeader);

            categories.map(c => c.name).filter(cat => cat !== show.category).forEach(cat => {
                const item = document.createElement("div");
                item.className = "context-menu-item";
                const catIndex = categories.findIndex(c => c.name === cat);
                const dotClass = `category-dot-${catIndex % 6}`;
                item.innerHTML = `<span class="category-dot ${dotClass}"></span> ${cat}`;
                item.addEventListener("click", () => { moveShowToCategory(show.id, cat); hide(); });
                menu.appendChild(item);
            });
            menu.appendChild(document.createElement("div")).className = "context-menu-divider";

            const statusLabel = document.createElement("div");
            statusLabel.className = "context-menu-section-label";
            statusLabel.textContent = "Stato";
            menu.appendChild(statusLabel);

            if (show.category !== 'Completate') {
                const markCompletedItem = document.createElement("div");
                markCompletedItem.className = "context-menu-item";
                markCompletedItem.innerHTML = '<i class="fas fa-check-double fa-fw"></i> Segna come completata';
                markCompletedItem.addEventListener("click", () => { markAsCompleted(show.id); hide(); });
                menu.appendChild(markCompletedItem);
            }

            // Dropped Toggle Button (Moved below Completed)
            const droppedItem = document.createElement('div');
            droppedItem.className = "context-menu-item";
            droppedItem.innerHTML = show.isDropped ? '<i class="fas fa-play fa-fw"></i> Riprendi Serie' : '<i class="fas fa-ban fa-fw"></i> Segna come Droppata';
            droppedItem.addEventListener("click", () => { toggleDroppedStatus(show); hide(); });
            menu.appendChild(droppedItem);
            menu.appendChild(document.createElement("div")).className = "context-menu-divider";

            const manageLabel = document.createElement("div");
            manageLabel.className = "context-menu-section-label";
            manageLabel.textContent = "Gestione";
            menu.appendChild(manageLabel);

            const changePosterItem = document.createElement("div");
            changePosterItem.className = "context-menu-item";
            changePosterItem.innerHTML = '<i class="fas fa-image fa-fw"></i> Cambia Copertina';
            changePosterItem.addEventListener("click", () => { showPosterModal(show.id); hide(); });
            menu.appendChild(changePosterItem);

            const toggleSpecialsItem = document.createElement("div");
            toggleSpecialsItem.className = "context-menu-item";
            if (show.seasons && show.seasons[0]) {
                toggleSpecialsItem.innerHTML = '<i class="fas fa-trash-alt fa-fw"></i> Rimuovi Speciali';
                toggleSpecialsItem.addEventListener("click", () => { removeSpecials(show.id); hide(); });
            } else {
                toggleSpecialsItem.innerHTML = '<i class="fas fa-plus-circle fa-fw"></i> Aggiungi Speciali';
                toggleSpecialsItem.addEventListener("click", () => { addSpecials(show.id); hide(); });
            }
            menu.appendChild(toggleSpecialsItem);

            const deleteItem = document.createElement("div");
            deleteItem.className = "context-menu-item danger";
            deleteItem.innerHTML = '<i class="fas fa-trash fa-fw"></i> Elimina';
            deleteItem.addEventListener("click", () => { deleteShow(show.id); hide(); });
            menu.appendChild(deleteItem);

            document.body.appendChild(menu);

            // 5. Posizionamento Intelligente
            if (window.innerWidth > 768) {
                // Su Desktop si posiziona vicino al mouse
                const rect = menu.getBoundingClientRect();
                let x = pos.x, y = pos.y;
                if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 10;
                if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10;
                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
            }
            // Su Mobile il CSS si occupa di fissarlo in basso

            // Mostriamo con animazione
            requestAnimationFrame(() => {
                backdrop.style.opacity = "1";
                menu.classList.add('visible');
            });
        }

        async function addSpecials(showId) {
            const show = mediaList.find(m => m.id === showId);
            if (!show || !show.tmdbID) return;

            showNotification("Recupero episodi speciali...", "warning");
            const specialsData = await fetchTMDbSeasonDetailsWithFallback(show.tmdbID, 0);
            if (specialsData && specialsData.episodes && specialsData.episodes.length > 0) {
                show.seasons[0] = {
                    name: specialsData.name || "Speciali",
                    episodes: specialsData.episodes.map(ep => ({
                        name: ep.name,
                        overview: ep.overview,
                        episode_number: ep.episode_number,
                        runtime: ep.runtime || 0,
                        still_path: ep.still_path,
                        air_date: ep.air_date
                    }))
                };
                await saveData();
                refreshSingleMedia(showId);
                showNotification("Episodi speciali aggiunti!", "success");
            } else {
                showNotification("Nessun episodio speciale trovato per questa serie.", "error");
            }
        }

        async function removeSpecials(showId) {
            const show = mediaList.find(m => m.id === showId);
            if (!show || !show.seasons || !show.seasons[0]) return;

            // Rimuovi i progressi legati agli speciali
            Object.keys(show.progress).forEach(key => {
                if (key.startsWith('0-')) {
                    delete show.progress[key];
                }
            });

            delete show.seasons[0];
            await saveData();
            refreshSingleMedia(showId);
            showNotification("Episodi speciali rimossi.", "success");
        }

        function toggleDroppedStatus(show) {
            if (isViewMode) return;
            if (!show.isDropped) {
                // Show Drop Modal to select category
                elements.dropCategorySelect.innerHTML = categories.map(c => {
                    const name = typeof c === 'string' ? c : c.name;
                    return `<option value="${name}" ${name === show.category ? 'selected' : ''}>${name}</option>`;
                }).join('');

                openModal(elements.dropModal);

                // Handle Confirm
                const confirmHandler = async () => {
                    closeModal(elements.dropModal); // Close immediately
                    closeModal(elements.detailsModal); // Close details if open

                    const selectedCategory = elements.dropCategorySelect.value;
                    show.isDropped = true;
                    show.category = selectedCategory;

                    await saveData();
                    renderFullUI();

                    await logActivity('mark_dropped', show.title, `spostata in '${selectedCategory}'`);
                    showNotification(`"${show.title}" segnata come droppata in ${selectedCategory}.`, "success");

                    cleanup();
                };

                // Handle Cancel
                const cancelHandler = () => {
                    closeModal(elements.dropModal);
                    cleanup();
                };

                const cleanup = () => {
                    elements.confirmDropBtn.removeEventListener('click', confirmHandler);
                    elements.cancelDropBtn.removeEventListener('click', cancelHandler);
                };

                elements.confirmDropBtn.addEventListener('click', confirmHandler);
                elements.cancelDropBtn.addEventListener('click', cancelHandler);

            } else {
                // Resume Show
                show.isDropped = false;
                saveData();
                renderFullUI();
                closeModal(elements.detailsModal);

                logActivity('resume_show', show.title, 'ripresa');
                showNotification(`"${show.title}" ripresa!`, "success");
            }
        }

        function deleteShow(showId) {
            if (isViewMode) return;
            const show = mediaList.find(m => m.id === showId);
            if (!show) return;
            showConfirmModal("Elimina Serie TV", `Sei sicuro di voler eliminare "${show.title}"?`, async () => {
                await logActivity('delete_show', show.title, `dalla categoria '${show.category}'`);
                mediaList = mediaList.filter(m => m.id !== showId);
                await saveData();
                renderFullUI();
            });
        }

        async function showPosterModal(id) {
            const show = mediaList.find(m => m.id === id);
            if (!show || (!show.imdbID && !show.tmdbID)) return showNotification("Nessun ID valido (TMDb/IMDb) trovato per questa serie.", "warning");
            elements.posterModal.dataset.mediaId = id;
            elements.posterGrid.innerHTML = `<div style="text-align:center;"><i class="fas fa-spinner loading-spinner"></i></div>`;
            openModal(elements.posterModal);

            const posters = await fetchPosters(show);
            if (posters.length === 0) {
                elements.posterGrid.innerHTML = "<p>Nessuna copertina alternativa trovata.</p>";
                return;
            }
            elements.posterGrid.innerHTML = posters.map(p => `
            <div class="poster-option" data-url="${p.url}">
                <img src="${p.url}" onerror="this.src='${DEFAULT_POSTER}'">
                <div class="poster-language-badge">${p.iso_639_1 || 'N/A'}</div>
            </div>`).join('');
            elements.posterGrid.querySelectorAll('.poster-option').forEach(el =>
                el.addEventListener('click', () => {
                    document.querySelectorAll(".poster-option.selected").forEach(s => s.classList.remove('selected'));
                    el.classList.add('selected');
                })
            );
        }

        async function fetchPosters(show) {
            try {
                const tmdbId = show.tmdbID || (await fetchTMDbShowDetailsByIMDb(show.imdbID))?.id;
                if (!tmdbId) return [];

                const imagesRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/images?api_key=${TMDB_KEY}`);
                const imagesData = await imagesRes.json();
                const langScore = (lang) => (lang === 'it') ? 3 : (lang === 'en') ? 2 : (lang === null) ? 1 : 0;
                return imagesData.posters
                    .filter(p => ['it', 'en', null].includes(p.iso_639_1))
                    .sort((a, b) => langScore(b.iso_639_1) - langScore(a.iso_639_1))
                    .slice(0, 30)
                    .map(p => ({ url: `https://image.tmdb.org/t/p/w500${p.file_path}`, iso_639_1: p.iso_639_1 ? p.iso_639_1.toUpperCase() : null }));
            } catch (err) {
                console.error("Error fetching posters:", err);
                return [];
            }
        }

        function changePoster(id, url) {
            const show = mediaList.find(m => m.id === id);
            if (show) {
                const duplicates = getLinkedShowInstances(show);
                duplicates.forEach(dup => {
                    dup.poster = url;
                });
                saveData();
                renderMedia();
                closeModal(elements.posterModal);
                showNotification("Copertina aggiornata per tutte le copie!", "success");
            }
        }

        function renderCategoriesList() {
            const list = elements.categoriesList;
            list.innerHTML = "";
            categories.forEach((catObj, index) => {
                const card = document.createElement("div");
                card.className = "management-card";
                const isDefault = DEFAULT_CATEGORIES.includes(catObj.name);
                const dotClass = `category-dot-${index % 6}`;
                const count = mediaList.filter(m => m.category === catObj.name).length;
                card.innerHTML = `
                <div>
                    <span class="category-dot ${dotClass}"></span>
                    <div>
                        <div class="category-name">${catObj.name}</div>
                    </div>
                </div>
                <div class="management-card-actions">
                    <button class="btn move-up-btn" ${index === 0 ? "disabled" : ""} title="Sposta su"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn move-down-btn" ${index === categories.length - 1 ? "disabled" : ""} title="Sposta giù"><i class="fas fa-arrow-down"></i></button>
                    ${!isDefault ? `
                        <button class="btn toggle-progress-btn" title="Mostra/Nascondi progresso"><i class="fas ${catObj.hideProgress ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                        <button class="btn rename-category-btn" title="Rinomina"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-danger delete-category-btn" title="Elimina"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>`;
                card.querySelector('.move-up-btn').addEventListener('click', () => moveCategory(catObj.name, -1));
                card.querySelector('.move-down-btn').addEventListener('click', () => moveCategory(catObj.name, 1));
                if (!isDefault) {
                    card.querySelector('.delete-category-btn').addEventListener('click', () => deleteCategory(catObj.name));
                    card.querySelector('.rename-category-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const nameEl = e.currentTarget.closest(".management-card").querySelector(".category-name");
                        renameCategory(catObj.name, nameEl);
                    });
                    card.querySelector('.toggle-progress-btn').addEventListener('click', () => toggleCategoryProgress(catObj.name));
                }
                list.appendChild(card);
            });
        }

        function toggleCategoryProgress(catName) {
            const category = categories.find(c => c.name === catName);
            if (category) {
                category.hideProgress = !category.hideProgress;
                saveData();
                renderCategoriesList();
                renderMedia();
            }
        }

        function renameCategory(oldName, nameEl) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = oldName;
            input.className = "category-name-input";
            nameEl.parentElement.replaceChild(input, nameEl);
            input.focus();
            const save = () => {
                const newName = input.value.trim();
                const catIndex = categories.findIndex(c => c.name === oldName);
                if (newName && newName !== oldName && !categories.some(c => c.name === newName)) {
                    mediaList.forEach(m => { if (m.category === oldName) m.category = newName; });
                    categories[catIndex].name = newName;
                    saveData();
                    renderFullUI();
                    renderCategoriesList();
                    showNotification(`Categoria rinominata in "${newName}"`, "success");
                } else {
                    renderCategoriesList(); // Revert if invalid
                }
            };
            input.addEventListener("blur", save);
            input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
        }

        function addCategory() {
            const name = elements.newCategoryName.value.trim();
            if (!name) return showNotification("Inserisci un nome per la categoria", "warning");
            if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                return showNotification("Questa categoria esiste già.", "warning");
            }
            categories.push({ name: name, hideProgress: false });
            saveData();
            renderFullUI();
            renderCategoriesList();
            elements.newCategoryName.value = "";
            showNotification(`Categoria "${name}" aggiunta!`, "success");
        }

        function deleteCategory(catName) {
            if (DEFAULT_CATEGORIES.includes(catName)) return;
            showConfirmModal("Elimina Categoria", `Sei sicuro di voler eliminare la categoria "${catName}"? Le serie in questa categoria verranno spostate in "Da Vedere".`, () => {
                mediaList.forEach(m => { if (m.category === catName) m.category = "Da Vedere"; });
                categories = categories.filter(c => c.name !== catName);
                saveData();
                renderFullUI();
                renderCategoriesList();
                closeModal(elements.mediaManagementModal);
                showNotification(`Categoria "${catName}" eliminata.`, "success");
            });
        }

        function moveCategory(catName, direction) {
            const index = categories.findIndex(c => c.name === catName);
            const newIndex = index + direction;
            if (newIndex >= 0 && newIndex < categories.length) {
                [categories[index], categories[newIndex]] = [categories[newIndex], categories[index]];
                saveData();
                renderFullUI();
                renderCategoriesList();
            }
        }

        function resetApp() { if (isViewMode) return; showConfirmModal("Resetta Tracker", "Sei sicuro di voler resettare l'applicazione? Tutti i dati andranno persi.", () => { mediaList = []; categories = DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false })); saveData(); renderFullUI(); showNotification("Tracker resettato con successo.", "success"); }); }
        function fixPosterUrl(url) { return (url && url.startsWith("https://")) ? url : DEFAULT_POSTER; }

        function updateCategoryFilter() {
            const optionsContainer = document.getElementById('categoryOptions');
            const select = document.getElementById('categoryFilter');

            // Voci fisse
            let html = `
        <div class="option" data-value="all"><i class="fas fa-folder"></i> Tutte le categorie</div>
        <div class="option" data-value="favorites"><i class="fas fa-heart"></i> Solo Preferiti</div>
    `;

            // Generazione dinamica con icone intelligenti
            categories.forEach(cat => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const display = (typeof getCategoryName === 'function') ? getCategoryName(catName) : catName;

                let icon = "fa-tag";
                if (display === "Da Vedere" || catName === "watchlist") icon = "fa-bookmark";
                if (display === "Visti" || catName === "watched" || display === "Completate") icon = "fa-check-circle";
                if (display === "In Corso") icon = "fa-play-circle";
                if (display.includes("Pausa") || display.includes("Droppata")) icon = "fa-pause-circle"; // Added icon for Pausa/Droppata

                html += `<div class="option" data-value="${catName}"><i class="fas ${icon}"></i> ${display}</div>`;
            });

            if (optionsContainer) optionsContainer.innerHTML = html;

            // Seleziona "Tutte" di default solo se non c'è già un valore
            if (!select.dataset.value) select.dataset.value = "all";

            // Aggiorna il testo visualizzato per i custom select
            const updateSelectedText = (targetSelect, targetOptionsContainer) => {
                const selectedValue = targetSelect.dataset.value;
                const selectedOptionElement = targetOptionsContainer.querySelector(`.option[data-value="${selectedValue}"]`);
                if (selectedOptionElement) {
                    targetSelect.querySelector('.selected-option').innerHTML = selectedOptionElement.innerHTML;
                } else {
                    targetSelect.dataset.value = 'all';
                    targetSelect.querySelector('.selected-option').innerHTML = `<i class="fas fa-folder"></i> Tutte le categorie`;
                }
            };

            if (select && optionsContainer) updateSelectedText(select, optionsContainer);
        }





        function populateAddMediaCategorySelect() {
            const nativeSelect = document.getElementById('addMediaCategorySelect');
            const optionsContainer = document.getElementById('addMediaCategoryOptions');
            const customSelect = document.getElementById('addMediaCategoryCustom');
            if (!nativeSelect && !customSelect) return;

            const optionMarkup = categories.map(cat => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                return {
                    value: catName,
                    option: `<option value="${catName}">${catName}</option>`,
                    html: `<div class="option" data-value="${catName}"><i class="fas fa-folder"></i> ${catName}</div>`
                };
            });

            if (nativeSelect) nativeSelect.innerHTML = optionMarkup.map(item => item.option).join("");
            if (optionsContainer) optionsContainer.innerHTML = optionMarkup.map(item => item.html).join("");

            // Imposta valore iniziale
            const lastUsed = localStorage.getItem("lastUsedTvShowCategory");
            let defaultCatName = categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0].name) : "Da Vedere";

            if (lastUsed && categories.some(c => (typeof c === 'string' ? c : c.name) === lastUsed)) {
                defaultCatName = lastUsed;
            } else if (categories.some(c => (typeof c === 'string' ? c : c.name) === "Da Vedere")) {
                defaultCatName = "Da Vedere";
            }

            if (nativeSelect) nativeSelect.value = defaultCatName;
            if (customSelect) {
                customSelect.dataset.value = defaultCatName;
                customSelect.querySelector('.selected-option').innerHTML = `<i class="fas fa-folder"></i> ${defaultCatName}`;
            }
        }

        function renderCategorySections() {
            elements.mediaSectionsContainer.innerHTML = categories.map(cat => `
            <div class="media-section" id="${sanitizeForId(cat.name)}Section" data-category="${cat.name}">
                <div class="section-header">
                    <h2 class="section-title user-select-none">${cat.name}</h2>
                    <span id="${sanitizeForId(cat.name)}Count" class="category-count"></span>
                </div>
                <div class="media-grid" id="${sanitizeForId(cat.name)}Grid"></div>
            </div>`).join("");
        }

        function populateCategoryNavModal() {
            const container = elements.categoryNavList;
            container.innerHTML = '';

            // Add all categories (including default ones like watchlist and watched)
            categories.forEach((cat) => {
                const btn = document.createElement('button');
                btn.className = 'btn';

                // Determine icon and display name based on category
                let icon = 'fa-folder';
                let displayName = cat.name;

                if (cat.name === 'Da Vedere') {
                    icon = 'fa-bookmark';
                } else if (cat.name === 'In Corso') {
                    icon = 'fa-play-circle';
                } else if (cat.name === 'Completate') {
                    icon = 'fa-check-circle';
                }

                btn.innerHTML = `<i class="fas ${icon}"></i> ${displayName}`;
                btn.addEventListener('click', () => {
                    closeModal(elements.categoryNavModal);
                    setTimeout(() => {
                        const section = document.getElementById(`${sanitizeForId(cat.name)}Section`);
                        if (section) {
                            const headerOffset = 80; // Adjust for sticky header or top bar if needed
                            const elementPosition = section.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth"
                            });
                        }
                    }, 300);
                });
                container.appendChild(btn);
            });
        }

        function closeModal(modal) {
            if (modal && (modal.classList.contains('visible') || modal.style.display === 'flex')) {
                // Se il modale è attivo, torniamo indietro nella cronologia.
                // Questo attiverà il popstate che gestisce la chiusura pulita.
                history.back();
            }
        }
        function showNotification(text, type = "success") { elements.notificationText.textContent = text; elements.notification.className = `notification ${type}`; elements.notification.style.display = "block"; setTimeout(() => elements.notification.style.display = "none", 3000); }
        function showConfirmModal(title, body, onConfirm) { elements.confirmModalTitle.textContent = title; elements.confirmModalBody.textContent = body; openModal(elements.confirmModal); const confirmHandler = () => { closeModal(elements.confirmModal); onConfirm(); cleanup(); }; const cancelHandler = () => { closeModal(elements.confirmModal); cleanup(); }; const cleanup = () => { elements.confirmModalConfirm.removeEventListener("click", confirmHandler); elements.confirmModalCancel.removeEventListener("click", cancelHandler); }; elements.confirmModalConfirm.addEventListener("click", confirmHandler); elements.confirmModalCancel.addEventListener("click", cancelHandler); }
        function setupLazyLoading() {
            if (lazyLoadObserver) lazyLoadObserver.disconnect();
            const isMobile = window.innerWidth <= 768;
            lazyLoadObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove("lazy");
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: isMobile ? "100px" : "200px",
                threshold: 0
            });
            document.querySelectorAll(".lazy").forEach(img => lazyLoadObserver.observe(img));
        }
        function loadSortOrder() {
            // 1. Legge la memoria. Se è vuota, imposta 'alpha' (Alfabetico) come default iniziale.
            let savedSort = localStorage.getItem("tvShowSortOrder");
            if (!savedSort) {
                savedSort = "alpha";
                localStorage.setItem("tvShowSortOrder", savedSort);
            }

            // 2. Aggiorna il menu Desktop (Custom Select)
            const sortSelectDesktop = document.getElementById('sortFilter');
            if (sortSelectDesktop) {
                sortSelectDesktop.dataset.value = savedSort;
                const optionEl = document.querySelector(`#sortOptions .option[data-value="${savedSort}"]`);
                if (optionEl) {
                    sortSelectDesktop.querySelector('.selected-option').innerHTML = optionEl.innerHTML;
                }
            }

            // 3. Aggiorna il menu Mobile
            const mobileSort = document.getElementById('mobileSortFilter');
            if (mobileSort) {
                mobileSort.value = savedSort;
            }
        }


        async function searchTMDb() {
            const title = elements.mediaTitle.value.trim();
            if (!title) return;
            elements.tmdbResults.innerHTML = `<div class="tmdb-empty-state"><i class="fas fa-spinner loading-spinner"></i></div>`;
            try {
                const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=it-IT&include_adult=false`);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    elements.tmdbResults.innerHTML = data.results.map(r => `
                    <div class="tmdb-result-card tmdb-result-item" data-tmdb-id="${r.id}" data-title="${r.name}">
                        <div class="tmdb-result-poster">
                            <img src="${r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : DEFAULT_POSTER}" onerror="this.src='${DEFAULT_POSTER}'">
                            <button class="tmdb-result-add-btn" type="button" title="Aggiungi ${r.name}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="tmdb-result-meta">
                            <div class="tmdb-result-title" title="${r.name}">${r.name}</div>
                            <div class="tmdb-result-year">${r.first_air_date ? r.first_air_date.split('-')[0] : 'N/D'}</div>
                            <div class="tmdb-result-original">${r.original_name || ''}</div>
                        </div>
                    </div>`).join('');
                    document.querySelectorAll(".tmdb-result-card").forEach(item => {
                        item.querySelector(".tmdb-result-add-btn")?.addEventListener("click", async (e) => {
                            e.stopPropagation();
                            currentTMDbSelection = { tmdbId: item.dataset.tmdbId };
                            await addNewMedia(item.dataset.tmdbId);
                        });
                    });
                } else {
                    elements.tmdbResults.innerHTML = `<div class="tmdb-empty-state">Nessun risultato</div>`;
                }
            } catch (err) {
                elements.tmdbResults.innerHTML = '<div class="tmdb-empty-state">Errore di rete</div>';
            }
        }

        function renderSearchDashboardEmptyState(message = 'Scrivi il titolo di un film per iniziare...') {
            elements.tmdbResults.innerHTML = `<div class="tmdb-empty-state"><i class="fas fa-film"></i><span>${message}</span></div>`;
        }

        function triggerNewEpisodeCheck() {
            const now = new Date().getTime();
            const lastCheck = localStorage.getItem('lastNewEpisodeCheck');
            const SIX_HOURS = 6 * 60 * 60 * 1000;

            if (!lastCheck || (now - lastCheck) > SIX_HOURS) {
                console.log("Esecuzione del controllo per nuovi episodi...");
                checkForNewEpisodes();
                localStorage.setItem('lastNewEpisodeCheck', now);
            }
        }

        function checkForNewEpisodes() {
            const lastCheckString = localStorage.getItem('lastNewEpisodeCheck');
            const lastCheckDate = lastCheckString ? new Date(parseInt(lastCheckString)) : new Date(Date.now() - 24 * 60 * 60 * 1000);
            const currentDate = new Date();

            const showsToCheck = mediaList.filter(s => s.category === 'In Corso');

            showsToCheck.forEach(show => {
                Object.values(show.seasons).forEach(season => {
                    (season.episodes || []).forEach(ep => {
                        if (ep.air_date) {
                            const airDate = new Date(ep.air_date);
                            if (airDate >= lastCheckDate && airDate <= currentDate) {
                                if (!show.progress[`${season.season_number}-${ep.episode_number}`]) {
                                    setTimeout(() => showNotification(`È uscito un nuovo episodio di ${show.title}!`, 'success'), 500);
                                }
                            }
                        }
                    });
                });
            });
        }

        function getTimestamp(value) {
            const time = new Date(value || 0).getTime();
            return Number.isNaN(time) ? 0 : time;
        }

        function hasEpisodesNearDate(show, startDate, endDate) {
            return Object.values(show.seasons || {}).some(season =>
                (season.episodes || []).some(ep => {
                    if (!ep.air_date) return false;
                    const airDate = new Date(ep.air_date + 'T00:00:00Z');
                    return airDate >= startDate && airDate <= endDate;
                })
            );
        }

        function isOngoingTmdbStatus(status) {
            return ['Returning Series', 'In Production', 'Planned'].includes(status);
        }

        function shouldUpdateShowInBackground(show, now, sevenDaysAgo, sevenDaysFromNow) {
            if (!show.tmdbID) return false;

            const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
            const lastTmdbCheck = getTimestamp(show.lastTmdbCheckAt);

            const hasNearbyEpisodes = hasEpisodesNearDate(show, sevenDaysAgo, sevenDaysFromNow);
            const needsSafetyCheck = isOngoingTmdbStatus(show.status) && (now - lastTmdbCheck > FIFTEEN_DAYS);

            return hasNearbyEpisodes || needsSafetyCheck;
        }

        function shouldUpdateShowManually(show) {
            return !!show.tmdbID;
        }

        // Aggiunto secondo parametro cloudTimestamp per sincronizzazione PWA/APK
        async function updateAllShowsInBackground(force = false, cloudTimestamp = null, options = {}) {
            if (isUpdateInProgress) {
                if (force || options.manual) {
                    showNotification("Aggiornamento già in corso.", "warning");
                }
                console.log("Tentativo di avvio aggiornamento bloccato: un altro è già in corso.");
                return;
            }

            isUpdateInProgress = true;

            try {
                const now = new Date().getTime();

                // LOGICA DI CONTROLLO COORDINATA
                // Usa il timestamp più recente tra Firebase e storage locale.
                const cloudLastUpdate = cloudTimestamp ? parseInt(cloudTimestamp) : 0;
                const localLastUpdate = parseInt(localStorage.getItem('lastBackgroundUpdate') || '0');
                const lastUpdate = Math.max(cloudLastUpdate || 0, localLastUpdate || 0);

                const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
                const skipRecentUpdateCheck = force || options.skipRecentUpdateCheck;
                const isManualRun = force || options.manual;

                if (!skipRecentUpdateCheck && lastUpdate && (now - lastUpdate) < TWENTY_FOUR_HOURS) {
                    console.log("Aggiornamento saltato: dati già recenti (Cloud/Locale sync).");
                    displayLastUpdateTime();
                    isUpdateInProgress = false;
                    return;
                }

                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

                const showsToUpdate = mediaList.filter(show =>
                    force
                        ? shouldUpdateShowManually(show)
                        : shouldUpdateShowInBackground(show, now, sevenDaysAgo, sevenDaysFromNow)
                );

                if (showsToUpdate.length === 0) {
                    if (isManualRun) {
                        showNotification(force ? "Nessuna serie attiva da aggiornare." : "Nessuna serie selezionata dall'aggiornamento giornaliero.", "warning");
                    }
                    localStorage.setItem('lastBackgroundUpdate', now);
                    if (currentUser) {
                        db.ref(`users/${currentUser.uid}/tvShowTracker/lastBackgroundUpdate`).set(now);
                    }
                    displayLastUpdateTime();
                    isUpdateInProgress = false;
                    return;
                }

                console.log(`Avvio aggiornamento per ${showsToUpdate.length} serie...`);
                openModal(elements.updateProgressModal);
                elements.updateProgressTitle.textContent = force ? "Aggiornamento Completo" : "Aggiornamento Giornaliero";
                let allChanges = [];

                for (let i = 0; i < showsToUpdate.length; i++) {
                    const show = showsToUpdate[i];
                    const progress = ((i + 1) / showsToUpdate.length) * 100;
                    elements.updateProgressBarFill.style.width = `${progress}%`;
                    elements.updateProgressText.textContent = `Controllo ${i + 1} di ${showsToUpdate.length}: ${show.title}...`;

                    try {
                        const showChanges = await showDetailsModal(show.id, true, true);
                        show.lastTmdbCheckAt = new Date().toISOString();
                        if (showChanges.length > 0) {
                            allChanges = allChanges.concat(showChanges);
                        }
                        await new Promise(resolve => setTimeout(resolve, 400));
                    } catch (error) {
                        console.error(`Errore aggiornando ${show.title} in background:`, error);
                    }
                }

                closeModal(elements.updateProgressModal);

                if (allChanges.length > 0) {
                    // SALVA NELLO STORICO
                    addToUpdateHistory(allChanges);
                    elements.updateSummaryList.innerHTML = allChanges.map(change => `<li>${change}</li>`).join('');
                    openModal(elements.updateSummaryModal);
                } else if (force) {
                    showNotification("Nessun aggiornamento trovato.", "success");
                }

                await saveData();
                renderFullUI();

                localStorage.setItem('lastBackgroundUpdate', now);
                if (currentUser) {
                    db.ref(`users/${currentUser.uid}/tvShowTracker/lastBackgroundUpdate`).set(now);
                }
                displayLastUpdateTime();
            } finally {
                isUpdateInProgress = false;
            }
        }

        async function updateAllRatings() {
            if (isUpdateInProgress) {
                showNotification("Un aggiornamento è già in corso.", "warning");
                return;
            }
            isUpdateInProgress = true;

            const now = Date.now();
            const SETTE_GIORNI = 7 * 24 * 60 * 60 * 1000;

            // 1. Filtro
            let itemsToUpdate = [];
            let skippedCount = 0;

            mediaList.forEach(m => {
                if (!m.imdbID) return;
                const lastRatingUpdate = m.lastRatingUpdate ? new Date(m.lastRatingUpdate).getTime() : 0;
                if (now - lastRatingUpdate > SETTE_GIORNI) {
                    itemsToUpdate.push(m);
                } else {
                    skippedCount++;
                }
            });

            if (itemsToUpdate.length === 0) {
                isUpdateInProgress = false;
                return showNotification(`Tutti i voti sono aggiornati. (Risparmiate ${skippedCount} API)`, "success");
            }

            // 2. Setup UI
            const progressModal = document.getElementById('updateProgressModal');
            const progressText = document.getElementById('updateProgressText');
            const progressFill = document.getElementById('updateProgressBarFill');
            document.getElementById('updateProgressTitle').textContent = "Sincronizzazione Voti...";

            closeModal(document.getElementById('settingsModal'));
            setTimeout(() => { openModal(progressModal); }, 350);

            let allChangesHTML = [];
            let apiCallsMDBList = 0;

            // --- NUOVO: CONTATORE DI ERRORI CONSECUTIVI ---
            let consecutiveErrors = 0;
            const MAX_ERRORS = 3;

            // Helper icone
            const getIconHtml = (src) => `<img src="${src}" style="width:14px; height:14px; object-fit:contain; vertical-align:middle; margin-right:4px;">`;

            // 3. Ciclo
            for (let i = 0; i < itemsToUpdate.length; i++) {
                // --- FRENO DI EMERGENZA ---
                if (consecutiveErrors >= MAX_ERRORS) {
                    console.warn("Troppi errori consecutivi. Interruzione aggiornamento per salvare le API.");
                    showNotification("Aggiornamento interrotto: probabile limite API raggiunto.", "error");
                    break; // ESCE DAL CICLO
                }

                const media = itemsToUpdate[i];

                progressText.textContent = `(${i + 1}/${itemsToUpdate.length}) Controllo: ${media.title}...`;
                progressFill.style.width = `${((i + 1) / itemsToUpdate.length) * 100}%`;

                try {
                    const ratings = await fetchMDBListRatings(media.imdbID);
                    apiCallsMDBList++;

                    if (!ratings) {
                        // Se ratings è null, qualcosa non va
                        consecutiveErrors++;
                    } else {
                        // Se ha successo, resettiamo il contatore errori
                        consecutiveErrors = 0;
                        media.lastRatingUpdate = new Date().toISOString();

                        let changes = [];

                        const rtRating = ratings.find(r => r.source === 'tomatoes');
                        const popcornRating = ratings.find(r => r.source === 'tomatoesaudience');
                        const letterboxdRating = ratings.find(r => r.source === 'letterboxd');
                        const metacriticRating = ratings.find(r => r.source === 'metacritic');
                        const imdbRating = ratings.find(r => r.source === 'imdb');

                        // FUNZIONE INTELLIGENTE (con fix N/A e numeri)
                        const checkAndUpdate = (newObj, oldVal, iconSrc) => {
                            let oldString = String(oldVal).trim();
                            if (["undefined", "null", "N/A", "N/D", ""].includes(oldString)) oldString = "N/A";

                            if (!newObj || newObj.value == null) return oldVal;

                            let newString = String(newObj.value).trim();
                            if (["undefined", "null", "N/A", "N/D", ""].includes(newString)) newString = "N/A";

                            if (oldString === newString || (oldString === "N/A" && newString === "N/A")) return oldVal;

                            const oldNum = parseFloat(oldString);
                            const newNum = parseFloat(newString);
                            let isDifferent = oldString !== newString;
                            if (!isNaN(oldNum) && !isNaN(newNum)) isDifferent = oldNum !== newNum;

                            if (isDifferent) {
                                const iconHtml = getIconHtml(iconSrc);
                                changes.push(`<span style="display:inline-flex; align-items:center;">${iconHtml} ${oldString} <i class="fas fa-arrow-right" style="font-size:0.7em; color:var(--text-secondary); margin:0 6px;"></i> <span style="color:var(--primary); font-weight:bold;">${newString}</span></span>`);
                                return newString === "N/A" ? "N/A" : newString;
                            }
                            return oldVal;
                        };

                        media.imdbRating = checkAndUpdate(imdbRating, media.imdbRating, IMDB_STAR_ICON);
                        media.letterboxdRating = checkAndUpdate(letterboxdRating, media.letterboxdRating, LETTERBOXD_ICON);
                        media.metacriticRating = checkAndUpdate(metacriticRating, media.metacriticRating, METACRITIC_ICON);
                        media.rottenTomatoes = checkAndUpdate(rtRating, media.rottenTomatoes, ROTTEN_TOMATOES_ICONS.fresh);
                        media.popcornRating = checkAndUpdate(popcornRating, media.popcornRating, POPCORN_ICONS.positive);

                        if (changes.length > 0) {
                            const posterUrl = media.poster || DEFAULT_POSTER;
                            const itemHTML = `
                        <div style="display:flex; gap:12px; align-items:center; padding: 10px; background: var(--section-tint); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
                            <img src="${posterUrl}" style="width:45px; height:65px; border-radius:6px; object-fit:cover; flex-shrink:0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <div style="display:flex; flex-direction:column; justify-content:center; gap: 4px;">
                                <strong style="color:var(--text-color); font-size:0.95rem; line-height:1.2;">${media.title}</strong>
                                <div style="display:flex; flex-wrap:wrap; gap: 10px; font-size:0.85rem; color:var(--text-secondary);">
                                    ${changes.join('')}
                                </div>
                            </div>
                        </div>
                    `;
                            allChangesHTML.push(itemHTML);
                        }
                    }
                    await new Promise(r => setTimeout(r, 350));
                } catch (err) {
                    console.error(`Errore voti per ${media.title}`, err);
                    consecutiveErrors++; // Incrementa errore anche qui
                }
            }

            // 4. Fine aggiornamento
            closeModal(progressModal);

            setTimeout(() => {
                const apiReportHTML = `
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px dashed var(--border-color);">
                <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase;">
                    <i class="fas fa-server"></i> Report Consumo API
                </div>
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 1.5;">
                    <li><strong style="color: var(--primary);">${apiCallsMDBList}</strong> MDBList eseguite</li>
                    <li><strong style="color: var(--success);">${skippedCount}</strong> Risparmiate (Cache 7gg)</li>
                    ${consecutiveErrors >= MAX_ERRORS ? '<li><strong style="color: var(--danger);">⚠️ Interrotto per errori API</strong></li>' : ''}
                </ul>
            </div>
        `;

                let finalLogEntry = '';

                if (allChangesHTML.length > 0) {
                    const logHeader = `<div style="margin-bottom: 0.8rem; color: var(--warning); font-weight: bold; font-size: 1.1rem;"><i class="fas fa-star"></i> Voti Aggiornati (${allChangesHTML.length})</div>`;
                    finalLogEntry = logHeader + allChangesHTML.join('') + apiReportHTML;

                    document.getElementById('updateSummaryList').innerHTML = `<li style="padding:0; border:none;">${finalLogEntry}</li>`;
                    openModal(document.getElementById('updateSummaryModal'));
                    addToUpdateHistory([finalLogEntry]);
                } else {
                    // Se non ci sono cambiamenti ma abbiamo consumato API, mostriamo notifica
                    if (apiCallsMDBList > 0) {
                        finalLogEntry = `<div style="margin-bottom: 0.8rem; color: var(--primary); font-weight: bold; font-size: 1.1rem;"><i class="fas fa-check-circle"></i> Voti Controllati (Nessuna variazione)</div>` + apiReportHTML;
                        addToUpdateHistory([finalLogEntry]);
                    }
                    // Se abbiamo interrotto per errore, lo diciamo
                    if (consecutiveErrors >= MAX_ERRORS) {
                        showNotification("Aggiornamento interrotto. Verifica limiti API.", "error");
                    } else {
                        showNotification("Controllo completato.", "success");
                    }
                }

                saveData();
                renderFullUI(); // In serietv_tracker.html usiamo renderFullUI()
                isUpdateInProgress = false;

            }, 350);
        }

        function setupAuthListeners() {
            elements.authToggle.addEventListener("click", () => openModal(elements.authModal));

            document.querySelectorAll(".auth-tab").forEach(tab => tab.addEventListener("click", () => {
                document.querySelectorAll(".auth-tab, .auth-form-container").forEach(el => el.classList.remove("active"));
                tab.classList.add("active");
                document.getElementById(`${tab.dataset.tab}Form`).classList.add("active");
            }));
            elements.loginBtn.addEventListener('click', () => {
                if (isAuthActionInProgress) return;
                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPassword').value;
                if (!email || !password) {
                    showNotification("Inserisci email e password", "warning");
                    return;
                }
                setAuthActionPending(true, 'login');
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(cred => {
                        if (cred.user) {
                            const userEmailRef = db.ref(`users/${cred.user.uid}/email`);
                            userEmailRef.once('value', snapshot => {
                                if (!snapshot.exists()) userEmailRef.set(cred.user.email || email);
                            });
                        }
                        showNotification("Login effettuato", "success");
                        closeModal(elements.authModal);
                    })
                    .catch(err => showNotification(err.message, "error"))
                    .finally(() => setAuthActionPending(false, 'login'));
            });
            elements.registerBtn.addEventListener('click', () => {
                if (isAuthActionInProgress) return;
                const email = document.getElementById('registerEmail').value.trim();
                const pass = document.getElementById('registerPassword').value;
                if (!email || !pass || !document.getElementById('registerConfirmPassword').value) { showNotification("Compila tutti i campi", "warning"); return; }
                if (pass !== document.getElementById('registerConfirmPassword').value) { showNotification("Le password non corrispondono.", "warning"); return; }
                if (pass.length < 6) { showNotification("La password deve avere almeno 6 caratteri", "warning"); return; }
                setAuthActionPending(true, 'register');
                firebase.auth().createUserWithEmailAndPassword(email, pass)
                    .then(cred => {
                        db.ref(`users/${cred.user.uid}/email`).set(cred.user.email);
                        showNotification("Registrazione completata!", "success");
                        closeModal(elements.authModal);
                    })
                    .catch(err => showNotification(err.message, "error"))
                    .finally(() => setAuthActionPending(false, 'register'));
            });
            elements.logoutBtn.addEventListener("click", requestLogout);
            firebase.auth().onAuthStateChanged(user => {
                if (isViewMode) return;
                currentUser = user;
                updateAuthUI();
                if (user) {
                    loadData();
                } else {
                    loadLocalData();
                    // --- MIGRATION LOGIC FOR DROPPED SHOWS ---
                    let migrationNeeded = false;
                    mediaList.forEach(show => {
                        if (show.category === "In Pausa / Droppata") {
                            show.isDropped = true;
                            // Move to "In Corso" unless progress is 0, then "Da Vedere"
                            const totalEpisodes = show.totalEpisodes || 0;
                            const watchedEpisodes = show.progress ? Object.values(show.progress).reduce((a, b) => a + b, 0) : 0;
                            show.category = (watchedEpisodes === 0) ? "Da Vedere" : "In Corso";
                            migrationNeeded = true;
                        }
                    });

                    // Remove "In Pausa / Droppata" from categories list if present
                    const droppedCatIndex = categories.findIndex(c => (typeof c === 'string' ? c : c.name) === "In Pausa / Droppata");
                    if (droppedCatIndex !== -1) {
                        categories.splice(droppedCatIndex, 1);
                        migrationNeeded = true;
                    }

                    if (migrationNeeded && !isViewMode) {
                        saveData();
                        console.log("Migration for Dropped shows completed.");
                    }
                    // -----------------------------------------

                    renderFullUI();
                    hideLoader();
                }
            });
        }

        function setAuthActionPending(isPending, action = 'login') {
            isAuthActionInProgress = isPending;
            const targetBtn = action === 'register' ? elements.registerBtn : elements.loginBtn;
            [elements.loginBtn, elements.registerBtn].forEach(btn => {
                if (btn) btn.disabled = isPending;
            });
            if (!targetBtn) return;
            if (!targetBtn.dataset.defaultHtml) targetBtn.dataset.defaultHtml = targetBtn.innerHTML;
            targetBtn.innerHTML = isPending ? '<i class="fas fa-spinner fa-spin"></i> Attendi...' : targetBtn.dataset.defaultHtml;
        }

        function requestLogout() {
            if (!currentUser || elements.confirmModal.classList.contains('visible')) return;
            showConfirmModal("Conferma logout", "Vuoi uscire dal tuo account?", () => {
                detachAllFriendListeners();
                firebase.auth().signOut()
                    .then(() => showNotification("Logout effettuato", "success"))
                    .catch(err => showNotification(err.message, "error"));
            });
        }

        function updateAuthUI() {
            const userActionBtn = elements.mobileMenuUserActionBtn.querySelector('span');
            if (currentUser) {
                elements.userInfo.style.display = "flex";
                elements.authToggle.style.display = "none";
                elements.notificationBellContainer.style.display = 'block';
                if (elements.updateSectionDesktop) elements.updateSectionDesktop.style.display = 'block';
                if (userActionBtn) {
                    userActionBtn.textContent = 'Logout';
                    elements.mobileMenuUserActionBtn.style.color = 'var(--danger)';
                    elements.mobileMenuUserActionBtn.querySelector('i').style.color = 'var(--danger)';
                }
            } else {
                currentUsername = "";
                elements.userInfo.style.display = "none";
                elements.authToggle.style.display = "inline-flex";
                elements.notificationBellContainer.style.display = 'none';
                if (elements.updateSectionDesktop) elements.updateSectionDesktop.style.display = 'none';
                if (userActionBtn) {
                    userActionBtn.textContent = 'Login / Registrati';
                    elements.mobileMenuUserActionBtn.style.color = '';
                    elements.mobileMenuUserActionBtn.querySelector('i').style.color = '';
                }
            }
        }

        function handleViewMode() {
            const viewId = new URLSearchParams(window.location.search).get("view");
            if (!viewId) { hideLoader(); return false; }
            isViewMode = true;
            document.body.classList.add('view-mode-active');
            document.body.style.paddingBottom = '0';
            document.getElementById('bottomNav').style.display = 'none';
            document.querySelectorAll("#shareBtn, #exportBtn, #importBtn, #resetBtn, #authToggle, #userInfo, .notification-bell-container, #settingsBtn, #sideSettingsBtn, #mobileSettingsBtn").forEach(el => { if(el) el.style.display = "none"; });
            document.querySelectorAll("#mediaManagementBtn, #sideManagementBtn").forEach(el => { if(el) { el.style.opacity = "0.5"; el.style.pointerEvents = "none"; } });
            elements.viewModeBanner.style.display = "flex";
            db.ref(`users/${viewId}/tvShowTracker`).on("value", snapshot => {
                const data = snapshot.val();
                if (data) {
                    mediaList = (data.mediaList || []).map(item => ({ ...getDefaultShowProps(), ...item }));
                    categories = (data.categories || DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false }))).map(cat => (typeof cat === 'string') ? { name: cat, hideProgress: false } : cat);
                    renderFullUI();
                    db.ref(`users/${viewId}/email`).once("value", emailSnap => {
                        elements.viewModeUserEmail.textContent = `Stai visualizzando la libreria di ${emailSnap.val() || "un utente"}`;
                    });
                } else { showNotification("Libreria condivisa non trovata.", "error"); }
                hideLoader();
            });
            return true;
        }

        function logActivity(type, title, details) {
            if (!currentUser) return;
            const logRef = db.ref(`users/${currentUser.uid}/activityLog`);
            const activity = {
                type,
                title,
                details,
                actorName: currentUsername || null,
                timestamp: new Date().toISOString(),
                link: `${window.location.origin}${window.location.pathname.replace('index.html', 'serietv_tracker.html')}?view=${currentUser.uid}`
            };

            return logRef.transaction(currentLog => {
                let log = Array.isArray(currentLog) ? currentLog : [];
                log.unshift(activity);
                return log.slice(0, MAX_LOG_SIZE);
            });
        }

        function escapeHTML(value = "") {
            return String(value).replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        }

        function getFriendDisplayName(friend = {}) {
            return friend.username || friend.email || 'Utente';
        }

        async function loadOwnUsername() {
            if (!currentUser || !elements.myUsernameInput) return;
            try {
                const snapshot = await db.ref(`users/${currentUser.uid}/social/username`).once('value');
                currentUsername = snapshot.val() || '';
                elements.myUsernameInput.value = currentUsername;
            } catch (error) {
                currentUsername = '';
                elements.myUsernameInput.value = '';
                console.warn("Impossibile leggere lo username personale:", error);
            }
        }

        async function saveOwnUsername() {
            if (!currentUser || !elements.myUsernameInput) return;
            const username = elements.myUsernameInput.value.trim().replace(/\s+/g, ' ');
            if (username.length > 32) {
                showNotification("Username troppo lungo.", "warning");
                return;
            }
            try {
                await db.ref(`users/${currentUser.uid}/social/username`).set(username || null);
                currentUsername = username;
                elements.myUsernameInput.value = username;
                showNotification(username ? "Username salvato." : "Username rimosso.", "success");
            } catch (error) {
                console.error("Impossibile salvare lo username:", error);
                showNotification("Non posso salvare lo username: permessi Firebase mancanti.", "error");
            }
        }

        async function syncFollowedFriendProfiles() {
            if (!followedFriends.length) return;
            followedFriends = await Promise.all(followedFriends.map(async friend => {
                try {
                    const emailSnapshot = await db.ref(`users/${friend.id}/email`).once('value');
                    return { ...friend, email: emailSnapshot.val() || friend.email };
                } catch (error) {
                    console.warn("Impossibile aggiornare il profilo amico:", friend.id, error);
                    return friend;
                }
            }));
        }

        function detachAllFriendListeners() {
            Object.values(friendListeners).forEach(({ ref, listener }) => ref.off('value', listener));
            friendListeners = {};
        }

        function setupFriendListeners() {
            if (!currentUser) return;
            detachAllFriendListeners();
            const friendActivityMap = new Map();
            const processAndRenderNotifications = () => {
                let allNewNotifications = Array.from(friendActivityMap.values()).flat();
                allNewNotifications.sort((a, b) => {
                    // Check if activity is related to a dropped show
                    const showA = mediaList.find(m => m.title === a.activity.title);
                    const showB = mediaList.find(m => m.title === b.activity.title);
                    const isDroppedA = showA ? showA.isDropped : false;
                    const isDroppedB = showB ? showB.isDropped : false;

                    // Sort dropped shows to the bottom
                    if (isDroppedA && !isDroppedB) return 1;
                    if (!isDroppedA && isDroppedB) return -1;

                    // Secondary sort by date (descending)
                    return new Date(b.activity.timestamp) - new Date(a.activity.timestamp);
                });
                renderNotifications(allNewNotifications.slice(0, MAX_NOTIFICATIONS));
            };

            renderNotifications([]);
            if (followedFriends.length === 0) return;

            followedFriends.forEach(friend => {
                const friendDisplayName = getFriendDisplayName(friend);
                const ref = db.ref(`users/${friend.id}/activityLog`);
                const listener = snapshot => {
                    const activities = snapshot.val() || [];
                    const lastChecked = lastCheckedTimestamps[friend.id] || new Date(0).toISOString();

                    const activityArray = Array.isArray(activities) ? activities : [];
                    const newActivities = activityArray
                        .filter(act => act && new Date(act.timestamp) > new Date(lastChecked))
                        .map(activity => ({ friendId: friend.id, friendEmail: activity.actorName || friendDisplayName, activity }));

                    friendActivityMap.set(friend.id, newActivities);
                    processAndRenderNotifications();
                };
                ref.on('value', listener);
                friendListeners[friend.id] = { ref, listener };
            });
        }

        function populateNotificationList(listElement, notifications) {
            listElement.innerHTML = ''; // Clear previous notifications
            if (notifications.length > 0) {
                notifications.forEach(n => {
                    if (!n.activity) return;
                    const item = document.createElement('div');
                    item.className = 'notification-item';
                    item.dataset.friendId = n.friendId;

                    // Definiamo se è TV o FILM in base al tipo di attività
                    const isTV = n.activity.type.includes('show') || n.activity.type.includes('season');

                    item.innerHTML = `
                        <i class="fas ${getActivityIcon(n.activity.type)} ${isTV ? 'tv-notification' : 'film-notification'}"></i>
                        <span class="notification-item-text">${getActivityText(n.friendEmail, n.activity)}</span>`;

                    item.addEventListener('click', () => {
                        const friendId = item.dataset.friendId;
                        if (friendId) {
                            // Costruiamo il percorso base fisso
                            const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                            const url = isTV
                                ? `${window.location.origin}${path}serietv_tracker.html?view=${friendId}`
                                : `${window.location.origin}${path}film_tracker.html?view=${friendId}`;

                            window.location.href = url;
                        }
                    });
                    listElement.appendChild(item);
                });
            } else {
                const emptyState = document.createElement('div');
                emptyState.className = 'no-notifications';
                emptyState.textContent = 'Nessuna nuova notifica';
                listElement.appendChild(emptyState);
            }
        }

        function renderNotifications(notifications) {
            const count = notifications.length;

            // Desktop Dropdown
            elements.notificationBadge.textContent = count;
            elements.notificationBadge.classList.toggle('visible', count > 0);
            elements.notificationBadge.classList.toggle('multi', count > 9);
            const desktopList = elements.notificationDropdown.querySelector('.notification-list');
            if (!desktopList) { // Initial setup for desktop dropdown
                elements.notificationDropdown.innerHTML = `
                <div class="social-hub-header">
                    <div class="hub-pill-container">
                        <button class="hub-btn hub-friends-btn" title="Amici">
                            <i class="fas fa-user-friends"></i> <span>Amici</span>
                        </button>
                        <button class="hub-btn hub-share-btn" title="Condividi">
                            <i class="fas fa-share-alt"></i> <span>Condividi</span>
                        </button>
                    </div>
                </div>
                <div class="notification-list"></div>
                <div class="notification-footer">
                    <button class="mark-read-pill" id="markReadAll"><i class="fas fa-check-double"></i> Segna come lette</button>
                </div>`;
                bindSocialHubButtons();
            }
            populateNotificationList(elements.notificationDropdown.querySelector('.notification-list'), notifications);

            // Mobile Modal
            elements.notificationBadgeMobile.textContent = count;
            elements.notificationBadgeMobile.classList.toggle('visible', count > 0);
            elements.notificationBadgeMobile.classList.toggle('multi', count > 9);
            populateNotificationList(elements.notificationListMobile, notifications);
        }

        function ensureNotificationDropdownOverlay() {
            if (!elements.notificationDropdown) return;
            if (elements.notificationDropdown.parentElement !== document.body) {
                document.body.appendChild(elements.notificationDropdown);
            }
            if (!elements.notificationDropdown.dataset.overlayReady) {
                elements.notificationDropdown.addEventListener('click', e => e.stopPropagation());
                elements.notificationDropdown.dataset.overlayReady = 'true';
            }
        }

        function positionNotificationDropdown() {
            if (!elements.notificationDropdown || !elements.notificationBellContainer) return;
            const bellRect = elements.notificationBellContainer.getBoundingClientRect();
            const panelWidth = Math.min(350, window.innerWidth - 32);
            const right = Math.max(12, window.innerWidth - bellRect.right);
            const top = Math.min(bellRect.bottom + 10, Math.max(12, window.innerHeight - 120));

            elements.notificationDropdown.style.position = 'fixed';
            elements.notificationDropdown.style.top = `${top}px`;
            elements.notificationDropdown.style.right = `${right}px`;
            elements.notificationDropdown.style.left = 'auto';
            elements.notificationDropdown.style.width = `${panelWidth}px`;
            elements.notificationDropdown.style.maxWidth = 'calc(100vw - 24px)';
            elements.notificationDropdown.style.maxHeight = `min(420px, calc(100vh - ${top + 16}px))`;
            elements.notificationDropdown.style.zIndex = '5000';
            elements.notificationDropdown.style.transform = 'none';
        }

        function showNotificationDropdown() {
            ensureNotificationDropdownOverlay();
            if (!elements.notificationDropdown.querySelector('.notification-list')) {
                renderNotifications([]);
            }
            positionNotificationDropdown();
            elements.notificationDropdown.style.display = 'flex';
            elements.notificationDropdown.style.visibility = 'visible';
            elements.notificationDropdown.style.opacity = '1';
            elements.notificationDropdown.style.pointerEvents = 'auto';
            elements.notificationDropdown.classList.add('visible');
            elements.notificationBellContainer.classList.add('active');
        }

        function hideNotificationDropdown() {
            if (elements.notificationDropdown) {
                elements.notificationDropdown.classList.remove('visible');
                elements.notificationDropdown.style.display = 'none';
                elements.notificationDropdown.style.visibility = '';
                elements.notificationDropdown.style.opacity = '';
                elements.notificationDropdown.style.pointerEvents = '';
            }
            elements.notificationBellContainer?.classList.remove('active');
        }

        function toggleNotificationDropdown(e) {
            e?.stopPropagation();
            if (elements.notificationDropdown.classList.contains('visible')) {
                hideNotificationDropdown();
            } else {
                showNotificationDropdown();
            }
        }


        function markAllNotificationsAsRead() {
            if (!currentUser) return;
            followedFriends.forEach(f => lastCheckedTimestamps[f.id] = new Date().toISOString());
            saveSocialData();
            renderNotifications([]); // This will clear both desktop and mobile
            closeModal(elements.mobileNotificationsModal);
        }

        function getActivityIcon(type) {
            if (type.startsWith('add_show')) return 'fa-plus-circle';
            if (type.startsWith('move_show')) return 'fa-folder-open';
            if (type.startsWith('delete_show')) return 'fa-trash-alt';
            if (type.startsWith('complete_show') || type === 'mark_completed') return 'fa-check-double';
            if (type.startsWith('complete_season')) return 'fa-check-circle';
            if (type === 'add') return 'fa-film';
            if (type === 'move') return 'fa-folder-open';
            if (type === 'delete') return 'fa-trash-alt';
            if (type === 'rewatch') return 'fa-sync-alt';
            return 'fa-info-circle';
        }

        function getActivityText(friendEmail, activity) {
            const email = `<strong>${escapeHTML(friendEmail || 'Utente')}</strong>`;
            const title = `<strong>${escapeHTML(activity.title)}</strong>`;
            switch (activity.type) {
                case 'add_show': return `${email} ha aggiunto la serie ${title} ${activity.details}`;
                case 'move_show': return `${email} ha spostato la serie ${title} ${activity.details}`;
                case 'delete_show': return `${email} ha eliminato la serie ${title} ${activity.details}`;
                case 'complete_show': return `${email} ha completato la serie ${title}! 🎉`;
                case 'mark_completed': return `${email} ha segnato ${title} come completato.`;
                case 'complete_season': return `${email} ha completato ${activity.details} di ${title}`;
                case 'add': return `${email} ha aggiunto il film ${title} ${activity.details}`;
                case 'move': return `${email} ha spostato il film ${title} ${activity.details}`;
                case 'delete': return `${email} ha eliminato il film ${title} ${activity.details}`;
                case 'rewatch': return `${email} ha aggiornato ${title} (${activity.details})`;
                default: return `${email} ha aggiornato ${title}`;
            }
        }

        async function addFriend() {
            const friendId = elements.friendIdInput.value.trim();
            if (!friendId || !currentUser) return;
            if (friendId === currentUser.uid) { showNotification("Non puoi aggiungere te stesso.", "warning"); return; }
            if (followedFriends.some(f => f.id === friendId)) { showNotification("Amico già presente in lista.", "warning"); return; }
            let emailSnapshot;
            try {
                emailSnapshot = await db.ref(`users/${friendId}/email`).once('value');
            } catch (error) {
                console.error("Impossibile leggere il profilo amico:", error);
                showNotification("Non posso verificare questo ID: permessi Firebase mancanti.", "error");
                return;
            }
            if (emailSnapshot.exists()) {
                followedFriends.push({ id: friendId, email: emailSnapshot.val() });
                lastCheckedTimestamps[friendId] = new Date().toISOString();
                await saveSocialData();
                renderFriendsList();
                setupFriendListeners();
                showNotification("Amico aggiunto!", "success");
            } else {
                showNotification("ID Utente non trovato.", "error");
            }
        }

        async function removeFriend(friendId) {
            followedFriends = followedFriends.filter(f => f.id !== friendId);
            delete lastCheckedTimestamps[friendId];
            await saveSocialData();
            renderFriendsList();
            setupFriendListeners();
        }

        function renderFriendsList() {
            if (!currentUser) { elements.friendsList.innerHTML = "<p>Devi essere loggato per usare questa funzione.</p>"; document.getElementById('myIdContainer').style.display = 'none'; return; }
            document.getElementById('myIdContainer').style.display = 'block';
            elements.myIdInput.value = currentUser.uid;
            loadOwnUsername();
            elements.friendsList.innerHTML = "";
            if (followedFriends.length === 0) { elements.friendsList.innerHTML = `<p style="text-align:center; color: var(--text-secondary);">Non stai seguendo nessun amico.</p>`; return; }
            const trackerBasePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
            const buildFriendTrackerUrl = (fileName, friendId) => `${window.location.origin}${trackerBasePath}${fileName}?view=${friendId}`;
            followedFriends.forEach(friend => {
                const card = document.createElement("div"); card.className = "management-card";
                card.innerHTML = `
                <div>
                    <div>
                        <div class="friend-email">${escapeHTML(getFriendDisplayName(friend))}</div>
                        <div class="friend-id">${escapeHTML(friend.email || friend.id)}</div>
                    </div>
                </div>
                <div class="management-card-actions">
                    <button class="btn visit-friend-films-btn" data-id="${friend.id}" title="Visita Libreria Film"><i class="fas fa-film"></i></button>
                    <button class="btn visit-friend-tv-btn" data-id="${friend.id}" title="Visita Libreria Serie TV"><i class="fas fa-tv"></i></button>
                    <button class="btn btn-danger remove-friend-btn" data-id="${friend.id}" title="Rimuovi Amico"><i class="fas fa-trash"></i></button>
                </div>`;
                card.querySelector('.remove-friend-btn').addEventListener('click', () => removeFriend(friend.id));
                card.querySelector('.visit-friend-films-btn').addEventListener('click', (e) => {
                    const url = buildFriendTrackerUrl('film_tracker.html', e.currentTarget.dataset.id);
                    window.location.href = url;
                });
                card.querySelector('.visit-friend-tv-btn').addEventListener('click', (e) => {
                    const url = buildFriendTrackerUrl('serietv_tracker.html', e.currentTarget.dataset.id);
                    window.location.href = url;
                });
                elements.friendsList.appendChild(card);
            });
        }

        async function toggleFavorite(showId) {
            if (isViewMode) return;
            const show = mediaList.find(m => m.id === showId);
            if (show) {
                show.isFavorite = !show.isFavorite;
                await saveData();

                const cardBtn = document.querySelector(`.media-card[data-id="${showId}"] .favorite-btn`);
                if (cardBtn) cardBtn.classList.toggle('is-favorite', show.isFavorite);

                const modalBtn = document.getElementById('detailsModalFavoriteBtn');
                if (modalBtn && elements.detailsModal.style.display === 'flex') {
                    modalBtn.classList.toggle('is-favorite', show.isFavorite);
                }

                if (document.getElementById('categoryFilter').dataset.value === 'favorites') {
                    renderMedia();
                }
            }
        }

        function openRewatchModal(context) {
            currentRewatchContext = context;
            const { showId, seasonNumber, episodeNumber } = context;
            const show = mediaList.find(s => s.id === showId);
            if (!show) return;

            let currentCount = 0;
            let title = "";

            if (episodeNumber) {
                const episodeKey = `${seasonNumber}-${episodeNumber}`;
                currentCount = show.rewatches?.[episodeKey] || 0;
                const episode = show.seasons?.[seasonNumber]?.episodes.find(e => e.episode_number == episodeNumber);
                title = episode ? `S${seasonNumber} E${episodeNumber} - ${episode.name}` : `Episodio S${seasonNumber}E${episodeNumber}`;
            } else {
                title = `Stagione ${seasonNumber}`;
            }

            elements.rewatchModalTitle.textContent = `Rewatch: ${title}`;
            elements.rewatchCountInput.value = currentCount;
            updateRewatchModalButtons(currentCount);

            openModal(elements.rewatchModal);
        }

        async function setRewatchCount(count) {
            const { showId, seasonNumber, episodeNumber } = currentRewatchContext;
            const show = mediaList.find(s => s.id === showId);
            if (!show) return;

            const duplicates = getLinkedShowInstances(show);

            duplicates.forEach(dup => {
                if (!dup.rewatches) dup.rewatches = {};
                const updateLogic = (sNum, eNum) => {
                    const key = `${sNum}-${eNum}`;
                    if (count > 0) { dup.rewatches[key] = count; dup.progress[key] = true; } 
                    else { delete dup.rewatches[key]; }

                    // AGGIORNAMENTO DOM CHIRURGICO
                    const item = document.getElementById(`item-${showId}-${sNum}-${eNum}`);
                    if (item) {
                        if (count > 0) item.classList.add('watched');
                        const badge = item.querySelector('.episode-rewatch-badge');
                        if (badge) {
                            if (count > 0) {
                                badge.classList.remove('zero-count');
                                badge.innerHTML = `<i class="fas fa-sync-alt"></i> <span class="count">${count}</span>`;
                            } else {
                                badge.classList.add('zero-count');
                                badge.innerHTML = `<i class="fas fa-sync-alt"></i>`;
                            }
                        }
                    }
                };

                if (episodeNumber) updateLogic(seasonNumber, episodeNumber);
                else show.seasons[seasonNumber]?.episodes.forEach(ep => updateLogic(seasonNumber, ep.episode_number));
                updateShowCategoryAndTimestamps(dup);
            });

            updateSeasonSpoilerState(show, seasonNumber);
            updateSeasonHeaderUI(showId, seasonNumber);
            refreshEpisodesToolbar(show);
            closeModal(elements.rewatchModal);
            updateStats();
            await saveData();
        }

        // Nuova funzione helper per aggiornare l'header della stagione
        function updateSeasonHeaderUI(showId, seasonNumber) {
            const show = mediaList.find(s => s.id === showId);
            if (!show || !show.seasons[seasonNumber]) return;

            const episodes = show.seasons[seasonNumber].episodes || [];
            // Controlla se TUTTI gli episodi hanno rewatch > 0
            const isSeasonRewatched = episodes.length > 0 && episodes.every(ep => (show.rewatches[`${seasonNumber}-${ep.episode_number}`] || 0) > 0);

            const header = document.querySelector(`.season-header[data-season-target="${seasonNumber}"]`);
            if (header) {
                const titleContainer = header.querySelector('.season-title-container');
                const existingBadge = titleContainer.querySelector('.season-rewatch-badge');

                if (isSeasonRewatched) {
                    if (!existingBadge) {
                        // Aggiungi badge se non c'è
                        const badge = document.createElement('span');
                        badge.className = 'season-rewatch-badge';
                        badge.title = 'Stagione rivista';
                        badge.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        // Inserisci dopo il titolo (che è il primo figlio span)
                        const titleSpan = titleContainer.querySelector('.season-title');
                        titleSpan.insertAdjacentElement('afterend', badge);
                    }
                } else {
                    if (existingBadge) {
                        // Rimuovi badge se c'è
                        existingBadge.remove();
                    }
                }

                // Aggiorna anche il testo progressi (es. 10/10)
                const progressText = header.querySelector('.season-progress-text');
                const watchedCount = Object.keys(show.progress).filter(k => k.startsWith(`${seasonNumber}-`)).length;
                if (progressText) progressText.textContent = `${watchedCount} / ${episodes.length}`;
            }
        }


        function updateRewatchModalButtons(count) {
            document.querySelectorAll('#rewatchModal .quick-rewatch-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.count) === count);
            });
        }

        function displayLastUpdateTime() {
            const lastUpdate = localStorage.getItem('lastBackgroundUpdate');
            let timestampText = "Mai eseguito";
            if (lastUpdate) {
                timestampText = new Date(parseInt(lastUpdate)).toLocaleString('it-IT');
            }
            if (elements.lastUpdateTimestampDesktop) {
                elements.lastUpdateTimestampDesktop.textContent = `Ultimo aggiornamento: ${timestampText}`;
            }
        }

        function toggleSideSearch(forceState) {
            const overlay = document.getElementById('sideSearchOverlay');
            if (!overlay || window.innerWidth <= 768) return;
            const shouldShow = typeof forceState === 'boolean' ? forceState : overlay.style.display !== 'flex';
            overlay.style.display = shouldShow ? 'flex' : 'none';
            if (shouldShow) document.getElementById('searchInputSide')?.focus();
        }

        function syncDesktopModalChrome() {
            const topBar = document.querySelector('.top-bar');
            const sidebarMini = document.querySelector('.sidebar-mini');
            const sideSearchOverlay = document.getElementById('sideSearchOverlay');
            if (!topBar && !sidebarMini && !sideSearchOverlay) return;

            const hasOpenModal = Array.from(document.querySelectorAll('.modal')).some(modal =>
                modal.classList.contains('visible') || modal.style.display === 'flex'
            );

            if (window.innerWidth > 768 && hasOpenModal) {
                topBar?.style.setProperty('pointer-events', 'none', 'important');
                sidebarMini?.style.setProperty('pointer-events', 'none', 'important');
                sideSearchOverlay?.style.setProperty('pointer-events', 'none', 'important');
                return;
            }

            topBar?.style.removeProperty('pointer-events');
            sidebarMini?.style.removeProperty('pointer-events');
            sideSearchOverlay?.style.removeProperty('pointer-events');
        }

        function isModalVisible(modal) {
            return !!modal && (modal.classList.contains('visible') || modal.style.display === 'flex');
        }

        function getShowDetailsCacheKey(show) {
            if (!show) return null;
            if (show.tmdbID) return `tmdb:${show.tmdbID}`;
            if (show.imdbID) return `imdb:${show.imdbID}`;
            return null;
        }

        function compactShowDetailsForCache(details) {
            if (!details) return null;

            return {
                id: details.id || null,
                backdrop_path: details.backdrop_path || null,
                first_air_date: details.first_air_date || "",
                last_air_date: details.last_air_date || "",
                status: details.status || "",
                tagline: details.tagline || "",
                overview: details.overview || "",
                genres: (details.genres || []).map(genre => ({ id: genre.id || null, name: genre.name || "" })),
                created_by: (details.created_by || []).map(person => ({ id: person.id || null, name: person.name || "" })),
                networks: (details.networks || []).map(network => ({ id: network.id || null, name: network.name || "" })),
                credits: {
                    cast: (details.credits?.cast || []).slice(0, 12).map(actor => ({
                        id: actor.id || null,
                        name: actor.name || "",
                        character: actor.character || "",
                        profile_path: actor.profile_path || null
                    }))
                }
            };
        }

        function persistShowDetailsCache() {
            try {
                const now = Date.now();
                const entries = Array.from(showDetailsCache.entries())
                    .filter(([, entry]) => entry && entry.timestamp && entry.data && (now - entry.timestamp) <= SHOW_DETAILS_CACHE_MAX_AGE)
                    .sort((a, b) => b[1].timestamp - a[1].timestamp)
                    .slice(0, SHOW_DETAILS_CACHE_MAX_ENTRIES);

                showDetailsCache = new Map(entries);
                localStorage.setItem(SHOW_DETAILS_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
            } catch (error) {
                console.error("Errore nel salvataggio cache dettagli serie:", error);
            }
        }

        function loadPersistedShowDetailsCache() {
            try {
                const rawCache = JSON.parse(localStorage.getItem(SHOW_DETAILS_CACHE_KEY) || "{}");
                const now = Date.now();
                const validEntries = Object.entries(rawCache).filter(([, entry]) => {
                    return entry && entry.timestamp && entry.data && (now - entry.timestamp) <= SHOW_DETAILS_CACHE_MAX_AGE;
                });

                showDetailsCache = new Map(validEntries);
                if (validEntries.length !== Object.keys(rawCache).length) {
                    persistShowDetailsCache();
                }
            } catch (error) {
                showDetailsCache = new Map();
                console.error("Errore nel caricamento cache dettagli serie:", error);
            }
        }

        function getCachedShowDetails(show) {
            const cacheKey = getShowDetailsCacheKey(show);
            return cacheKey ? showDetailsCache.get(cacheKey) || null : null;
        }

        function isShowDetailsCacheFresh(entry) {
            return !!entry && !!entry.timestamp && (Date.now() - entry.timestamp) < SHOW_DETAILS_CACHE_TTL;
        }

        function setCachedShowDetails(show, details) {
            const cacheKey = getShowDetailsCacheKey(show);
            const compactDetails = compactShowDetailsForCache(details);
            if (!cacheKey || !compactDetails) return null;

            const entry = {
                timestamp: Date.now(),
                data: compactDetails
            };

            showDetailsCache.set(cacheKey, entry);
            persistShowDetailsCache();
            return compactDetails;
        }

        async function fetchShowDetailsForModal(show, { forceRefresh = false } = {}) {
            const cacheKey = getShowDetailsCacheKey(show);
            if (!cacheKey) return null;

            if (showDetailsRequests.has(cacheKey)) {
                return showDetailsRequests.get(cacheKey);
            }

            const request = (async () => {
                const details = await fetchBestTMDbDetails(show);
                if (!details) return null;
                setCachedShowDetails(show, details);
                return details;
            })();

            showDetailsRequests.set(cacheKey, request);

            try {
                return await request;
            } finally {
                showDetailsRequests.delete(cacheKey);
            }
        }

        function getComputedShowYear(tmdbDetails) {
            const firstYear = tmdbDetails.first_air_date ? tmdbDetails.first_air_date.split('-')[0] : '';
            const status = tmdbDetails.status;
            const lastYear = (status === 'Ended' || status === 'Canceled') && tmdbDetails.last_air_date ? tmdbDetails.last_air_date.split('-')[0] : '';

            if (firstYear && lastYear && firstYear !== lastYear) {
                return `${firstYear}–${lastYear}`;
            }

            if (firstYear && (status === 'Returning Series' || status === 'In Production' || status === 'Planned')) {
                return `${firstYear} – In corso`;
            }

            return firstYear;
        }

        function applyShowMetadataFromDetails(show, tmdbDetails, { collectSummary = false } = {}) {
            let hasChanges = false;
            const updateSummary = [];

            const nextYear = getComputedShowYear(tmdbDetails);
            if (show.year !== nextYear) {
                show.year = nextYear;
                hasChanges = true;
            }

            if (show.status !== tmdbDetails.status) {
                show.status = tmdbDetails.status;
                hasChanges = true;
                if (collectSummary) {
                    updateSummary.push(`<strong>${show.title}</strong>: Stato aggiornato a "${tmdbDetails.status}"`);
                }
            }

            if (tmdbDetails.genres) {
                const newGenres = tmdbDetails.genres.map(g => g.name);
                if (JSON.stringify(show.genres) !== JSON.stringify(newGenres)) {
                    show.genres = newGenres;
                    hasChanges = true;
                }
            }

            return { hasChanges, updateSummary };
        }

        function buildEpisodeSnapshot(ep) {
            return {
                name: ep.name || "",
                overview: ep.overview || "",
                episode_number: ep.episode_number,
                runtime: ep.runtime || 0,
                still_path: ep.still_path || null,
                air_date: ep.air_date || ""
            };
        }

        function mergeEpisodeDetails(localEpisode, tmdbEpisode) {
            const nextEpisode = buildEpisodeSnapshot(tmdbEpisode);
            let changed = false;

            Object.entries(nextEpisode).forEach(([key, value]) => {
                const currentValue = localEpisode[key] ?? (key === 'runtime' ? 0 : key === 'still_path' ? null : "");
                if (currentValue !== value) {
                    localEpisode[key] = value;
                    changed = true;
                }
            });

            return changed;
        }

        async function syncShowSeasonsFromDetails(show, tmdbDetails) {
            let hasUpdates = false;
            let updateSummary = [];

            const apiSeasonNumbers = new Set((tmdbDetails.seasons || []).map(s => s.season_number));
            Object.keys(show.seasons).forEach(localSeasonNum => {
                const sNum = parseInt(localSeasonNum, 10);
                if (!apiSeasonNumbers.has(sNum) && sNum !== 0) {
                    delete show.seasons[localSeasonNum];
                    hasUpdates = true;
                    updateSummary.push(`<strong>${show.title}</strong>: Rimossa Stagione ${sNum} (non più presente su TMDb)`);

                    if (show.progress) {
                        Object.keys(show.progress).forEach(progressKey => {
                            if (progressKey.startsWith(`${localSeasonNum}-`)) {
                                delete show.progress[progressKey];
                            }
                        });
                    }
                }
            });

            const seasonDetailPromises = (tmdbDetails.seasons || [])
                .filter(s => s.season_number > 0 || (show.seasons && show.seasons[s.season_number]))
                .map(s => fetchTMDbSeasonDetailsWithFallback(tmdbDetails.id, s.season_number));

            const allSeasonDetails = await Promise.all(seasonDetailPromises);

            allSeasonDetails.forEach(seasonDetails => {
                if (!seasonDetails) return;

                const seasonNumber = seasonDetails.season_number;
                const localSeason = show.seasons[seasonNumber];
                const newEpisodeCount = (seasonDetails.episodes || []).length;
                const oldEpisodeCount = (localSeason?.episodes || []).length;

                if (!localSeason) {
                    updateSummary.push(`<strong>${show.title}</strong>: Aggiunta Stagione ${seasonNumber}`);
                } else if (newEpisodeCount > oldEpisodeCount) {
                    updateSummary.push(`<strong>${show.title}</strong>: ${newEpisodeCount - oldEpisodeCount} nuovi episodi nella Stagione ${seasonNumber}`);
                }

                if (!localSeason || oldEpisodeCount !== newEpisodeCount) {
                    show.seasons[seasonNumber] = {
                        name: seasonDetails.name,
                        episodes: (seasonDetails.episodes || []).map(buildEpisodeSnapshot)
                    };
                    hasUpdates = true;
                    return;
                }

                if (localSeason.name !== seasonDetails.name) {
                    localSeason.name = seasonDetails.name;
                    hasUpdates = true;
                }

                const localEpisodesByNumber = new Map((localSeason.episodes || []).map(ep => [ep.episode_number, ep]));
                let updatedEpisodeDetails = 0;

                (seasonDetails.episodes || []).forEach(tmdbEpisode => {
                    const localEpisode = localEpisodesByNumber.get(tmdbEpisode.episode_number);
                    if (localEpisode && mergeEpisodeDetails(localEpisode, tmdbEpisode)) {
                        updatedEpisodeDetails++;
                    }
                });

                if (updatedEpisodeDetails > 0) {
                    hasUpdates = true;
                    updateSummary.push(`<strong>${show.title}</strong>: Aggiornati dettagli di ${updatedEpisodeDetails} episodi nella Stagione ${seasonNumber}`);
                }
            });

            return { hasUpdates, updateSummary };
        }

        async function forceRefreshShow(showId, silent = false) {
            const show = mediaList.find(m => m.id === showId);
            if (!show) return [];

            const requestToken = ++activeShowDetailsRequestToken;
            const tmdbDetails = await fetchShowDetailsForModal(show, { forceRefresh: true });
            if (!tmdbDetails) {
                if (!silent) showNotification("Dettagli serie non disponibili.", "warning");
                return [];
            }

            const previousLastTmdbCheckAt = show.lastTmdbCheckAt;
            show.lastTmdbCheckAt = new Date().toISOString();

            const metadataResult = applyShowMetadataFromDetails(show, tmdbDetails, { collectSummary: true });
            const seasonResult = await syncShowSeasonsFromDetails(show, tmdbDetails);
            const updateSummary = metadataResult.updateSummary.concat(seasonResult.updateSummary);
            const hasChanges = metadataResult.hasChanges || seasonResult.hasUpdates;

            if (hasChanges || (!silent && show.lastTmdbCheckAt !== previousLastTmdbCheckAt)) {
                await saveData();
                if (!silent) {
                    renderMedia();
                    updateStats();
                    showNotification(hasChanges ? `Dati aggiornati per ${show.title}!` : `Controllo completato per ${show.title}.`, "success");
                }
            }

            currentShowCache = { show, tmdbDetails };
            if (requestToken === activeShowDetailsRequestToken && isModalVisible(elements.detailsModal)) {
                populateDetailsModal(tmdbDetails, show);
            }

            return updateSummary;
        }

        function setupSidebarCompact() {
            if (window.innerWidth <= 768) return;

            const categoryFilterSlot = document.getElementById('categoryFilterSlot');
            const sortFilterSlot = document.getElementById('sortFilterSlot');
            const categoryFilterWrapper = document.getElementById('categoryFilter')?.parentElement;
            const sortFilterWrapper = document.getElementById('sortFilter')?.parentElement;

            if (categoryFilterSlot && categoryFilterWrapper) {
                categoryFilterSlot.appendChild(categoryFilterWrapper);
            }

            if (sortFilterSlot && sortFilterWrapper) {
                sortFilterSlot.appendChild(sortFilterWrapper);
            }

            const trigger = document.getElementById('sideSearchTrigger');
            const overlay = document.getElementById('sideSearchOverlay');
            const inputSide = document.getElementById('searchInputSide');
            const inputMain = document.getElementById('searchInput');
            if (trigger && overlay && inputSide && inputMain) {
                trigger.onclick = (e) => {
                    e.stopPropagation();
                    toggleSideSearch();
                };
                overlay.addEventListener('click', (e) => e.stopPropagation());
                inputSide.oninput = (e) => {
                    inputMain.value = e.target.value;
                    inputMain.dispatchEvent(new Event('input'));
                };
                inputMain.addEventListener('input', () => {
                    if (document.activeElement !== inputSide) inputSide.value = inputMain.value;
                });
            }

            document.getElementById('sideManagementBtn')?.addEventListener('click', () => elements.mediaManagementBtn.click());
            document.getElementById('sideDigitalBtn')?.addEventListener('click', () => document.getElementById('calendarBtn')?.click());
            document.getElementById('sideStatsBtn')?.addEventListener('click', () => { openModal(document.getElementById('advancedStatsModal')); renderAdvancedStats(); });
            document.getElementById('sideSettingsBtn')?.addEventListener('click', () => elements.settingsBtn.click());
            document.getElementById('sideAuthBtn')?.addEventListener('click', () => { currentUser ? requestLogout() : elements.authToggle.click(); });
            elements.notificationBellContainer.onclick = (e) => {
                if (e.target.closest('#notificationDropdown')) return;
                if (e.target.closest('#bellIcon')) return;
                toggleNotificationDropdown(e);
            };

            document.addEventListener('click', () => toggleSideSearch(false));
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggleSideSearch(false);
                    hideNotificationDropdown();
                }
            });
        }


        /* --- GESTIONE MODALI E BACK GESTURE (HISTORY API) --- */

        // 1. Nuova funzione unificata per aprire i modali
        function openModal(modal) {
            if (!modal) return;
            if (modal.classList.contains('visible')) return;

            // Se stiamo aprendo un modale sopra un altro già aperto
            const alreadyOpen = document.querySelector('.modal.visible');
            if (alreadyOpen && alreadyOpen !== modal) {
                // Rendiamo il modale sotto leggermente più scuro o sfocato
                alreadyOpen.style.filter = "blur(2px) brightness(0.8)";
            }

            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            syncDesktopModalChrome();

            setTimeout(() => {
                modal.classList.add('visible');
                syncDesktopModalChrome();
            }, 10);

            // Registriamo lo stato nella cronologia
            history.pushState({ modalId: modal.id }, '', window.location.href);
        }

        // 2. Nuova funzione unificata per chiudere i modali (Rimosso duplicato precedente)
        // 3. Gestore dell'evento "Torna Indietro" (Swipe o Tasto fisico)
        window.addEventListener('popstate', (event) => {
            const visibleModals = Array.from(document.querySelectorAll('.modal'))
                .filter(m => m.classList.contains('visible'));

            if (visibleModals.length > 0) {
                // Ordina per z-index decrescente
                visibleModals.sort((a, b) => {
                    const zA = parseInt(window.getComputedStyle(a).zIndex) || 0;
                    const zB = parseInt(window.getComputedStyle(b).zIndex) || 0;
                    return zB - zA;
                });

                // Chiudiamo quello più in alto
                const topModal = visibleModals[0];
                topModal.classList.remove('visible');

                setTimeout(() => {
                    topModal.style.display = 'none';
                    topModal.style.filter = ""; // Resetta filtri

                    // Se è rimasto un altro modale sotto, togliamo la sfocatura
                    const nextModal = document.querySelector('.modal.visible');
                    if (nextModal) {
                        nextModal.style.filter = "";
                    }

                    if (document.querySelectorAll('.modal.visible').length === 0) {
                        document.body.classList.remove('modal-open');
                    }

                    syncDesktopModalChrome();
                }, 300);
            }
        });

        // --- AGGIORNAMENTO LISTENERS ---
        // Aggiorna setupEventListeners per usare openModal invece di style.display='flex'

        function exportData() {
            if (isViewMode) return;
            const data = { mediaList, categories, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `serietv_tracker_export_${new Date().toISOString().split("T")[0]}.json`;
            a.click();

            // SALVA IL TIMESTAMP
            const now = new Date().toISOString();
            localStorage.setItem('lastSeriesExport', now);
            if (currentUser) db.ref(`users/${currentUser.uid}/lastExport`).set(now);

            updateBackupBadge(now);
            showNotification("Backup scaricato con successo!", "success");
        }

        function updateBackupBadge(timestamp) {
            const badge = document.querySelector('#lastBackupBadge span');
            const stored = timestamp || localStorage.getItem('lastSeriesExport');
            if (stored) {
                badge.textContent = new Date(stored).toLocaleString('it-IT', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            }
        }

        function setupEventListeners() {
            // Modali principali
            elements.mediaManagementBtn.addEventListener("click", () => {
                // Sostituito style.display con openModal
                openModal(elements.mediaManagementModal);
                elements.mediaTitle.value = '';
                renderSearchDashboardEmptyState();
                currentTMDbSelection = null;
                elements.manageCategoriesPanel?.classList.remove('visible');
                elements.manageCategoriesPanel?.classList.add('panel-hidden');
                elements.tmdbResults?.classList.remove('results-hidden');
                elements.toggleCategoryManagementBtn?.classList.remove('active');
                renderCategoriesList();
                renderFriendsList();
                populateAddMediaCategorySelect();
            });
            elements.toggleCategoryManagementBtn?.addEventListener('click', () => {
                const isVisible = elements.manageCategoriesPanel?.classList.toggle('visible');
                elements.manageCategoriesPanel?.classList.toggle('panel-hidden', !isVisible);
                elements.tmdbResults?.classList.toggle('results-hidden', !!isVisible);
                elements.toggleCategoryManagementBtn.classList.toggle('active', !!isVisible);
            });

            // Ricerca
            elements.searchInput.addEventListener("input", () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(renderMedia, 300);
            });
            elements.mediaTitle.addEventListener("input", () => {
                clearTimeout(debounceTimeout);
                const title = elements.mediaTitle.value.trim();
                if (title.length >= 3) {
                    debounceTimeout = setTimeout(searchTMDb, 500);
                } else {
                    renderSearchDashboardEmptyState();
                }
            });
            elements.mediaTitle.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    clearTimeout(debounceTimeout);
                    searchTMDb();
                }
            });

            // Chiusura cliccando sullo sfondo scuro (Overlay)
            // Listener unico e universale per tutti i dropdown dell'app
            document.addEventListener('click', (e) => {
                // 1. Cerca se il click è avvenuto su una "custom-select"
                const clickedSelect = e.target.closest('.custom-select');

                // 2. Se ho cliccato su una select, gestisco l'apertura
                if (clickedSelect) {
                    e.stopPropagation(); // Fondamentale: impedisce al listener globale di chiuderlo
                    const wrapper = clickedSelect.parentElement;

                    // Chiudi tutti gli altri menu aperti
                    document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                        if (w !== wrapper) w.classList.remove('open');
                    });

                    // Toggle del menu corrente
                    wrapper.classList.toggle('open');
                    return; // Esce dalla funzione
                }

                // 3. Se il click NON è su una select, chiudi tutti i menu aperti
                const isOption = e.target.closest('.option');
                if (!isOption) {
                    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
                }

                // 4. Gestione selezione opzione
                if (isOption) {
                    const wrapper = isOption.closest('.custom-select-wrapper');
                    const select = wrapper.querySelector('.custom-select');

                    select.dataset.value = isOption.dataset.value;
                    select.querySelector('.selected-option').innerHTML = isOption.innerHTML;
                    wrapper.classList.remove('open');

                    // --- NUOVO: SALVA LA SCELTA NEL LOCAL STORAGE ---
                    if (select.id === 'sortFilter') {
                        // Riconosce in automatico se sei in Film o Serie TV
                        const storageKey = window.location.pathname.includes('serietv') ? 'tvShowSortOrder' : 'mediaTrackerSortOrder';
                        localStorage.setItem(storageKey, isOption.dataset.value);
                    }
                    // ------------------------------------------------

                    // --- GESTIONE CAMBIO CATEGORIA DAL MODALE DETTAGLI ---
                    if (select.id === 'modalCategorySelect') {
                        moveShowToCategory(select.dataset.mediaId, isOption.dataset.value);
                        return; // moveShowToCategory salva e fa il render
                    }

                    // Se è un filtro della dashboard, aggiorna la pagina
                    if (wrapper.id !== 'addMediaCategoryCustom' && typeof renderMedia === 'function') {
                        renderMedia();
                    }
                }

                // --- 2. Gestione Modali (Click-to-close) ---
                // Verifica se il click è avvenuto su un elemento con classe 'modal'
                if (e.target.classList.contains('modal')) {
                    closeModal(e.target);
                }
                // Fix: se clicchi nello spazio vuoto tra il contenuto del modale e i bordi
                else if (e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                    const modal = e.target.closest('.modal');
                    closeModal(modal);
                }

                // --- 3. Gestione Dropdown Notifiche ---
                if (!e.target.closest('.notification-bell-container') && !e.target.closest('#notificationDropdown')) {
                    hideNotificationDropdown();
                }
            });

            // Poster Modal
            elements.savePosterChange.addEventListener('click', () => { const selected = document.querySelector(".poster-option.selected"); if (selected) changePoster(elements.posterModal.dataset.mediaId, selected.dataset.url); });
            elements.cancelPosterChange.addEventListener('click', () => closeModal(elements.posterModal));

            // Settings Modal
            elements.settingsBtn.addEventListener('click', () => {
                updateBackupBadge();
                displayLastUpdateTime();
                openModal(document.getElementById('settingsModal'));
            });

            if (elements.toggleHomeStatsBtn && elements.statsPanel) {
                elements.toggleHomeStatsBtn.addEventListener('change', (e) => {
                    const isVisible = e.target.checked;
                    localStorage.setItem(HOME_STATS_PREF_KEY, String(isVisible));
                    toggleHomeStats(isVisible);
                });
            }

            if (elements.toggleCardRatingsBtn) {
                elements.toggleCardRatingsBtn.addEventListener('change', (e) => {
                    const isVisible = e.target.checked;
                    document.body.classList.toggle('hide-ratings-ui', !isVisible);
                    localStorage.setItem(CARD_RATINGS_PREF_KEY, String(isVisible));
                });
            }

            // Click sulle card interne
            document.getElementById('exportAction').addEventListener('click', exportData);

            const exportHTMLAction = document.getElementById('exportHTMLAction');
            if (exportHTMLAction) {
                exportHTMLAction.addEventListener('click', exportToHTML);
            }

            document.getElementById('importAction').addEventListener('click', () => {
                if (elements.importFile) elements.importFile.click();
            });

            const updateRatingsAction = document.getElementById('updateRatingsAction');
            if (updateRatingsAction) {
                updateRatingsAction.addEventListener('click', updateAllRatings);
            }

            const viewHistoryAction = document.getElementById('viewHistoryAction');
            if (viewHistoryAction) {
                viewHistoryAction.addEventListener('click', () => {
                    closeModal(document.getElementById('settingsModal'));
                    setTimeout(() => {
                        renderUpdateHistory();
                        openModal(document.getElementById('historyModal'));
                    }, 300);
                });
            }
            document.getElementById('resetAction').addEventListener('click', () => {
                // Chiudiamo il modale impostazioni PRIMA
                closeModal(document.getElementById('settingsModal'));

                // Aspettiamo che finisca l'animazione e poi chiediamo conferma
                setTimeout(() => {
                    resetApp();
                }, 350);
            });
            if (elements.importFile) {
                elements.importFile.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = event => {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (data && Array.isArray(data.mediaList)) {
                                // Chiudiamo il modale impostazioni PRIMA
                                closeModal(document.getElementById('settingsModal'));

                                setTimeout(() => {
                                    showConfirmModal("Importa Dati", `Sovrascrivere i dati con ${data.mediaList.length} serie?`, () => {
                                        mediaList = data.mediaList.map(item => ({ ...getDefaultShowProps(), ...item }));
                                        categories = (data.categories || DEFAULT_CATEGORIES.map(name => ({ name, hideProgress: false }))).map(cat => typeof cat === 'string' ? { name: cat, hideProgress: false } : cat);
                                        saveData();
                                        renderFullUI();
                                        showNotification("Dati importati!", "success");
                                    });
                                }, 350);
                            } else {
                                showNotification("File non valido.", "error");
                            }
                        } catch (error) {
                            showNotification("Errore lettura file.", "error");
                        }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                });
            }

            // Share
            elements.shareBtn.addEventListener('click', handleShare);
            elements.copyShareLinkBtn.addEventListener('click', (e) => { navigator.clipboard.writeText(e.target.closest('.modal-content').querySelector('input').value); showNotification("Link copiato!", "success"); });

            // Social e Varie
            elements.closeViewBtn.addEventListener('click', () => { window.location.href = window.location.pathname; });
            elements.addFriendBtn.addEventListener('click', addFriend);
            elements.saveUsernameBtn?.addEventListener('click', saveOwnUsername);
            elements.myUsernameInput?.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveOwnUsername();
                }
            });
            elements.copyMyIdBtn.addEventListener('click', () => { navigator.clipboard.writeText(elements.myIdInput.value); showNotification("ID copiato!", "success"); });
            elements.bellIcon.addEventListener('click', toggleNotificationDropdown);

            // Rewatch Modal
            elements.confirmRewatchBtn.addEventListener('click', () => { const newCount = parseInt(elements.rewatchCountInput.value); if (!isNaN(newCount) && newCount >= 0) { setRewatchCount(newCount); } else { showNotification("Inserisci un numero valido (0 o superiore).", "warning"); } });
            elements.cancelRewatchBtn.addEventListener('click', () => closeModal(elements.rewatchModal));
            document.querySelectorAll('#rewatchModal .quick-rewatch-btn').forEach(btn => btn.addEventListener('click', () => { const count = parseInt(btn.dataset.count); elements.rewatchCountInput.value = count; updateRewatchModalButtons(count); }));
            elements.rewatchCountInput.addEventListener('input', () => { const count = parseInt(elements.rewatchCountInput.value); updateRewatchModalButtons(count); });
            document.querySelectorAll("#rewatchModal .num-spinner-btn").forEach(btn => { btn.addEventListener("click", e => { const target = document.getElementById(e.currentTarget.dataset.target); if (target) { let value = parseInt(target.value) || 0; value += e.currentTarget.classList.contains("up") ? 1 : -1; if (value < 0) value = 0; target.value = value; updateRewatchModalButtons(value); } }); });

            // --- Bottom Nav Bar Listeners ---
            elements.bottomNavHome.addEventListener('click', () => {
                populateCategoryNavModal();
                openModal(elements.categoryNavModal);
                requestAnimationFrame(() => elements.categoryNavModal.classList.add('visible'));
            });
            elements.bottomNavCalendar.addEventListener('click', () => {
                renderCalendar();
                openModal(document.getElementById('calendarModal'));
            });


            elements.bottomNavAdd.addEventListener('click', () => { elements.mediaManagementBtn.click(); });
            elements.bottomNavManage.addEventListener('click', () => { openModal(elements.mobileMenuModal); requestAnimationFrame(() => elements.mobileMenuModal.classList.add('visible')); });
            elements.bottomNavNotifications.addEventListener('click', () => { openModal(elements.mobileNotificationsModal); requestAnimationFrame(() => elements.mobileNotificationsModal.classList.add('visible')); });

            // --- Mobile Modals Listeners ---
            elements.mobileMenuCloseBtn.addEventListener('click', () => closeModal(elements.mobileMenuModal));
            elements.mobileMenuUserActionBtn.addEventListener('click', () => {
                const shouldLogout = !!currentUser;
                closeModal(elements.mobileMenuModal);
                setTimeout(() => shouldLogout ? requestLogout() : openModal(elements.authModal), 320);
            });
            bindSocialHubButtons();
            elements.mobileSettingsBtn.addEventListener('click', () => {
                closeModal(elements.mobileMenuModal);
                setTimeout(() => {
                    updateBackupBadge();
                    displayLastUpdateTime();
                    openModal(document.getElementById('settingsModal'));
                }, 300);
            });
            const mobileMenuStatsBtn = document.getElementById('mobileMenuStatsBtn');
            if (mobileMenuStatsBtn) {
                mobileMenuStatsBtn.addEventListener('click', () => {
                    closeModal(elements.mobileMenuModal);
                    setTimeout(() => {
                        openModal(document.getElementById('advancedStatsModal'));
                        if (typeof renderAdvancedStats === 'function') renderAdvancedStats();
                    }, 300);
                });
            }
            // --- FILTRI MOBILI ---
            if (elements.mobileFilterBtn) {
                elements.mobileFilterBtn.addEventListener('click', () => {
                    const catSelectDesktop = document.getElementById('categoryFilter');
                    const sortSelectDesktop = document.getElementById('sortFilter');

                    // Popola i select mobili con le opzioni dei custom dropdown desktop
                    elements.mobileCategoryFilter.innerHTML = document.getElementById('categoryOptions').innerHTML
                        .replace(/<div class="option"/g, '<option')
                        .replace(/<\/div>/g, '</option>')
                        .replace(/data-value=/g, 'value=')
                        .replace(/<i class="[^"]*"><\/i> /g, '');
                    elements.mobileSortFilter.innerHTML = document.getElementById('sortOptions').innerHTML
                        .replace(/<div class="option"/g, '<option')
                        .replace(/<\/div>/g, '</option>')
                        .replace(/data-value=/g, 'value=')
                        .replace(/<i class="[^"]*"><\/i> /g, '');

                    // Sincronizza i valori attuali
                    elements.mobileCategoryFilter.value = catSelectDesktop.dataset.value || 'all';
                    elements.mobileSortFilter.value = sortSelectDesktop.dataset.value || 'added';

                    openModal(elements.filterSortModal);
                });
            }

            if (elements.applyFiltersBtn) {
                elements.applyFiltersBtn.addEventListener('click', () => {
                    const catSelect = document.getElementById('categoryFilter');
                    const sortSelect = document.getElementById('sortFilter');

                    // Aggiorna i filtri custom desktop con i valori scelti nel modale mobile
                    catSelect.dataset.value = elements.mobileCategoryFilter.value;
                    const catOptionEl = document.querySelector(`#categoryOptions .option[data-value="${catSelect.dataset.value}"]`);
                    if (catOptionEl) catSelect.querySelector('.selected-option').innerHTML = catOptionEl.innerHTML;

                    sortSelect.dataset.value = elements.mobileSortFilter.value;
                    const sortOptionEl = document.querySelector(`#sortOptions .option[data-value="${sortSelect.dataset.value}"]`);
                    if (sortOptionEl) sortSelect.querySelector('.selected-option').innerHTML = sortOptionEl.innerHTML;

                    // --- FIX: SALVATAGGIO IN MEMORIA ---
                    const storageKey = window.location.pathname.includes('serietv') ? 'tvShowSortOrder' : 'mediaTrackerSortOrder';
                    localStorage.setItem(storageKey, elements.mobileSortFilter.value);

                    renderMedia();
                    closeModal(elements.filterSortModal);
                });
            }

            // --- Category Navigation Modal Listeners ---
            elements.closeCategoryNavBtn.addEventListener('click', () => closeModal(elements.categoryNavModal));


            // --- Update Listeners ---
            const runCompleteUpdate = () => {
                updateAllShowsInBackground(true, null, { manual: true });
            };
            const runDailyUpdate = () => {
                updateAllShowsInBackground(false, null, { manual: true, skipRecentUpdateCheck: true });
            };
            const runUpdateFromSettings = (runner) => {
                closeModal(document.getElementById('settingsModal'));
                setTimeout(runner, 300);
            };

            if (elements.completeUpdateBtnDesktop) {
                elements.completeUpdateBtnDesktop.addEventListener('click', () => runUpdateFromSettings(runCompleteUpdate));
            }
            if (elements.dailyUpdateBtnDesktop) {
                elements.dailyUpdateBtnDesktop.addEventListener('click', () => runUpdateFromSettings(runDailyUpdate));
            }

            // --- BACK GESTURE IMPLEMENTATION FOR MOBILE MODALS ---
            let touchStartX = 0;
            let touchStartY = 0;
            let isSwipingBack = false;

            function handleTouchStart(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isSwipingBack = false;
            }

            function handleTouchMove(e) {
                if (touchStartX === 0) return;

                let touchCurrentX = e.touches[0].clientX;
                let touchCurrentY = e.touches[0].clientY;

                const deltaX = touchCurrentX - touchStartX;
                const deltaY = touchCurrentY - touchStartY;

                const isEdgeSwipe = touchStartX < 40;
                const isHorizontalScroller = e.target.closest('.actor-filmography-grid, .cast-scroller, .filmography-scroller, .stats-container, .seasons-scroller');

                if (isHorizontalScroller && !isEdgeSwipe) {
                    return;
                }

                if (deltaX > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (isEdgeSwipe) {
                        isSwipingBack = true;
                        if (e.cancelable) e.preventDefault();
                    }
                }
            }

            function handleTouchEnd(e) {
                if (isSwipingBack) {
                    const modal = e.currentTarget;
                    if (modal && (modal.classList.contains('modal') || modal.id === 'floatingMenu')) {
                        closeModal(modal);
                    }
                }
                touchStartX = 0;
                touchStartY = 0;
                isSwipingBack = false;
            }

            function setupBackGestureSupport() {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.id === 'confirmModal') return;
                    modal.addEventListener('touchstart', handleTouchStart, { passive: true });
                    modal.addEventListener('touchmove', handleTouchMove, { passive: false });
                    modal.addEventListener('touchend', handleTouchEnd, { passive: true });
                });
            }

            window.applyTextTruncation = function(containerId) {
                const textEl = document.getElementById(containerId);
                if (!textEl) return;
                const btn = textEl.nextElementSibling;
                if (!btn || !btn.classList.contains('read-more-btn')) return;

                // Osservatore che si attiva automaticamente ogni volta che il pannello viene aperto
                const observer = new ResizeObserver(() => {
                    // Se il testo è visibile e NON è già espanso
                    if (textEl.clientHeight > 0 && !textEl.classList.contains('expanded')) {
                        // Controlla se l'altezza reale (scrollHeight) è maggiore di quella visibile (clientHeight)
                        if (textEl.scrollHeight > textEl.clientHeight + 2) {
                            btn.style.display = 'inline-block';
                        } else {
                            btn.style.display = 'none';
                        }
                    }
                });
                
                observer.observe(textEl);
            };

            window.togglePlot = function(btn) {
                const textEl = btn.previousElementSibling;
                if (textEl.classList.contains('expanded')) {
                    textEl.classList.remove('expanded');
                    btn.textContent = "Leggi Tutto";
                    textEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    textEl.classList.add('expanded');
                    btn.textContent = "Mostra Meno";
                }
            };

            setupBackGestureSupport();

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Chiudi modale con ESC
                if (e.key === "Escape") {
                    const visibleModal = document.querySelector('.modal[style*="flex"]');
                    if (visibleModal) closeModal(visibleModal);
                }

                // Focus sulla ricerca con il tasto "/"
                if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                    e.preventDefault();
                    elements.searchInput.focus();
                }
            });

            // --- Update History Listeners (NOW CENTRALIZED IN SETTINGS) ---
            document.querySelectorAll('.stat-item').forEach(item => {
                item.addEventListener('click', () => {
                    openModal(document.getElementById('advancedStatsModal'));
                    renderAdvancedStats();
                });
            });

            document.getElementById('clearHistoryBtn').addEventListener('click', (e) => {
                // Evitiamo che il click si propaghi ad altri elementi sotto
                e.stopPropagation();

                // Apriamo il modale di conferma (grazie allo z-index 1300 apparirà SOPRA lo storico)
                showConfirmModal(
                    "Cancella Storico",
                    "Vuoi svuotare tutta la cronologia degli aggiornamenti?",
                    () => {
                        // Logica di cancellazione
                        updateHistory = [];
                        localStorage.removeItem('tvUpdateHistory');
                        if (currentUser) db.ref(`users/${currentUser.uid}/tvUpdateHistory`).remove();
                        renderUpdateHistory();
                        showNotification("Storico rimosso", "success");
                    }
                );
            });

            // --- Calendar Listeners ---
            document.getElementById('calendarBtn').addEventListener('click', () => {
                renderCalendar();
                openModal(document.getElementById('calendarModal'));
            });

            document.getElementById('bottomNavCalendar').addEventListener('click', () => {
                renderCalendar();
                openModal(document.getElementById('calendarModal'));
            });

            document.getElementById('calendarFilterToggle').addEventListener('change', (e) => {
                calendarOnlyInCorso = e.target.checked;
                renderCalendar(); // Ricarica la lista istantaneamente
            });
        }