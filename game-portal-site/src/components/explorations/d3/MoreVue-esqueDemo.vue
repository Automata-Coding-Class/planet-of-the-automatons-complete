<template>
    <div>
        <h3>More Vue-esque</h3>
        <svg width="500" height="270">
            <g style="transform: translate(0, 10px)">
                <path :d="line"></path>
            </g>
        </svg>
        <p>From Tyrone Tudhope:</p>
        <blockquote>&hellip; doesn’t expose any properties and the data is hard-coded, it nicely
            separates the view from the logic and makes use of Vue hooks, methods and the data
            object.

            We are making use of D3s components to generate the data we require to populate the
            document with, but we’re using Vue to manage the DOM and the state of the component.
        </blockquote>
        <p>Code courtesy of Tyrone Tudehope: <a target="_blank"
                                                href="https://medium.com/tyrone-tudehope/composing-d3-visualizations-with-vue-js-c65084ccb686">https://medium.com/tyrone-tudehope/composing-d3-visualizations-with-vue-js-c65084ccb686</a>
        </p>
    </div>
</template>

<script>
  import * as d3 from 'd3';
  export default {
    name: 'PlainD3Demo',
    data() {
      return {
        data: [99, 71, 78, 25, 36, 92],
        line: '',
      }
    },
    mounted() {
      this.calculatePath();
    },
    methods: {
      getScales() {
        const x = d3.scaleTime().range([0, 430]);
        const y = d3.scaleLinear().range([210, 0]);
        d3.axisLeft().scale(x);
        d3.axisBottom().scale(y);
        x.domain(d3.extent(this.data, (d, i) => i));
        y.domain([0, d3.max(this.data, d => d)]);
        return {x, y}
      },
      calculatePath() {
        const scale = this.getScales();
        const path = d3.line()
          .x((d, i) => scale.x(i))
          .y((d => scale.y(d)));
        this.line = path(this.data);
      }
    },
  };
</script>

<style scoped>

</style>
