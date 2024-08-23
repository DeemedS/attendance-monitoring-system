
export const convertDateToLocale = ( date: string ): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const newDate = new Date(date).toLocaleDateString('en-US', options);
    return newDate;
  };