document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (!root) return;

    // State
    let sidebarOpen = false;
    let activePage = 'home';

    function renderApp() {
        root.innerHTML = ''; // Clear previous content

        const appContainer = document.createElement('div');
        appContainer.className = 'min-h-screen bg-background relative overflow-x-hidden';

        const sidebar = renderSidebar(sidebarOpen, toggleSidebar, activePage, setActivePage);
        const mainContainer = document.createElement('div');
        mainContainer.className = 'w-full min-h-screen flex flex-col';

        const header = renderHeader();
        const mainContent = renderMainContent();

        mainContainer.appendChild(header);
        mainContainer.appendChild(mainContent);

        appContainer.appendChild(sidebar);
        appContainer.appendChild(mainContainer);

        root.appendChild(appContainer);

        // Add event listeners
        const toggleButton = document.getElementById('sidebar-toggle-btn');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleSidebar);
        }
    }

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        renderApp();
    }

    function setActivePage(page) {
        activePage = page;
        renderApp();
    }

    // Initial render
    renderApp();
});

function renderHeader() {
    const header = document.createElement('header');
    header.className = 'sticky top-0 bg-gradient-primary text-primary-foreground shadow-glow z-50 w-full transform-gpu';

    header.innerHTML = `
        <div class="relative w-full px-4 py-3 flex items-center justify-center lg:justify-between">
            <!-- Hamburger Menu - Mobile -->
            <div class="absolute left-4 top-1/2 -translate-y-1/2 lg:hidden">
                <button id="sidebar-toggle-btn" class="text-primary-foreground hover:bg-white/20 p-2 rounded">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            <!-- App Title -->
            <div class="flex items-center">
                <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
                    LearnFlow
                </h1>
            </div>

            <!-- Header Actions -->
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 lg:static lg:transform-none">
                <!-- Auth button placeholder -->
                <button class="text-primary-foreground hover:bg-white/20 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-white/20 text-xs sm:text-sm">
                    <div class="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <svg class="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <span class="hidden sm:inline">Sign In</span>
                </button>
                <button title="Visit Website" class="text-primary-foreground hover:bg-white/20 rounded-full p-1.5 sm:p-2" onclick="window.open('https://alexzo.vercel.app', '_blank')">
                     <svg class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </button>
            </div>
        </div>
    `;
    return header;
}

function renderMainContent() {
    const main = document.createElement('main');
    main.className = 'flex-1 w-full';
    main.innerHTML = `
        <div class="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
            <div id="page-content" class="w-full max-w-4xl mx-auto">
                <!-- Page content will be rendered here -->
            </div>
        </div>
    `;
    const pageContent = main.querySelector('#page-content');
    pageContent.appendChild(renderSubjectTabs('general', () => {}));
    pageContent.appendChild(renderQuestionInput(() => {}, false, false));
    return main;
}

function renderAdminNotificationPanel() {
    const panel = document.createElement('div');
    panel.className = 'space-y-6';
    panel.innerHTML = `
        <div class="border rounded-lg">
            <div class="p-6 text-center text-gray-500">
                Admin functionality will be implemented with Supabase authentication
            </div>
        </div>
    `;
    return panel;
}

function renderFeatureCards() {
    const features = [
        {
            icon: `<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5V3.935m-14 0A10.003 10.003 0 0112 2a10.003 10.003 0 017 1.935M5.5 18a2.5 2.5 0 002.5 2.5h8.5a2.5 2.5 0 002.5-2.5V17.5a2 2 0 00-2-2h-11a2 2 0 00-2 2v.5z"></path></svg>`,
            title: 'Multi-Subject',
            description: 'Covers a wide range of academic subjects.',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            icon: `<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m4 13-4-4L5 17m0 0h14M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>`,
            title: 'Language Support',
            description: 'Understands questions in English and supports multilingual input.',
            gradient: 'from-green-500 to-green-600'
        },
        {
            icon: `<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
            title: 'Image Analysis',
            description: 'Solve questions from uploaded images.',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            icon: `<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
            title: 'AI Powered',
            description: 'Advanced AI technology for accurate learning assistance.',
            gradient: 'from-orange-500 to-orange-600'
        },
    ];

    const container = document.createElement('div');
    container.className = 'w-full';

    let cardsHTML = '<div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">';

    features.forEach(feature => {
        cardsHTML += `
            <div class="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-0 shadow-soft w-full rounded-lg">
                <div class="p-4 sm:p-5 text-center">
                    <div class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r ${feature.gradient} mb-3 text-white group-hover:scale-110 transition-transform duration-300">
                        ${feature.icon}
                    </div>
                    <h3 class="font-semibold text-sm sm:text-base mb-2 text-foreground">
                        ${feature.title}
                    </h3>
                    <p class="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        ${feature.description}
                    </p>
                </div>
            </div>
        `;
    });

    cardsHTML += '</div>';
    container.innerHTML = cardsHTML;

    return container;
}

function renderYouTubeVideos(videos) {
    if (!videos || videos.length === 0) {
        return null;
    }

    const container = document.createElement('div');
    container.className = 'shadow-medium border-0 rounded-lg';

    let videosHTML = '';
    videos.forEach(video => {
        videosHTML += `
            <div data-video-id="${video.id}" class="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div class="relative">
                    <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-28 sm:h-36 lg:h-40 object-cover" loading="lazy">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="bg-red-600 rounded-full p-2 sm:p-3">
                            <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div class="absolute top-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        YouTube
                    </div>
                </div>
                <div class="p-2 sm:p-3">
                    <h4 class="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        ${video.title}
                    </h4>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="px-4 sm:px-6 py-4">
            <h3 class="flex items-center gap-2 text-foreground text-base sm:text-lg">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Related YouTube Videos
            </h3>
        </div>
        <div class="px-4 sm:px-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                ${videosHTML}
            </div>
        </div>
    `;

    const videoElements = container.querySelectorAll('[data-video-id]');
    videoElements.forEach(el => {
        el.addEventListener('click', () => {
            const videoId = el.dataset.videoId;
            const video = videos.find(v => v.id === videoId);
            if (video) {
                showVideoModal(video);
            }
        });
    });

    function showVideoModal(video) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4';
        modal.innerHTML = `
            <div class="bg-background rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
                <div class="flex justify-between items-center p-3 sm:p-4 border-b">
                    <h3 class="text-sm sm:text-lg font-semibold line-clamp-1 pr-2">${video.title}</h3>
                    <button id="close-modal-btn" class="flex-shrink-0 p-2">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="aspect-video">
                    <iframe src="${video.embed}?autoplay=1&rel=0&modestbranding=1" title="${video.title}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModalBtn = modal.querySelector('#close-modal-btn');
        closeModalBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    return container;
}

function renderVoiceRecorder(onSubmit, isLoading) {
    let isRecording = false;

    const container = document.createElement('div');
    container.className = 'flex items-center justify-center';

    container.innerHTML = `
        <button id="voice-recorder-btn" class="relative overflow-hidden transition-all duration-300 w-12 h-12 sm:w-14 sm:h-14 rounded-full border">
            <svg class="h-5 w-5 sm:h-6 sm:w-6 mx-auto my-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-14 0m7 7v3m0 0H9m3 0h3m-3-11a3 3 0 013-3V3a3 3 0 01-3 3z"></path></svg>
        </button>
        <div id="voice-recorder-status" class="ml-3 text-xs sm:text-sm text-muted-foreground"></div>
    `;

    const recordBtn = container.querySelector('#voice-recorder-btn');
    const statusDiv = container.querySelector('#voice-recorder-status');

    recordBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        if (isRecording) {
            recordBtn.classList.add('animate-pulse', 'shadow-lg', 'bg-red-500', 'text-white');
            statusDiv.textContent = 'Recording... Tap to stop';
        } else {
            recordBtn.classList.remove('animate-pulse', 'shadow-lg', 'bg-red-500', 'text-white');
            statusDiv.textContent = 'Processing speech...';
            // Placeholder for speech processing
            setTimeout(() => {
                onSubmit("Voice input placeholder");
                statusDiv.textContent = '';
            }, 1000);
        }
    });

    return container;
}

function renderSubjectTabs(activeSubject, onSubjectChange) {
    const subjects = [
        { id: 'general', label: 'General', emoji: '🌐' },
        { id: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
        { id: 'english', label: 'English', emoji: '🇬🇧' },
        { id: 'math', label: 'Math', emoji: '🔢' },
        { id: 'physics', label: 'Physics', emoji: '⚛️' },
        { id: 'chemistry', label: 'Chemistry', emoji: '🧪' },
        { id: 'biology', label: 'Biology', emoji: '🧬' },
    ];

    const container = document.createElement('div');
    container.className = 'flex overflow-x-auto gap-2 sm:gap-3 pb-2 mb-4 sm:mb-6 border-b border-border scrollbar-hide';

    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.className = `flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md ${activeSubject === subject.id ? 'bg-secondary text-secondary-foreground shadow-soft' : ''}`;
        button.innerHTML = `<span class="mr-1 sm:mr-2 text-sm">${subject.emoji}</span> ${subject.label}`;
        button.addEventListener('click', () => onSubjectChange(subject.id));
        container.appendChild(button);
    });

    return container;
}

function renderSidebar(isOpen, onToggle, activePage, onPageChange) {
    const navigationItems = [
        { id: 'home', label: 'Home (Q&A)', icon: '<svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v11.494m-9-5.494h18M12 3a9 9 0 11-9 9 10.36 10.36 0 01.31-2.313M12 3c3.41 0 6.44.91 8.69 2.478.43.25.75.75.75 1.293v1.498a1 1 0 01-1 1h-1.37a1.14 1.14 0 00-1.14 1.14V12a1.14 1.14 0 001.14 1.14h1.37a1 1 0 011 1v1.498c0 .543-.32 1.043-.75 1.293A9.001 9.001 0 0112 21c-4.97 0-9-4.03-9-9 0-1.242.25-2.427.7-3.522"></path></svg>' },
        { id: 'about', label: 'About LearnFlow', icon: '<svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
        { id: 'terms', label: 'Terms & Conditions', icon: '<svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
        { id: 'privacy', label: 'Privacy Policy', icon: '<svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>' },
        { id: 'disclaimer', label: 'Disclaimer', icon: '<svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' },
    ];

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = `fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-300 ease-in-out shadow-2xl lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;

    let navItemsHTML = '';
    navigationItems.forEach(item => {
        navItemsHTML += `
            <li key="${item.id}">
                <button data-page="${item.id}" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors p-2 flex items-center rounded-md ${activePage === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''}">
                    ${item.icon}
                    ${item.label}
                </button>
            </li>
        `;
    });

    sidebar.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="p-6 border-b border-sidebar-border/20">
                <h2 class="text-xl font-bold text-sidebar-foreground text-center">
                    LearnFlow Menu
                </h2>
            </div>
            <nav class="flex-1 p-4">
                <ul class="space-y-2">
                    ${navItemsHTML}
                </ul>
            </nav>
            <div class="p-6 border-t border-sidebar-border/20">
                <div class="text-center text-sidebar-foreground/70 text-sm">
                    <p>© ${new Date().getFullYear()} LearnFlow</p>
                    <p class="text-xs mt-1 opacity-80">Powered by Alexzo</p>
                </div>
            </div>
        </div>
    `;

    const navButtons = sidebar.querySelectorAll('button[data-page]');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            onPageChange(button.dataset.page);
            if (window.innerWidth < 1024) {
                onToggle();
            }
        });
    });

    return sidebar;
}

function renderResultCard(isLoading, result, error, sources) {
    if (isLoading) {
        return null;
    }

    const container = document.createElement('div');
    container.className = 'shadow-medium border-0 rounded-lg';

    if (error) {
        container.classList.add('border-l-4', 'border-l-destructive');
        container.innerHTML = `
            <div class="p-4 sm:p-6">
                <div class="flex items-start space-x-2 sm:space-x-3">
                    <div class="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                        <span class="text-destructive text-xs sm:text-sm">!</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-destructive mb-2 text-sm sm:text-base">Error</h3>
                        <p class="text-xs sm:text-sm text-muted-foreground">${error}</p>
                    </div>
                </div>
            </div>
        `;
        return container;
    }

    if (result) {
        container.innerHTML = `
            <div class="pb-4 px-4 sm:px-6">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center space-x-2 sm:space-x-3">
                        <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                            <svg class="h-4 w-4 sm:h-6 sm:w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        </div>
                        <h3 class="text-lg sm:text-xl font-semibold text-foreground">
                            AI Response
                        </h3>
                    </div>
                    <div class="flex gap-2">
                        <button id="copy-btn" class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border">Copy</button>
                        <button id="listen-btn" class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border">Listen</button>
                    </div>
                </div>
            </div>
            <div class="pt-0 px-4 sm:px-6">
                <div class="prose prose-gray max-w-none dark:prose-invert prose-sm sm:prose-base text-foreground leading-relaxed">
                    ${result}
                </div>
            </div>
        `;

        const copyBtn = container.querySelector('#copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(result);
        });

        return container;
    }

    return null;
}

function renderRequestLimitBanner(remainingRequests, isLimitReached, onShowAuth) {
    if (!isLimitReached && remainingRequests > 2) {
        return null;
    }

    const container = document.createElement('div');
    container.className = 'mb-4 p-4 border rounded-md flex items-center justify-between';

    let icon, text, buttonText, variantClasses;

    if (isLimitReached) {
        icon = `<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>`;
        text = 'Daily limit reached. Sign in to continue using LearnFlow.';
        buttonText = 'Sign In';
        variantClasses = 'border-red-500 bg-red-500/10 text-red-700';
    } else {
        icon = `<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        text = `${remainingRequests} requests remaining today. Sign in for unlimited access.`;
        buttonText = 'Sign In';
        variantClasses = 'border-yellow-500 bg-yellow-500/10 text-yellow-700';
    }

    container.className += ` ${variantClasses}`;

    container.innerHTML = `
        <div class="flex items-center">
            ${icon}
            <span>${text}</span>
        </div>
        <button id="auth-btn" class="px-3 py-1.5 text-sm rounded-md border border-current">${buttonText}</button>
    `;

    const authBtn = container.querySelector('#auth-btn');
    authBtn.addEventListener('click', onShowAuth);

    return container;
}

function renderQuestionInput(onSubmit, isLoading, disabled) {
    const container = document.createElement('div');
    container.className = 'p-4 sm:p-6 bg-gradient-surface shadow-soft rounded-lg';

    container.innerHTML = `
        <div class="flex gap-1 sm:gap-2 mb-4">
            <button id="mode-text" class="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border bg-primary text-primary-foreground">Text</button>
            <button id="mode-voice" class="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border">Voice</button>
            <button id="mode-image" class="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border">Image</button>
            <button id="mode-link" class="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md border">Link</button>
        </div>
        <div id="input-container">
            <div class="relative">
                <textarea id="question-textarea" placeholder="Ask LearnFlow anything..." class="min-h-[100px] sm:min-h-[120px] w-full resize-none text-sm sm:text-base border-2 rounded-md p-2 pr-12"></textarea>
                <button title="Attach file" class="absolute bottom-2 right-2 h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>
            </div>
        </div>
        <button id="submit-btn" class="w-full mt-4 sm:mt-6 h-12 text-base font-semibold rounded-md bg-blue-600 text-white">Get Answer</button>
    `;

    const textarea = container.querySelector('#question-textarea');
    const submitBtn = container.querySelector('#submit-btn');

    textarea.addEventListener('input', (e) => {
        submitBtn.disabled = !e.target.value.trim();
    });

    submitBtn.addEventListener('click', () => {
        onSubmit(textarea.value.trim());
        textarea.value = '';
    });

    return container;
}

function renderProfileMenu(user, onLogout) {
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayNameToShow = user?.displayName || user?.email?.split('@')[0] || 'User';

    const container = document.createElement('div');
    container.className = 'relative';

    container.innerHTML = `
        <button id="profile-menu-trigger" class="h-10 w-10 rounded-full p-0 bg-primary text-primary-foreground flex items-center justify-center">
            ${getInitials(displayNameToShow)}
        </button>
        <div id="profile-menu-content" class="hidden absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div class="px-3 py-2">
                <p class="text-sm font-semibold text-gray-800 truncate">${displayNameToShow}</p>
                <p class="text-xs text-gray-500 truncate">${user?.email}</p>
            </div>
            <hr class="border-gray-200" />
            <a href="#" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Change Password
            </a>
            <hr class="border-gray-200" />
            <a href="#" id="logout-btn" class="block px-3 py-2 text-sm text-red-600 hover:bg-gray-100">
                Logout
            </a>
        </div>
    `;

    const trigger = container.querySelector('#profile-menu-trigger');
    const content = container.querySelector('#profile-menu-content');
    const logoutBtn = container.querySelector('#logout-btn');

    trigger.addEventListener('click', () => {
        content.classList.toggle('hidden');
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onLogout();
        content.classList.add('hidden');
    });

    // Close the dropdown if the user clicks outside of it
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) {
            content.classList.add('hidden');
        }
    });

    return container;
}
