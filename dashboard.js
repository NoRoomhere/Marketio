// Dashboard JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    loadUserData();
});

// Check if user is authenticated
function checkAuth() {
    if (typeof firebase === 'undefined') {
        window.location.href = 'login.html';
        return;
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            // User is not logged in, redirect to login
            window.location.href = 'login.html';
        } else {
            // User is logged in, load dashboard
            loadUserData();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await firebase.auth().signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Помилка виходу. Спробуйте ще раз.');
            }
        });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Save profile button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }

    // Create ad form
    const createAdForm = document.getElementById('createAdForm');
    if (createAdForm) {
        createAdForm.addEventListener('submit', createAd);
    }
}

// Load user data
async function loadUserData() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userType = localStorage.getItem('userType') || 'user';
    
    // Update header
    const userEmailEl = document.getElementById('userEmail');
    const userNameEl = document.getElementById('userName');
    const userTypeDisplayEl = document.getElementById('userTypeDisplay');
    
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (userNameEl) {
        userNameEl.textContent = user.displayName || user.email.split('@')[0];
    }
    if (userTypeDisplayEl) {
        userTypeDisplayEl.textContent = userType === 'business' ? 'Бізнес' : 'Блогер';
    }

    // Show appropriate navigation
    if (userType === 'business') {
        document.getElementById('businessNav').style.display = 'block';
        document.getElementById('businessProfile').style.display = 'block';
        loadBusinessProfile();
    } else {
        document.getElementById('bloggerNav').style.display = 'block';
        document.getElementById('bloggerProfile').style.display = 'block';
        loadBloggerProfile();
    }

    // Load section-specific data
    loadSectionData();
}

// Load business profile
function loadBusinessProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Load from localStorage (in real app, load from Firestore)
    const businessName = localStorage.getItem('businessName') || '';
    const phone = localStorage.getItem('phone') || '';
    const description = localStorage.getItem('businessDescription') || '';

    document.getElementById('businessNameInput').value = businessName;
    document.getElementById('businessEmailInput').value = user.email;
    document.getElementById('businessPhoneInput').value = phone;
    document.getElementById('businessDescriptionInput').value = description;
}

// Load blogger profile
function loadBloggerProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Load from localStorage (in real app, load from Firestore)
    const name = localStorage.getItem('bloggerName') || '';
    const phone = localStorage.getItem('phone') || '';
    const socialMedia = localStorage.getItem('socialMedia') || '';
    const bio = localStorage.getItem('bio') || '';

    document.getElementById('bloggerNameInput').value = name;
    document.getElementById('bloggerEmailInput').value = user.email;
    document.getElementById('bloggerPhoneInput').value = phone;
    document.getElementById('bloggerSocialInput').value = socialMedia;
    document.getElementById('bloggerBioInput').value = bio;
}

// Save profile
async function saveProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userType = localStorage.getItem('userType');
    const saveBtn = document.getElementById('saveProfileBtn');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Збереження...';

    try {
        if (userType === 'business') {
            const businessName = document.getElementById('businessNameInput').value;
            const phone = document.getElementById('businessPhoneInput').value;
            const description = document.getElementById('businessDescriptionInput').value;

            // Update display name
            await user.updateProfile({
                displayName: businessName
            });

            // Save to localStorage (in real app, save to Firestore)
            localStorage.setItem('businessName', businessName);
            localStorage.setItem('phone', phone);
            localStorage.setItem('businessDescription', description);
        } else {
            const name = document.getElementById('bloggerNameInput').value;
            const phone = document.getElementById('bloggerPhoneInput').value;
            const socialMedia = document.getElementById('bloggerSocialInput').value;
            const bio = document.getElementById('bloggerBioInput').value;

            // Update display name
            await user.updateProfile({
                displayName: name
            });

            // Save to localStorage (in real app, save to Firestore)
            localStorage.setItem('bloggerName', name);
            localStorage.setItem('phone', phone);
            localStorage.setItem('socialMedia', socialMedia);
            localStorage.setItem('bio', bio);
        }

        // Update UI
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.displayName || user.email.split('@')[0];
        }

        alert('Профіль успішно збережено!');
    } catch (error) {
        console.error('Save profile error:', error);
        alert('Помилка збереження профілю. Спробуйте ще раз.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Зберегти зміни';
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to nav item
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Load section data
    loadSectionData(sectionName);
}

// Load section-specific data
function loadSectionData(sectionName) {
    const currentSection = document.querySelector('.dashboard-section.active');
    if (!currentSection) return;

    const sectionId = currentSection.id;

    if (sectionId === 'ads-section') {
        loadAds();
    } else if (sectionId === 'applications-section') {
        loadApplications();
    } else if (sectionId === 'projects-section') {
        loadBusinessProjects();
    } else if (sectionId === 'projects-list-section') {
        loadAvailableProjects();
    } else if (sectionId === 'my-applications-section') {
        loadMyApplications();
    } else if (sectionId === 'my-projects-section') {
        loadMyProjects();
    } else if (sectionId === 'portfolio-section') {
        loadPortfolio();
    } else if (sectionId === 'messages-section') {
        loadChatConversations();
    }
}

// Skills management
let skills = [];

document.addEventListener('DOMContentLoaded', function() {
    const skillInput = document.getElementById('skillInput');
    if (skillInput) {
        skillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const skill = this.value.trim();
                if (skill && !skills.includes(skill)) {
                    skills.push(skill);
                    updateSkillsList();
                    this.value = '';
                }
            }
        });
    }

    // Project type change handler
    const projectType = document.getElementById('projectType');
    const budgetLabel = document.getElementById('budgetLabel');
    const budgetHint = document.getElementById('budgetHint');
    
    if (projectType) {
        projectType.addEventListener('change', function() {
            if (this.value === 'hourly') {
                if (budgetLabel) budgetLabel.textContent = 'Ставка за годину (грн) *';
                if (budgetHint) budgetHint.textContent = 'Скільки ви готові платити за годину роботи';
            } else {
                if (budgetLabel) budgetLabel.textContent = 'Бюджет проекту (грн) *';
                if (budgetHint) budgetHint.textContent = 'Вкажіть максимальну суму, яку ви готові заплатити';
            }
        });
    }

    // Proposal form
    const proposalForm = document.getElementById('proposalForm');
    if (proposalForm) {
        proposalForm.addEventListener('submit', submitProposal);
    }

    // Deliver work form
    const deliverWorkForm = document.getElementById('deliverWorkForm');
    if (deliverWorkForm) {
        deliverWorkForm.addEventListener('submit', deliverWork);
    }
});

function updateSkillsList() {
    const skillsList = document.getElementById('skillsList');
    if (!skillsList) return;
    
    skillsList.innerHTML = skills.map((skill, index) => `
        <span class="skill-tag">
            ${skill}
            <button onclick="removeSkill(${index})" type="button">&times;</button>
        </span>
    `).join('');
}

function removeSkill(index) {
    skills.splice(index, 1);
    updateSkillsList();
}

// Create ad (job posting)
function createAd(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const title = document.getElementById('adTitle').value;
    const category = document.getElementById('adCategory').value;
    const projectType = document.getElementById('projectType').value;
    const description = document.getElementById('adDescription').value;
    const budget = document.getElementById('adBudget').value;
    const deadline = document.getElementById('adDeadline').value;
    const requirements = document.getElementById('adRequirements').value;
    
    const contentType = [];
    document.querySelectorAll('input[name="contentType"]:checked').forEach(cb => {
        contentType.push(cb.value);
    });

    if (skills.length === 0) {
        alert('Додайте хоча б одну навичку або вимогу');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Публікація...';

    // Save ad (in real app, save to Firestore)
    const ad = {
        id: Date.now().toString(),
        title,
        category,
        projectType,
        description,
        budget: parseInt(budget),
        deadline: parseInt(deadline),
        requirements,
        contentType,
        skills: [...skills],
        createdAt: new Date().toISOString(),
        status: 'active', // Explicitly set status to 'active'
        businessEmail: firebase.auth().currentUser.email,
        businessName: firebase.auth().currentUser.displayName || 'Бізнес',
        businessId: firebase.auth().currentUser.uid
    };

    // Load existing ads
    let ads = [];
    try {
        const adsStr = localStorage.getItem('ads');
        if (adsStr) {
            ads = JSON.parse(adsStr);
        }
    } catch (e) {
        console.error('Error parsing ads from localStorage:', e);
        ads = [];
    }
    
    // Add new ad
    ads.push(ad);
    
    // Save to localStorage
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
        console.log('Ad saved successfully:', ad);
        console.log('Total ads in storage:', ads.length);
    } catch (e) {
        console.error('Error saving ad to localStorage:', e);
        alert('Помилка збереження проекту. Спробуйте ще раз.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Опублікувати проект';
        return;
    }

    // Reset form
    form.reset();
    skills = [];
    updateSkillsList();
    
    // Show success message
    alert('Проект успішно опубліковано!');
    
    // Switch to ads section
    showSection('ads');
    
    // Reload ads to show the new one
    loadAds();
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Опублікувати проект';
}

// Load ads
function loadAds() {
    const adsList = document.getElementById('adsList');
    if (!adsList) return;

    const user = firebase.auth().currentUser;
    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    const myAds = ads.filter(ad => ad.businessEmail === user.email);
    
    if (myAds.length === 0) {
        adsList.innerHTML = '<p class="empty-state">У вас поки немає оголошень. Створіть перше оголошення!</p>';
        return;
    }

    adsList.innerHTML = myAds.map(ad => {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]')
            .filter(app => app.adId === ad.id);
        const applicationsCount = applications.length;
        
        return `
            <div class="ad-card">
                <span class="category">${getCategoryName(ad.category)}</span>
                <h3>${ad.title}</h3>
                <div class="budget">${ad.budget} грн</div>
                <p class="description">${ad.description.length > 150 ? ad.description.substring(0, 150) + '...' : ad.description}</p>
                <div style="margin: 1rem 0; color: var(--gray); font-size: 0.9rem;">
                    📊 Заявок: ${applicationsCount} | 
                    📅 ${new Date(ad.createdAt).toLocaleDateString('uk-UA')} |
                    ${ad.status === 'active' ? '✅ Активне' : '❌ Неактивне'}
                </div>
                <div class="actions">
                    <button class="btn btn-primary btn-small" onclick="viewAdApplications('${ad.id}')">Заявки (${applicationsCount})</button>
                    ${ad.status === 'active' ? `<button class="btn btn-secondary btn-small" onclick="closeAd('${ad.id}')">Закрити</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Close ad
function closeAd(adId) {
    if (!confirm('Закрити це оголошення? Воно більше не буде відображатися блогерам.')) return;
    
    let ads = JSON.parse(localStorage.getItem('ads') || '[]');
    const ad = ads.find(a => a.id === adId);
    
    if (ad) {
        ad.status = 'closed';
        localStorage.setItem('ads', JSON.stringify(ads));
        loadAds();
    }
}

// View ad applications
function viewAdApplications(adId) {
    showSection('applications');
    // Filter by adId if needed
    setTimeout(() => {
        loadApplications();
    }, 100);
}

// Load applications
function loadApplications() {
    const applicationsList = document.getElementById('applicationsList');
    if (!applicationsList) return;

    const user = firebase.auth().currentUser;
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    
    // Filter applications for current business
    const myAds = ads.filter(ad => ad.businessEmail === user.email).map(ad => ad.id);
    const myApplications = applications.filter(app => myAds.includes(app.adId));
    
    if (myApplications.length === 0) {
        applicationsList.innerHTML = '<p class="empty-state">Поки немає заявок від блогерів</p>';
        return;
    }

    applicationsList.innerHTML = myApplications.map(app => `
        <div class="application-card-enhanced">
            <div class="application-header">
                <div class="application-blogger">
                    <div class="application-blogger-info">
                        <h4>${app.bloggerName}</h4>
                        <p>${app.bloggerEmail}</p>
                    </div>
                </div>
                <div class="application-price">
                    <div class="price">${app.price} грн</div>
                    <div class="deadline">Термін: ${app.deadline} днів</div>
                </div>
            </div>
            <div class="application-message">
                <strong>Проект:</strong> ${app.projectTitle}<br><br>
                <strong>Пропозиція:</strong><br>
                ${app.message}
            </div>
            ${app.portfolio ? `<p><strong>Портфоліо:</strong> <a href="${app.portfolio}" target="_blank">${app.portfolio}</a></p>` : ''}
            <div class="application-actions">
                <button class="btn btn-primary btn-small" onclick="viewApplication('${app.id}')">Деталі</button>
                <button class="btn btn-success btn-small" onclick="acceptApplication('${app.id}')">Прийняти</button>
                <button class="btn btn-secondary btn-small" onclick="rejectApplication('${app.id}')">Відхилити</button>
                <button class="btn btn-secondary btn-small" onclick="openChatFromApplication('${app.bloggerEmail}', '${app.bloggerName}', '${app.adId}')">
                    💬 Чат
                </button>
            </div>
        </div>
    `).join('');
}

// View application details
function viewApplication(appId) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications.find(a => a.id === appId);
    
    if (!app) return;

    const modal = document.getElementById('projectDetailsModal');
    const content = document.getElementById('projectDetailsContent');
    
    if (content) {
        content.innerHTML = `
            <h2>Заявка від ${app.bloggerName}</h2>
            <div class="project-details">
                <div class="detail-item">
                    <div class="detail-label">Проект</div>
                    <div class="detail-value">${app.projectTitle}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Пропозиція</div>
                    <div class="detail-value">${app.message}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div class="detail-label">Ціна</div>
                            <div class="detail-value" style="font-size: 1.5rem; color: var(--primary-color); font-weight: 700;">${app.price} грн</div>
                        </div>
                        <div>
                            <div class="detail-label">Термін виконання</div>
                            <div class="detail-value">${app.deadline} днів</div>
                        </div>
                    </div>
                </div>
                ${app.portfolio ? `
                <div class="detail-item">
                    <div class="detail-label">Портфоліо</div>
                    <div class="detail-value"><a href="${app.portfolio}" target="_blank">${app.portfolio}</a></div>
                </div>
                ` : ''}
                <div class="detail-item">
                    <div class="detail-label">Статус</div>
                    <div class="detail-value"><span class="status ${app.status}">${getStatusName(app.status)}</span></div>
                </div>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Load available projects (for bloggers)
function loadAvailableProjects() {
    const projectsList = document.getElementById('availableProjectsList');
    if (!projectsList) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        projectsList.innerHTML = '<p class="empty-state">Потрібно увійти в систему</p>';
        return;
    }

    // Load all ads from localStorage
    const adsStr = localStorage.getItem('ads');
    const ads = adsStr ? JSON.parse(adsStr) : [];
    
    // Debug: log ads
    console.log('All ads:', ads);
    
    // Filter only active ads
    const activeAds = ads.filter(ad => {
        // If status is undefined or null, treat as active (for backward compatibility)
        return !ad.status || ad.status === 'active';
    });
    
    console.log('Active ads:', activeAds);
    
    // Load applications to filter out already applied
    const applicationsStr = localStorage.getItem('applications');
    const applications = applicationsStr ? JSON.parse(applicationsStr) : [];
    
    // Filter out ads where user already applied
    const appliedAdIds = applications
        .filter(app => app.bloggerEmail === user.email)
        .map(app => app.adId);
    
    console.log('Applied ad IDs:', appliedAdIds);
    
    const availableAds = activeAds.filter(ad => !appliedAdIds.includes(ad.id));
    
    console.log('Available ads for blogger:', availableAds);
    
    if (availableAds.length === 0) {
        if (ads.length === 0) {
            projectsList.innerHTML = '<p class="empty-state">Поки немає доступних проектів. Створіть проект як бізнес!</p>';
        } else if (activeAds.length === 0) {
            projectsList.innerHTML = '<p class="empty-state">Немає активних проектів</p>';
        } else {
            projectsList.innerHTML = '<p class="empty-state">Ви вже подали заявки на всі доступні проекти</p>';
        }
        return;
    }

    projectsList.innerHTML = availableAds.map(ad => `
        <div class="project-card-enhanced">
            <div class="project-header">
                <div class="project-info">
                    <span class="category">${getCategoryName(ad.category)}</span>
                    <h3>${ad.title}</h3>
                    <div class="project-meta">
                        <span>💰 ${ad.budget} грн</span>
                        <span>⏱️ ${ad.deadline} днів</span>
                        <span>📅 ${new Date(ad.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                </div>
            </div>
            <p class="description" style="margin: 1rem 0; color: var(--gray); line-height: 1.6;">
                ${ad.description.length > 200 ? ad.description.substring(0, 200) + '...' : ad.description}
            </p>
            ${ad.skills && ad.skills.length > 0 ? `
                <div class="skills-display" style="margin: 1rem 0;">
                    ${ad.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                </div>
            ` : ''}
            <div class="project-actions">
                <button class="btn btn-primary" onclick="viewProjectDetails('${ad.id}')">Деталі</button>
                <button class="btn btn-success" onclick="applyToProject('${ad.id}')">Подати заявку</button>
            </div>
        </div>
    `).join('');
}

// View project details
function viewProjectDetails(adId) {
    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    const ad = ads.find(a => a.id === adId);
    
    if (!ad) return;

    const modal = document.getElementById('projectDetailsModal');
    const content = document.getElementById('projectDetailsContent');
    
    if (content) {
        content.innerHTML = `
            <h2>${ad.title}</h2>
            <div class="project-details">
                <div class="detail-item">
                    <div class="detail-label">Категорія</div>
                    <div class="detail-value">${getCategoryName(ad.category)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Опис проекту</div>
                    <div class="detail-value">${ad.description}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div class="detail-label">Бюджет</div>
                            <div class="detail-value" style="font-size: 1.5rem; color: var(--primary-color); font-weight: 700;">${ad.budget} грн</div>
                        </div>
                        <div>
                            <div class="detail-label">Термін виконання</div>
                            <div class="detail-value">${ad.deadline} днів</div>
                        </div>
                    </div>
                </div>
                ${ad.skills && ad.skills.length > 0 ? `
                <div class="detail-item">
                    <div class="detail-label">Навички/Вимоги</div>
                    <div class="skills-display">
                        ${ad.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                ${ad.contentType && ad.contentType.length > 0 ? `
                <div class="detail-item">
                    <div class="detail-label">Формат контенту</div>
                    <div class="detail-value">${ad.contentType.join(', ')}</div>
                </div>
                ` : ''}
                ${ad.requirements ? `
                <div class="detail-item">
                    <div class="detail-label">Додаткові вимоги</div>
                    <div class="detail-value">${ad.requirements}</div>
                </div>
                ` : ''}
            </div>
            <div style="margin-top: 2rem;">
                <button class="btn btn-primary btn-large" onclick="closeModal('projectDetailsModal'); applyToProject('${ad.id}');">Подати заявку</button>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Load my applications (for bloggers)
function loadMyApplications() {
    const applicationsList = document.getElementById('myApplicationsList');
    if (!applicationsList) return;

    const user = firebase.auth().currentUser;
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const myApplications = applications.filter(app => app.bloggerEmail === user.email);
    
    if (myApplications.length === 0) {
        applicationsList.innerHTML = '<p class="empty-state">Ви ще не подали жодної заявки</p>';
        return;
    }

    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    
    applicationsList.innerHTML = myApplications.map(app => {
        const ad = ads.find(a => a.id === app.adId);
        const businessEmail = ad ? ad.businessEmail : '';
        const businessName = ad ? ad.businessName : 'Клієнт';
        
        return `
            <div class="application-card-enhanced">
                <div class="application-header">
                    <div class="application-blogger">
                        <div class="application-blogger-info">
                            <h4>${app.projectTitle}</h4>
                            <p>${businessName}</p>
                        </div>
                    </div>
                    <span class="status ${app.status}">${getStatusName(app.status)}</span>
                </div>
                <div class="application-message">
                    <strong>Ваша пропозиція:</strong><br>
                    ${app.message}
                </div>
                <div class="application-actions">
                    <button class="btn btn-primary btn-small" onclick="viewApplication('${app.id}')">Деталі</button>
                    ${businessEmail ? `<button class="btn btn-secondary btn-small" onclick="openChatFromApplication('${businessEmail}', '${businessName}', '${app.adId}')">💬 Чат з клієнтом</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Load business projects
function loadBusinessProjects() {
    const projectsList = document.getElementById('businessProjectsList');
    if (!projectsList) return;

    const user = firebase.auth().currentUser;
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const myProjects = projects.filter(p => p.businessEmail === user.email);
    
    if (myProjects.length === 0) {
        projectsList.innerHTML = '<p class="empty-state">У вас поки немає активних проектів</p>';
        return;
    }

    projectsList.innerHTML = myProjects.map(project => {
        const deliverables = JSON.parse(localStorage.getItem('deliverables') || '[]')
            .filter(d => d.projectId === project.id);
        
        return `
            <div class="project-card-enhanced">
                <div class="project-header">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <div class="project-meta">
                            <span>👤 ${project.bloggerName}</span>
                            <span>📅 ${new Date(project.createdAt).toLocaleDateString('uk-UA')}</span>
                        </div>
                    </div>
                    <span class="project-status-badge status ${project.status}">${getStatusName(project.status)}</span>
                </div>
                ${project.status === 'review' && deliverables.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Здані роботи:</strong>
                        ${deliverables.map(d => `
                            <div class="deliverable-item" style="margin-top: 0.5rem;">
                                <h4>${d.description}</h4>
                                <a href="${d.link}" target="_blank" class="deliverable-link">${d.link}</a>
                                ${d.notes ? `<p style="margin-top: 0.5rem; color: var(--gray);">${d.notes}</p>` : ''}
                                <div class="deliverable-date">${new Date(d.createdAt).toLocaleDateString('uk-UA')}</div>
                            </div>
                        `).join('')}
                        <div class="project-actions" style="margin-top: 1rem;">
                            <button class="btn btn-success" onclick="approveWork('${project.id}')">Прийняти роботу</button>
                            <button class="btn btn-warning" onclick="requestRevision('${project.id}')">Запросити доопрацювання</button>
                            <button class="btn btn-secondary" onclick="openChatFromProject('${project.bloggerEmail}', '${project.bloggerName}', '${project.id}')">
                                💬 Чат з блогером
                            </button>
                        </div>
                    </div>
                ` : ''}
                ${project.status === 'in-progress' ? `
                    <div style="margin-top: 1rem;">
                        <p style="color: var(--gray); margin-bottom: 0.5rem;">Очікуємо здачі роботи від блогера</p>
                        <button class="btn btn-secondary btn-small" onclick="openChatFromProject('${project.bloggerEmail}', '${project.bloggerName}', '${project.id}')">
                            💬 Чат з блогером
                        </button>
                    </div>
                ` : ''}
                ${project.status === 'completed' ? `
                    <p style="margin-top: 1rem; color: var(--gray);">✅ Проект завершено</p>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Approve work
function approveWork(projectId) {
    if (!confirm('Підтвердити прийняття роботи? Після цього проект буде завершено.')) return;

    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        project.status = 'completed';
        project.completedAt = new Date().toISOString();
        localStorage.setItem('projects', JSON.stringify(projects));
        loadBusinessProjects();
        alert('Роботу прийнято! Проект завершено.');
    }
}

// Request revision
function requestRevision(projectId) {
    const message = prompt('Опишіть, що потрібно доопрацювати:');
    if (!message) return;

    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        project.status = 'in-progress';
        project.revisionRequest = message;
        localStorage.setItem('projects', JSON.stringify(projects));
        loadBusinessProjects();
        alert('Запит на доопрацювання відправлено блогеру.');
    }
}

// Load my projects (for bloggers)
function loadMyProjects(filterStatus = 'all') {
    const projectsList = document.getElementById('myProjectsList');
    if (!projectsList) return;

    const user = firebase.auth().currentUser;
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    let myProjects = projects.filter(p => p.bloggerEmail === user.email);
    
    if (filterStatus !== 'all') {
        myProjects = myProjects.filter(p => p.status === filterStatus);
    }
    
    if (myProjects.length === 0) {
        projectsList.innerHTML = '<p class="empty-state">У вас поки немає активних проектів</p>';
        return;
    }

    projectsList.innerHTML = myProjects.map(project => {
        const deliverables = JSON.parse(localStorage.getItem('deliverables') || '[]')
            .filter(d => d.projectId === project.id);
        
        return `
            <div class="project-card-enhanced">
                <div class="project-header">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <div class="project-meta">
                            <span>👤 ${project.businessName}</span>
                            <span>📅 ${new Date(project.createdAt).toLocaleDateString('uk-UA')}</span>
                        </div>
                    </div>
                    <span class="project-status-badge status ${project.status}">${getStatusName(project.status)}</span>
                </div>
                ${project.status === 'in-progress' ? `
                    <div class="project-actions">
                        <button class="btn btn-primary" onclick="openDeliverWorkModal('${project.id}')">Здати роботу</button>
                        ${project.adId ? `<button class="btn btn-secondary" onclick="viewProjectDetails('${project.adId}')">Деталі проекту</button>` : ''}
                        <button class="btn btn-secondary" onclick="openChatFromProject('${project.businessEmail}', '${project.businessName}', '${project.id}')">
                            💬 Чат з клієнтом
                        </button>
                    </div>
                ` : ''}
                ${project.status === 'review' ? `
                    <p style="margin-top: 1rem; color: var(--gray);">Робота на перевірці у клієнта</p>
                ` : ''}
                ${project.status === 'completed' ? `
                    <p style="margin-top: 1rem; color: var(--gray);">✅ Проект завершено</p>
                ` : ''}
                ${deliverables.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Здані роботи:</strong>
                        ${deliverables.map(d => `
                            <div class="deliverable-item" style="margin-top: 0.5rem;">
                                <a href="${d.link}" target="_blank" class="deliverable-link">${d.link}</a>
                                <div class="deliverable-date">${new Date(d.createdAt).toLocaleDateString('uk-UA')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Filter my projects
function filterMyProjects(status) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadMyProjects(status);
}

// Open deliver work modal
function openDeliverWorkModal(projectId) {
    const modal = document.getElementById('deliverWorkModal');
    const projectIdInput = document.getElementById('deliverProjectId');
    
    if (projectIdInput) projectIdInput.value = projectId;
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Submit deliver work
function deliverWork(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const projectId = document.getElementById('deliverProjectId').value;
    const description = document.getElementById('deliverDescription').value;
    const link = document.getElementById('deliverLink').value;
    const notes = document.getElementById('deliverNotes').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Здавання...';

    const deliverable = {
        id: Date.now().toString(),
        projectId,
        description,
        link,
        notes: notes || null,
        createdAt: new Date().toISOString()
    };

    let deliverables = JSON.parse(localStorage.getItem('deliverables') || '[]');
    deliverables.push(deliverable);
    localStorage.setItem('deliverables', JSON.stringify(deliverables));

    // Update project status
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.status = 'review';
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    closeModal('deliverWorkModal');
    form.reset();
    alert('Роботу здано! Очікуйте перевірки від клієнта.');
    loadMyProjects();
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Здати роботу';
}

// Load portfolio
function loadPortfolio() {
    const portfolioItems = document.getElementById('portfolioItems');
    if (!portfolioItems) return;

    const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
    
    if (portfolio.length === 0) {
        portfolioItems.innerHTML = '<p class="empty-state">Додайте приклади ваших робіт</p>';
        return;
    }

    portfolioItems.innerHTML = portfolio.map((item, index) => `
        <div class="portfolio-item">
            <a href="${item}" target="_blank">${item}</a>
            <button onclick="removePortfolioItem(${index})">Видалити</button>
        </div>
    `).join('');
}

// Apply to project (open proposal modal)
function applyToProject(adId) {
    const modal = document.getElementById('proposalModal');
    const adIdInput = document.getElementById('proposalAdId');
    
    if (adIdInput) adIdInput.value = adId;
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Submit proposal
function submitProposal(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const adId = document.getElementById('proposalAdId').value;
    const message = document.getElementById('proposalMessage').value;
    const price = document.getElementById('proposalPrice').value;
    const deadline = document.getElementById('proposalDeadline').value;
    const portfolio = document.getElementById('proposalPortfolio').value;

    const user = firebase.auth().currentUser;
    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    const ad = ads.find(a => a.id === adId);
    
    if (!ad) {
        alert('Проект не знайдено');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправлення...';

    const application = {
        id: Date.now().toString(),
        adId,
        projectTitle: ad.title,
        bloggerEmail: user.email,
        bloggerName: user.displayName || user.email.split('@')[0],
        message,
        price: parseInt(price),
        deadline: parseInt(deadline),
        portfolio: portfolio || null,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    let applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));

    closeModal('proposalModal');
    form.reset();
    alert('Заявку відправлено!');
    showSection('my-applications');
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Відправити заявку';
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Accept application
function acceptApplication(appId) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications.find(a => a.id === appId);
    
    if (!app) return;

    app.status = 'accepted';
    localStorage.setItem('applications', JSON.stringify(applications));

    // Create project
    const project = {
        id: Date.now().toString(),
        adId: app.adId,
        title: app.projectTitle,
        bloggerEmail: app.bloggerEmail,
        bloggerName: app.bloggerName,
        businessEmail: firebase.auth().currentUser.email,
        businessName: firebase.auth().currentUser.displayName || 'Бізнес',
        status: 'in-progress',
        createdAt: new Date().toISOString()
    };

    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));

    loadApplications();
    alert('Заявку прийнято! Створено проект.');
}

// Reject application
function rejectApplication(appId) {
    if (!confirm('Ви впевнені, що хочете відхилити цю заявку?')) return;

    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications.find(a => a.id === appId);
    
    if (app) {
        app.status = 'rejected';
        localStorage.setItem('applications', JSON.stringify(applications));
        loadApplications();
    }
}

// Add portfolio item
function addPortfolioItem() {
    const linkInput = document.getElementById('portfolioLink');
    const link = linkInput.value.trim();
    
    if (!link) {
        alert('Введіть посилання');
        return;
    }

    let portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
    portfolio.push(link);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));

    linkInput.value = '';
    loadPortfolio();
}

// Remove portfolio item
function removePortfolioItem(index) {
    let portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
    portfolio.splice(index, 1);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    loadPortfolio();
}

// Filter projects
function filterProjects() {
    const projectsList = document.getElementById('availableProjectsList');
    if (!projectsList) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    // Get filter values
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const budgetMin = parseInt(document.getElementById('filterBudgetMin')?.value) || 0;
    const budgetMax = parseInt(document.getElementById('filterBudgetMax')?.value) || Infinity;

    // Load all ads
    const adsStr = localStorage.getItem('ads');
    const ads = adsStr ? JSON.parse(adsStr) : [];
    
    // Filter active ads
    let filteredAds = ads.filter(ad => {
        if (ad.status && ad.status !== 'active') return false;
        if (categoryFilter && ad.category !== categoryFilter) return false;
        if (ad.budget < budgetMin) return false;
        if (ad.budget > budgetMax) return false;
        return true;
    });
    
    // Filter out already applied
    const applicationsStr = localStorage.getItem('applications');
    const applications = applicationsStr ? JSON.parse(applicationsStr) : [];
    const appliedAdIds = applications
        .filter(app => app.bloggerEmail === user.email)
        .map(app => app.adId);
    
    filteredAds = filteredAds.filter(ad => !appliedAdIds.includes(ad.id));
    
    // Display filtered results
    if (filteredAds.length === 0) {
        projectsList.innerHTML = '<p class="empty-state">Не знайдено проектів за заданими фільтрами</p>';
        return;
    }

    projectsList.innerHTML = filteredAds.map(ad => `
        <div class="project-card-enhanced">
            <div class="project-header">
                <div class="project-info">
                    <span class="category">${getCategoryName(ad.category)}</span>
                    <h3>${ad.title}</h3>
                    <div class="project-meta">
                        <span>💰 ${ad.budget} грн</span>
                        <span>⏱️ ${ad.deadline} днів</span>
                        <span>📅 ${new Date(ad.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                </div>
            </div>
            <p class="description" style="margin: 1rem 0; color: var(--gray); line-height: 1.6;">
                ${ad.description.length > 200 ? ad.description.substring(0, 200) + '...' : ad.description}
            </p>
            ${ad.skills && ad.skills.length > 0 ? `
                <div class="skills-display" style="margin: 1rem 0;">
                    ${ad.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                </div>
            ` : ''}
            <div class="project-actions">
                <button class="btn btn-primary" onclick="viewProjectDetails('${ad.id}')">Деталі</button>
                <button class="btn btn-success" onclick="applyToProject('${ad.id}')">Подати заявку</button>
            </div>
        </div>
    `).join('');
}

// Helper functions
function getCategoryName(category) {
    const categories = {
        'toys': 'Дитячі іграшки',
        'food': 'Їжа та ресторани',
        'fashion': 'Мода та одяг',
        'beauty': 'Краса та косметика',
        'tech': 'Технології',
        'services': 'Послуги',
        'other': 'Інше'
    };
    return categories[category] || category;
}

function getStatusName(status) {
    const statuses = {
        'pending': 'Очікує',
        'accepted': 'Прийнято',
        'rejected': 'Відхилено',
        'in-progress': 'В роботі',
        'completed': 'Завершено'
    };
    return statuses[status] || status;
}

// Make functions available globally
window.showSection = showSection;
window.applyToProject = applyToProject;
window.acceptApplication = acceptApplication;
window.rejectApplication = rejectApplication;
window.addPortfolioItem = addPortfolioItem;
window.removePortfolioItem = removePortfolioItem;
window.filterProjects = filterProjects;
window.closeModal = closeModal;
window.viewProjectDetails = viewProjectDetails;
window.viewApplication = viewApplication;
window.deliverWork = deliverWork;
window.openDeliverWorkModal = openDeliverWorkModal;
window.filterMyProjects = filterMyProjects;
window.approveWork = approveWork;
window.requestRevision = requestRevision;
window.removeSkill = removeSkill;
window.closeAd = closeAd;
window.viewAdApplications = viewAdApplications;

// ==================== CHAT FUNCTIONALITY ====================

let currentChatId = null;
let chatUnsubscribe = null;
let conversationsUnsubscribe = null;

// Initialize chat
function initChat() {
    const chatMessageForm = document.getElementById('chatMessageForm');
    if (chatMessageForm) {
        chatMessageForm.addEventListener('submit', sendChatMessage);
    }

    const chatSearch = document.getElementById('chatSearch');
    if (chatSearch) {
        chatSearch.addEventListener('input', filterConversations);
    }
}

// Load chat conversations
function loadChatConversations() {
    const conversationsList = document.getElementById('chatConversations');
    if (!conversationsList) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    // Load conversations from localStorage (in real app, use Firestore)
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const userType = localStorage.getItem('userType');
    
    // Filter conversations for current user
    const myConversations = conversations.filter(conv => {
        if (userType === 'business') {
            return conv.businessEmail === user.email;
        } else {
            return conv.bloggerEmail === user.email;
        }
    });

    if (myConversations.length === 0) {
        conversationsList.innerHTML = '<p class="empty-state">Немає активних розмов</p>';
        return;
    }

    // Sort by last message time
    myConversations.sort((a, b) => {
        const timeA = a.lastMessageTime || a.createdAt;
        const timeB = b.lastMessageTime || b.createdAt;
        return new Date(timeB) - new Date(timeA);
    });

    conversationsList.innerHTML = myConversations.map(conv => {
        const otherUser = userType === 'business' ? conv.bloggerName : conv.businessName;
        const otherEmail = userType === 'business' ? conv.bloggerEmail : conv.businessEmail;
        const lastMessage = conv.lastMessage || 'Немає повідомлень';
        const lastMessageTime = conv.lastMessageTime ? formatChatTime(conv.lastMessageTime) : '';
        const unreadCount = conv.unreadCount || 0;
        const initials = getInitials(otherUser);

        return `
            <div class="chat-conversation-item" data-chat-id="${conv.id}" data-user-name="${escapeHtml(otherUser)}" data-user-email="${escapeHtml(otherEmail)}">
                <div class="chat-conversation-header">
                    <div class="chat-conversation-avatar">${initials}</div>
                    <div class="chat-conversation-info">
                        <div class="chat-conversation-name">${escapeHtml(otherUser)}</div>
                        <div class="chat-conversation-preview">${escapeHtml(lastMessage)}</div>
                    </div>
                    <div class="chat-conversation-meta">
                        ${lastMessageTime ? `<div class="chat-conversation-time">${lastMessageTime}</div>` : ''}
                        ${unreadCount > 0 ? `<div class="chat-conversation-badge">${unreadCount}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    document.querySelectorAll('.chat-conversation-item').forEach(item => {
        item.addEventListener('click', function() {
            const chatId = this.dataset.chatId;
            const userName = this.dataset.userName;
            const userEmail = this.dataset.userEmail;
            openChat(chatId, userName, userEmail);
        });
    });
}

// Open chat with user
function openChat(chatId, userName, userEmail) {
    currentChatId = chatId;
    
    // Update UI
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('chatUserName').textContent = userName;
    document.getElementById('chatUserStatus').textContent = 'Онлайн';
    document.getElementById('chatUserStatus').classList.add('online');
    
    const avatar = document.querySelector('.chat-user-avatar');
    if (avatar) {
        avatar.textContent = getInitials(userName);
    }

    // Mark conversation as active
    document.querySelectorAll('.chat-conversation-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.chatId === chatId) {
            item.classList.add('active');
        }
    });

    // Load messages
    loadChatMessages(chatId);
}

// Close chat
function closeChat() {
    currentChatId = null;
    document.getElementById('chatEmptyState').style.display = 'flex';
    document.getElementById('chatWindow').style.display = 'none';
    
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
}

// Load chat messages
function loadChatMessages(chatId) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    // Load messages from localStorage (in real app, use Firestore)
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const chatMessages = messages.filter(msg => msg.chatId === chatId);

    if (chatMessages.length === 0) {
        messagesContainer.innerHTML = '<p class="empty-state" style="text-align: center; color: var(--gray);">Немає повідомлень. Почніть розмову!</p>';
        return;
    }

    // Sort by time
    chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    messagesContainer.innerHTML = chatMessages.map(msg => {
        const isSent = msg.senderEmail === user.email;
        const time = formatChatTime(msg.createdAt);
        const senderInitials = getInitials(msg.senderName);

        return `
            <div class="chat-message ${isSent ? 'sent' : 'received'}">
                <div class="chat-message-avatar">${senderInitials}</div>
                <div class="chat-message-content">
                    <p class="chat-message-text">${escapeHtml(msg.text)}</p>
                    <div class="chat-message-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send chat message
function sendChatMessage(e) {
    e.preventDefault();

    const input = document.getElementById('chatMessageInput');
    const messageText = input.value.trim();

    if (!messageText || !currentChatId) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    const userType = localStorage.getItem('userType');
    const userName = user.displayName || user.email.split('@')[0];

    // Create message
    const message = {
        id: Date.now().toString(),
        chatId: currentChatId,
        senderEmail: user.email,
        senderName: userName,
        text: messageText,
        createdAt: new Date().toISOString()
    };

    // Save message
    let messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));

    // Update conversation
    let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const conversation = conversations.find(c => c.id === currentChatId);
    if (conversation) {
        conversation.lastMessage = messageText;
        conversation.lastMessageTime = message.createdAt;
        conversation.unreadCount = 0; // Reset unread for current user
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    // Clear input
    input.value = '';

    // Reload messages
    loadChatMessages(currentChatId);
    loadChatConversations();
}

// Create or get chat conversation
function getOrCreateChat(otherUserEmail, otherUserName, projectId = null) {
    const user = firebase.auth().currentUser;
    if (!user) return null;

    const userType = localStorage.getItem('userType');
    let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');

    // Check if conversation already exists
    let conversation = conversations.find(conv => {
        if (userType === 'business') {
            return conv.businessEmail === user.email && conv.bloggerEmail === otherUserEmail;
        } else {
            return conv.bloggerEmail === user.email && conv.businessEmail === otherUserEmail;
        }
    });

    if (!conversation) {
        // Create new conversation
        conversation = {
            id: Date.now().toString(),
            businessEmail: userType === 'business' ? user.email : otherUserEmail,
            businessName: userType === 'business' ? (user.displayName || user.email.split('@')[0]) : otherUserName,
            bloggerEmail: userType === 'blogger' ? user.email : otherUserEmail,
            bloggerName: userType === 'blogger' ? (user.displayName || user.email.split('@')[0]) : otherUserName,
            projectId: projectId,
            createdAt: new Date().toISOString(),
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0
        };

        conversations.push(conversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    // Open chat
    showSection('messages');
    setTimeout(() => {
        const otherName = userType === 'business' ? conversation.bloggerName : conversation.businessName;
        const otherEmail = userType === 'business' ? conversation.bloggerEmail : conversation.businessEmail;
        openChat(conversation.id, otherName, otherEmail);
    }, 100);

    return conversation.id;
}

// Filter conversations
function filterConversations() {
    const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
    const items = document.querySelectorAll('.chat-conversation-item');
    
    items.forEach(item => {
        const name = item.querySelector('.chat-conversation-name').textContent.toLowerCase();
        const preview = item.querySelector('.chat-conversation-preview').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || preview.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Helper functions
function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Зараз';
    if (minutes < 60) return `${minutes} хв назад`;
    if (hours < 24) return `${hours} год назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', function() {
    initChat();
});

// Open chat from application
function openChatFromApplication(userEmail, userName, projectId) {
    getOrCreateChat(userEmail, userName, projectId);
}

// Open chat from project
function openChatFromProject(userEmail, userName, projectId) {
    getOrCreateChat(userEmail, userName, projectId);
}

// Make functions available globally
window.openChat = openChat;
window.closeChat = closeChat;
window.getOrCreateChat = getOrCreateChat;
window.openChatFromApplication = openChatFromApplication;
window.openChatFromProject = openChatFromProject;
window.loadAvailableProjects = loadAvailableProjects;


