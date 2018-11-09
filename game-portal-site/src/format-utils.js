export const sameDay = (date1, date2) => {
  if (isNaN(Date.parse(date1)) || isNaN(Date.parse(date2))) {
    throw new Error(`Invalid date (either ${date1} or ${date2})`);
  } else {
    const parsedDate1 = new Date(Date.parse(date1));
    const parsedDate2 = new Date(Date.parse(date2));
    return parsedDate1.getFullYear() === parsedDate2.getFullYear()
      && parsedDate1.getMonth() === parsedDate2.getMonth()
      && parsedDate1.getDate() === parsedDate2.getDate();
  }
};

export const timeStampFormat = (date) => {
  if(typeof date === 'string') date = new Date(date);
  if (date instanceof Date) {
    const locale = navigator.locale;
    const dateOptions = {month: 'short', day: 'numeric'};
    const timeOptions = {hour12: false};
    const formattedTimestamp = (!sameDay(date, new Date()) ?
      date.toLocaleDateString(locale, dateOptions).replace(/T.*$/, '') + ' ' : '') +
      date.toLocaleTimeString(locale, timeOptions);
    return formattedTimestamp;
  }
  return '';

}
