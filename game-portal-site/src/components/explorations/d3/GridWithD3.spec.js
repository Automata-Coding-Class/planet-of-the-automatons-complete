import {mount} from '@vue/test-utils';

import GridWithD3 from './GridWithD3.vue';


describe('GridWithD3', () => {
  const rows = 12, columns = 15;
  const minimumWidth = 120;
  const wrapper = mount(GridWithD3, {
    propsData: {
      rows: rows,
      columns: columns,
      minimumWidth: minimumWidth
    }
  });
  // const pathElemRegex =
  const gridLinePathElemRegexString = '<path\\s+d="([ML\\d,\\.]+)"[^>]+>.*</path>';
  const svgRegex = new RegExp('(<svg\\b.*\\bclass="grid-demo[^>]+>)'
    + '(<g.*class="grid".*>)'
    + `(${gridLinePathElemRegexString})`
    + '(<\/g>)(<\/svg>)'
  );

  it('renders the correct markup', () => {
    expect(wrapper.html()).toEqual(expect.stringMatching(svgRegex));
  });

  it('has the correct dimensions for the svg component', () => {
    const svgOpeningTag = svgRegex.exec(wrapper.html())[1];
    console.log(`svg opening tag:`, svgOpeningTag);
    const svgWidth = parseFloat(svgOpeningTag.match(/width="([\d\.]+)"/)[1]);
    const svgHeight = parseFloat(svgOpeningTag.match(/height="([\d\.]+)"/)[1]);
    expect(svgWidth).toBe(minimumWidth);
    expect(svgHeight).toEqual(svgWidth);
  });

  it('draws the correct number of lines', () => {
    const pathData = svgRegex.exec(wrapper.html())[0];
    expect((pathData.match(/[\d\.]+L[\d\.]+/g) || []).length).toBe((rows + 1) + (columns + 1));
  })
});
