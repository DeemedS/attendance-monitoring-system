<template>
    <aside class="sidebar">

        <div class="menu-item" :class="{ active: activeMenu === 'dashboard' }"
            @click="toggleMenu('dashboard'), navigateTo('dashboard')">
            <i class="fas fa-tachometer-alt"></i> Dashboard
        </div>

        <div class="menu-item" :class="{ active: activeMenu === 'subjects' }" @click="toggleMenu('subjects')">
            <i class="fas fa-book"></i> Subjects
        </div>


        <div v-if="activeMenu === 'subjects'" id="subjects" class="submenu">

            <div v-for="(subject, index) in assignedSubjects" :key="index">
                <div class="submenu-item" :class="{ active: activeSubmenu === subject.name }"
                    @click="toggleSubmenu(subject.name)">
                    {{ subject.name }}
                </div>

                <div v-if="activeSubmenu === subject.name" id="subject1" class="submenu">
                    <div class="submenu-item">Sections</div>

                    <div v-for="(section, index) in subject.sections" :key="index" class="submenu">

                        <div class="submenu-item" :class="{ active: activeContent === section.name }"
                            @click="toggleActiveContent(section.name)">
                            {{ section.name }}
                        </div>

                        <div v-if="activeContent === section.name" class="section-content">
                            <ul>
                                <li class="content-item"
                                    :class="{ active: activeContentItem === section.name + '-studentList' }"
                                    @click="highlightContentItem(section.name + '-studentList')">
                                    <NuxtLink :to="`/studentlist/${subject.name}/${section.name}`">Student List
                                    </NuxtLink>
                                </li>
                                <li class="content-item"
                                    :class="{ active: activeContentItem === section.name + '-classes' }"
                                    @click="highlightContentItem(section.name + '-classes')">
                                    <NuxtLink :to="`/classes/${subject.name}/${section.name}`">Classes</NuxtLink>
                                </li>
                                <li class="content-item"
                                    :class="{ active: activeContentItem === section.name + '-calendar' }"
                                    @click="highlightContentItem(section.name + '-calendar')">
                                    <a href="#classcalendar">Class Calendar</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="menu-item" @click="logout">
            <i class="fas fa-sign-out-alt"></i> Logout
        </div>
    </aside>
</template>


<script setup>
import { ref } from 'vue';

const activeMenu = ref(null);
const activeSubmenu = ref(null);
const activeContent = ref(null);
const activeContentItem = ref(null);
const account_id = ref(null);

const route = useRoute();
const router = useRouter();
const routeName = ref(route.name);

const assignedSubjects = ref([]);

const { data: userid } = await useFetch('/api/me', {
    headers: useRequestHeaders(['cookie'])
})

const { data: account, error: accountError } = await useFetch('/api/accounts', {
    method: 'POST',
    body: {
        user_id: userid.value
    }
});

account_id.value = account.value.accountId

const { data: subjects, error: subjectsError } = await useFetch('/api/subjects', {
    method: 'POST',
    body: {
        assigned: account_id.value
    }
});

assignedSubjects.value = subjects.value;


if (routeName.value === 'dashboard') {
    activeMenu.value = 'dashboard';
} else if (routeName.value === 'studentlist-subject_code-section_code') {
    activeMenu.value = 'subjects';
    activeSubmenu.value = route.params.subject_code;
    activeContent.value = route.params.section_code;
    activeContentItem.value = route.params.section_code + '-studentList';
} else if (routeName.value === 'classes-subject_code-section_code') {
    activeMenu.value = 'subjects';
    activeSubmenu.value = route.params.subject_code;
    activeContent.value = route.params.section_code;
    activeContentItem.value = route.params.section_code + '-classes';
}

function highlightContentItem(content) {
    activeContentItem.value = content;
}

function toggleMenu(menu) {
    if (menu === 'dashboard') {
        activeMenu.value = 'dashboard';
    } else {
        activeMenu.value = menu;
    }
}

function toggleSubmenu(submenu) {
    activeSubmenu.value = activeSubmenu.value === submenu ? null : submenu;
}

function toggleActiveContent(content) {
    activeContent.value = activeContent.value === content ? null : content;
}

function navigateTo(route) {
    router.push(`/${route}`);
}

function logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
}

</script>