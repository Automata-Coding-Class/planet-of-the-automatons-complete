<template>
    <div>
        <h3>Drawing a Grid with D3.js from Vue.js Data, But Better</h3>
        <p>Trying for no 'watches' or method calls, all just computed properties!!</p>
        <svg class="grid-demo" :width="width" :height="height">
            <g class="grid">
                <path class="grid-lines" :d="gridLines"></path>
            </g>
        </svg>
        <p>My inspiration: <a
                href="https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739">Let's Make a
            Grid with D3.js</a> (but it's kinda terrible. which is what inspired me)</p>
    </div>
</template>

<script>
  import * as d3 from 'd3';

  export default {
    name: "GridWithD3",
    data() {
      return {
        width: 0,
        height: 0,
        maxWidth: 960,
      }
    },
    props: {
      minimumWidth: {
        type: Number,
        default: 240
      },
      rows: {
        type: Number,
        default: 24
      },
      columns: {
        type: Number,
        default: 24
      }
    },
    mounted() {
      window.addEventListener('resize', this.onResize);
      this.grid = d3.select('svg.grid-demo');
      this.onResize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    },
    computed: {
      gridLines: function () {
        const x = d3.scaleLinear().range([0, this.width]).domain([0, this.columns]);
        const y = d3.scaleLinear().range([0, this.height]).domain([0, this.rows]);
        const makeLine = d3.line().x(d => d.x).y(d => d.y);
        return Array.from({length: this.rows+1}, (v, i) => i).map(i => [{x: 0, y: y(i)}, {x: this.width, y: y(i)}])
          .concat(Array.from({length: this.columns+1}, (v, i) => i).map(i => [{x: x(i), y: 0}, {x: x(i), y: this.height}]))
          .map(gridLinePoints => makeLine(gridLinePoints));
      },
    },
    methods: {
      onResize() {
        this.width = Math.max(Math.min(this.$el.offsetWidth * .8, this.maxWidth), this.minimumWidth);
        this.height = this.width;
      },
    },
  }
</script>

<style scoped>

</style>
