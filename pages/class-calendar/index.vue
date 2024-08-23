<template>
  <div class="flex flex-col container-fluid items-center justify-center h-[100vh] max-w-[1200px]">
    <div class="dashboard-box">
      <Sidebar />


      <!-- Main Content Area -->
      <main class="main-content">
        <vue-cal 
        :min-date="minDate" 
        :max-date="maxDate" 
        today-button 
        :disable-views="['years', 'year', 'days', 'week', 'day']"
        :hide-weekdays="[6, 7]" 
        :events="events" 
        :highlight-today="true"
        active-view="month" 
        :selected-date="selectedDate">
        </vue-cal>
      </main>
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
  body: {
    semester_id: '1',
  }
});

const start_date = semester.value.semester[0].start_date;
const end_date = semester.value.semester[0].end_date;

const minDate = ref(new Date(start_date));
const maxDate = ref(new Date(end_date));
const selectedDate = ref(new Date(1999, 0, 1));

setTimeout(() => {
  if (new Date() < minDate.value) {
  selectedDate.value = minDate.value;
  }
  if (new Date() > maxDate.value) {
    selectedDate.value = maxDate.value;
  }
  else {
    selectedDate.value = new Date();
  }
}, 500);



const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

onMounted(() => {
  handleNextClick();
  handlePrevClick();
  addClickListeners();
});

function addClickListeners() {
  const prevButton = document.querySelector('.vuecal__arrow--prev');
  const nextButton = document.querySelector('.vuecal__arrow--next');
  prevButton?.addEventListener('click', handlePrevClick);
  nextButton?.addEventListener('click', handleNextClick);
}

function handlePrevClick() {
  disableButton(document.querySelector('.vuecal__arrow--prev'));
  disableButton(document.querySelector('.vuecal__arrow--next'));
  setTimeout(() => {
    const month = getTitleMonthYear().month;
    const weekday = getWeekdayLabel().WeekdayLabel;
    const year = getTitleMonthYear().year;
    const integer = getWeekdayLabel().integer;

    const newDate = new Date(`${month}, ${weekday || integer} , ${year}`);

    if (newDate <= minDate.value) {
      disableButton(document.querySelector('.vuecal__arrow--prev'));
      enableButton(document.querySelector('.vuecal__arrow--next'));
    } else {
      enableButton(document.querySelector('.vuecal__arrow--prev'));
      enableButton(document.querySelector('.vuecal__arrow--next'));
    }
  }, 500);
}

function handleNextClick() {
  disableButton(document.querySelector('.vuecal__arrow--next'));
  disableButton(document.querySelector('.vuecal__arrow--prev'));
  setTimeout(() => {
    const year = getTitleMonthYear().year;
    const month = getTitleMonthYear().month;
    const weekday = getWeekdayLabelLast().lastLabel;
    const disabledCells = getWeekdayLabelLast().disabledCells;

    const newDate = new Date(`${month}, ${weekday || disabledCells} , ${year}`);

    if (newDate >= maxDate.value) {
      disableButton(document.querySelector('.vuecal__arrow--next'));
      enableButton(document.querySelector('.vuecal__arrow--prev'));
    } else {
      enableButton(document.querySelector('.vuecal__arrow--next'));
      enableButton(document.querySelector('.vuecal__arrow--prev'));
    }
  }, 500);
}


function getTitleMonthYear() {
  const titleElement = document.querySelector('.vuecal__title').firstElementChild;
  const titleText = titleElement.textContent.trim();
  const includedMonth = monthNames.find(month => titleText.includes(month));
  const year = extractYear(titleText);

  return { month: includedMonth, year };
}

function getWeekdayLabelLast() {
  const WeekdayLabel = document.querySelectorAll('.weekday-label');
  const lastLabel = WeekdayLabel[WeekdayLabel.length - 1].firstElementChild.nextSibling.nextSibling.nextSibling.textContent.trim();

  const disabledCells = document.querySelector('.vuecal__cell--disabled:not(.vuecal__cell--out-of-scope)')?.textContent.trim();

  return { lastLabel, disabledCells };
}

function getWeekdayLabel() {
  const WeekdayLabel = document.querySelector('.weekday-label').firstElementChild.nextSibling.nextSibling.nextSibling.textContent.trim();
  const disabledCells = document.querySelectorAll('.vuecal__cell:not(.vuecal__cell--disabled):not(.vuecal__cell--out-of-scope)');
  const firstCell = disabledCells[0].textContent.trim();
  const lastCell = disabledCells[disabledCells.length - 1].textContent.trim();
  const integer = extractInteger(firstCell || '');
  const lastCellInt = extractInteger(lastCell || '');

  return { WeekdayLabel, integer, lastCellInt };
}

function disableButton(button) {
  button.setAttribute('disabled', 'true');
  button.style.cursor = 'not-allowed';
  button.style.opacity = '0.5';
}

function enableButton(button) {
  button.removeAttribute('disabled');
  button.style.cursor = 'pointer';
  button.style.opacity = '1';
}
</script>
