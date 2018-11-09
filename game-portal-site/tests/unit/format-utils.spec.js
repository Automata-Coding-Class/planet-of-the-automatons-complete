import * as FormatUtils from '../../src/format-utils';


expect.extend({
  toBeApproximately(received, referenceNumber, permittedDeviation) {
    const pass = (referenceNumber - permittedDeviation) <= received
      && received <= (referenceNumber + permittedDeviation);
    const message = `expected ${received} be approximately ${referenceNumber} (±${permittedDeviation})`;
    if (pass) {
      return {
        message: () => message,
        pass: true,
      };
    } else {
      return {
        message: () => message,
        pass: false,
      };
    }
  },
});


let startingLocale;
beforeEach(() => {
  startingLocale = navigator.locale;
  navigator.locale = 'en-CA';
});
afterEach(() => {
  navigator.locale = startingLocale;
})
describe('FormatUtils', () => {
  describe('sameDay', () => {
    test('reports identical dates as being the same day', () => {
      const date1 = new Date('2002/09/16');
      const date2 = new Date('2002/09/16');
      expect(FormatUtils.sameDay(date1, date2)).toBe(true);
    });
    test('reports identical date strings as being the same day', () => {
      const date1 = '2002/09/16';
      const date2 = '2002/09/16';
      expect(FormatUtils.sameDay(date1, date2)).toBe(true);
    })
    test('reports dates with different times as being the same day', () => {
      const date1 = new Date('2002/09/16 00:12:34');
      const date2 = new Date('2002/09/16 11:24 PM');
      expect(FormatUtils.sameDay(date1, date2)).toBe(true);
    })
    test('reports dates on different days as not being the same day', () => {
      const date1 = new Date('2002/09/16 12:34:56');
      const date2 = new Date('2002/09/17 12:34:56');
      expect(FormatUtils.sameDay(date1, date2)).toBe(false);
    })
  });
  describe('timeStampFormat', () => {
    // test('returns correct time stamp format for a date on the current day', () => {
    let validateTimeFormat = function (formattedDate, testDate) {
      // this complexity is necessary because the seconds component can be off by 1 (if the test Date and the internal comparison date are instantiated either side of a seconds boundary)
      const timeComponentPattern = /(\d{2}):(\d{2}):(\d{2})$/i;
      expect(formattedDate).toEqual(expect.stringMatching(timeComponentPattern));
      const dateStringComponents = timeComponentPattern.exec(formattedDate);
      expect(parseInt(dateStringComponents[1])).toBe(testDate.getHours());
      expect(parseInt(dateStringComponents[2])).toBe(testDate.getMinutes());
      expect(parseInt(dateStringComponents[3])).toBeApproximately(testDate.getSeconds(), 1);
    };
    let validateDateFormat = function (formattedDate, testDate, expectedMonthName) {
      const dateComponentPattern = /^([a-z]+) (\d{1,2})/i;
      expect(formattedDate).toEqual(expect.stringMatching(dateComponentPattern));
      const dateStringComponents = dateComponentPattern.exec(formattedDate);
      expect(dateStringComponents[1]).toBe(expectedMonthName);
      expect(parseInt(dateStringComponents[2])).toBe(testDate.getDate());
    };
    test('returns correct time stamp format for a date on the current day', () => {
      const testDate = new Date();
      testDate.setHours((testDate.getHours() + 3) % 24); // to ensure that the times don't match
      testDate.setMinutes(3);
      const formattedDate = FormatUtils.timeStampFormat(testDate);

      validateTimeFormat(formattedDate, testDate);
    });
    test('returns correct time stamp format for a date on a different day', () => {
      let testDate = new Date('Dec 29 2017 3:00 PM');
      const formattedDate = FormatUtils.timeStampFormat(testDate);
      validateDateFormat(formattedDate, testDate, 'Dec');
      validateTimeFormat(formattedDate, testDate);
    });

  })
})
