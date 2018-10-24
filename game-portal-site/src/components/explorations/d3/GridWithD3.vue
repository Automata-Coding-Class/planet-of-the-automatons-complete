<template>
    <div>
        <h3>Drawing a Grid with D3.js from Vue.js Data</h3>
        <svg class="grid-demo" :width="width" :height="height">
            <g class="grid">
                <path class="grid-lines" :d="grid.lines"></path>
            </g>
        </svg>
    </div>
</template>

<script>
  import * as d3 from 'd3';

  function makeGridData(gridWidth, gridHeight, numberOfRows, numberOfColumns) {
    const data = [];

    const cellWidth = gridWidth / numberOfColumns;
    const cellHeight = gridHeight / numberOfRows;
    for (let row = 0; row <= numberOfRows; row++) {
      const y = (row /*+ 1*/) * cellHeight;
      data.push([{x: 0, y: y}, {x: gridWidth, y: y}]);
    }
    for (let column = 0; column <= numberOfRows; column++) {
      const x = (column) * cellWidth;
      data.push([{x: x, y: 0}, {x: x, y: gridHeight}]);
    }
    return data;
  }

  export default {
    name: "GridWithD3",
    data() {
      return {
        width: 0,
        height: 0,
        maxWidth: 960,
        grid: {
          lines: null
        },
        rows: undefined,
        scaled: {
          x: null,
          y: null
        }
      }
    },
    mounted() {
      window.addEventListener('resize', this.onResize);
      this.grid = d3.select('svg.grid-demo');
      this.onResize();
      console.log(`this.grid:`, this.grid);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    },
    methods: {
      initialize() {
        this.scaled.x = d3.scaleLinear().range([0, this.width]);
        this.scaled.y = d3.scaleLinear().range([this.height, 0]);
      },
      update() {
        const gridData = makeGridData(this.width, this.height, 10, 10);
        this.grid.lines = gridData.map(gridLinePoints => this.createLine(gridLinePoints));
      },
      onResize() {
        this.width = Math.min(this.$el.offsetWidth * .8, this.maxWidth);
        this.height = this.width;
      },
      createLine: d3.line().x(d => d.x).y(d => d.y),
    },
    watch: {
      width: function widthChanged() {
        this.initialize();
        this.update();
      }
    }
  }
</script>

<style scoped>

</style>
