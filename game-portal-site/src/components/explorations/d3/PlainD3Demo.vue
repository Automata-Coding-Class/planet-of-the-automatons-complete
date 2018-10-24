<template>
  <div>
    <h3>Plain Ol’ D3</h3>
      <div id="graph-container"></div>
      <p>Nothing fancy about this one. Just using D3's usual imperative approach, inside
      the 'mounted()' hook of this Vue.js component.</p>
      <p>Code courtesy of Tyrone Tudehope: <a target="_blank"
              href="https://medium.com/tyrone-tudehope/composing-d3-visualizations-with-vue-js-c65084ccb686">https://medium.com/tyrone-tudehope/composing-d3-visualizations-with-vue-js-c65084ccb686</a></p>
  </div>
</template>

<script>
  import * as d3 from 'd3';

  const data = [99, 71, 68, 25, 36, 92];

  export default {
    name: 'PlainD3Demo',
    mounted() {
      const svg = d3.select('#graph-container')
        .append('svg')
        .attr('width', 500)
        .attr('height', 270)
        .append('g')
        .attr('transform', 'translate(0,10)');

      const x = d3.scaleLinear().range([0, 430]);
      const y = d3.scaleLinear().range([210, 0]);
      d3.axisLeft().scale(x);
      d3.axisTop().scale(y);
      x.domain(d3.extent(data, (d, i) => i));
      y.domain([0, d3.max(data, d => d)]);
      const createPath = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));
      svg.append('path').attr('d', createPath(data));
    }
  };
</script>

<style scoped>

</style>
