<template>
    <aside class="sidebar">
        <ul>
            <li><a :class="{ active: routeName === 'dashboard' }" href="/dashboard">Dashboard</a></li>

            <div class="accordion">
                <p class="text-center text-[18px] font-bold">Subjects</p>

                <!-- Subject 1 Accordion Item -->
                <div class="accordion-item">
                    <button class="accordion-header" @click="toggleAccordion('subject1')"
                        :class="{ active: activeAccordion.subject === 'subject1' }">
                        CMPE 40223
                    </button>
                    <div class="accordion-body" :class="{ 'is-active': activeAccordion.subject === 'subject1' }">
                        <!-- Section 1 Accordion Item -->
                        <div class="accordion-item ">
                            <p class="text-center font-bold text-[16px]">Sections</p>
                            <button class="accordion-header" @click="toggleAccordion('section1_1')"
                                :class="{ active: activeAccordion.section === 'section1_1' }">
                                2PCMPE-E4
                            </button>
                            <div class="accordion-body"
                                :class="{ 'is-active': activeAccordion.section === 'section1_1' }">
                                <ul class="function-list">
                                    <li><a  :href="'/studentlist/' + subject_code + '/' + section_code">Student List</a></li>
                                    <li><a  :href="'/classes/' + subject_code + '/' + section_code">Classes</a></li>
                                    <li><a  href="#classCalendar1_1">Class Calendar</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <li><a :class="{ active: routeName === 'logout' }" href="#">Logout</a></li>
        </ul>


    </aside>
</template>


<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const routeName = ref(route.name);
const subject_code = "CMPE 40223";
const section_code = "2PCMPE-E4";

const activeAccordion = ref({
    subject: '',
    section: ''
});

function toggleAccordion(id) {
    if (id.startsWith('subject')) {
        activeAccordion.value = {
            subject: activeAccordion.value.subject === id ? '' : id,
            section: ''
        };
    } else {
        const subjectId = Object.keys(activeAccordion.value.subject).find(subject => activeAccordion.value.subject === subject);
        activeAccordion.value = {
            subject: activeAccordion.value.subject,
            section: activeAccordion.value.section === id ? '' : id
        };
    }
}
</script>



<style scoped>
.accordion {
    max-width: 600px;
    margin: auto;
}

.accordion-item {
    background-color: transparent;
    border: none;
    border: 0;
    color: white;
    margin-bottom: 10px;
}

.accordion-header {
    border: none;
    border: 0;
    background-color: transparent;
    text-align: center;
    width: 100%;
    font-size: 18px;
}

.accordion-body {
    padding: 10px;
    display: none;
}

.accordion-body.is-active {
    display: block;
}

.accordion-body ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.accordion-body ul li {
    margin-bottom: 10px;
}

.accordion-body ul li a {
    text-decoration: none;
    color: white;
}

.accordion-header.active {
    background-color: #ddd;
}
</style>