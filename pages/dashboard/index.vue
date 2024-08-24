<template>
  <div class="flex flex-col container-fluid items-center justify-center h-[100vh] max-w-[1200px]">
    <div class="dashboard-box">
      <Sidebar />

      <!-- Main Content Area -->
      <div class="main-content">
        <h1 class="text-center">Semester Calendar</h1>
        <p class="text-center">{{ current_semester }} Semester</p>
        <vue-cal 
          hide-view-selector
          :min-date="minDate" 
          :max-date="maxDate" 
          today-button 
          :disable-views="['years', 'year', 'days', 'week', 'day']"
          :highlight-today="true"
          active-view="month"
          :selected-date="selectedDate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { extractInteger, extractYear } from '~/utils/utils.ts';

const { data: semester, error: semesterError } = await useFetch('/api/semester', {
  method: 'POST',
  body: { semester_id: '1' }
});

if (semesterError.value) {
  console.error(semesterError.value);
}

const start_date = semester.value.semester[0].start_date;
const end_date = semester.value.semester[0].end_date;
const current_semester = semester.value.semester[0].semester;

const minDate = ref(new Date(start_date));
const maxDate = ref(new Date(end_date));
const selectedDate = ref(new Date(1999, 0, 1));

onMounted(() => {
  // Initialize selected date based on the current date and boundaries
  const today = new Date();
  selectedDate.value = today < minDate.value ? minDate.value
                        : today > maxDate.value ? maxDate.value
                        : today;

  updateButtonStates();
  addClickListeners();
});

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function addClickListeners() {
  const prevButton = document.querySelector('.vuecal__arrow--prev');
  const nextButton = document.querySelector('.vuecal__arrow--next');

  prevButton?.addEventListener('click', handlePrevClick);
  nextButton?.addEventListener('click', handleNextClick);
}

function handlePrevClick() {
  updateButtonStates('prev');
}

function handleNextClick() {
  updateButtonStates('next');
}

function updateButtonStates(direction) {
  const prevButton = document.querySelector('.vuecal__arrow--prev');
  const nextButton = document.querySelector('.vuecal__arrow--next');

  disableButton(prevButton);
  disableButton(nextButton);

  setTimeout(() => {
    const { month, year } = getTitleMonthYear();
    const { firstCellInt, lastCellInt } = getDay();

    if (direction === 'prev') {
      const newDate = new Date(`${month}, ${firstCellInt}, ${year}`);
      if (newDate <= minDate.value) {
        disableButton(prevButton);
        enableButton(nextButton);
      } else {
        enableButton(prevButton);
        enableButton(nextButton);
      }
    } 
    else if (direction === 'next') {
      const newDate = new Date(`${month}, ${lastCellInt + 1}, ${year}`);
      if (newDate >= maxDate.value) {
        disableButton(nextButton);
        enableButton(prevButton);
      } else {
        enableButton(prevButton);
        enableButton(nextButton);
      }
    } 
    else {
      const newDate = new Date();
      if (newDate <= minDate.value) {
        disableButton(prevButton);
        enableButton(nextButton);
      } 
      else if (newDate >= maxDate.value) {
        disableButton(nextButton);
        enableButton(prevButton);
      }
      else {
        enableButton(prevButton);
        enableButton(nextButton);
      }
    }
  }, 500);
}

function getTitleMonthYear() {
  const titleElement = document.querySelector('.vuecal__title')?.firstElementChild;
  const titleText = titleElement?.textContent.trim();
  const month = monthNames.find(month => titleText?.includes(month));
  const year = extractYear(titleText || '');

  return { month, year };
}

function getDay() {
  const disabledCells = document.querySelectorAll('.vuecal__cell:not(.vuecal__cell--disabled):not(.vuecal__cell--out-of-scope)');
  const firstCell = disabledCells[0]?.textContent.trim() || '';
  const lastCell = disabledCells[disabledCells.length - 1]?.textContent.trim() || '';
  const firstCellInt = extractInteger(firstCell || '');
  const lastCellInt = extractInteger(lastCell || '');

  return { firstCellInt, lastCellInt };
}

function disableButton(button) {
  if (button) {
    button.setAttribute('disabled', 'true');
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.5';
  }
}

function enableButton(button) {
  if (button) {
    button.removeAttribute('disabled');
    button.style.cursor = 'pointer';
    button.style.opacity = '1';
  }
}
</script>
