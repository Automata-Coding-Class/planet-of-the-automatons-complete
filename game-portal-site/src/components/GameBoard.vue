<template>
    <div class="component game-board">
        <svg class="game-view" :width="width" :height="height">
            <g class="grid">
                <path class="grid-lines" :d="gridLines"></path>
            </g>
            <g id="layoutObjectsLayer" class="layout-objects">
                <path class="object" :d="layoutObjects"></path>
            </g>
            <g id="playerLayer" class="players"></g>
        </svg>
    </div>
</template>

<script>
  import * as d3 from 'd3';

  export default {
    name: "GameBoard",
    data() {
      return {
        width: 0,
        height: 0,
        maxWidth: 960,
        grid: undefined
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
      },
      layout: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    mounted() {
      window.addEventListener('resize', this.onResize);
      this.onResize();
      this.grid = d3.select('svg.game-view');
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
      layoutObjects: function () {
        if(this.grid === undefined || this.grid.select === undefined) {
          return;
        }
        const x = d3.scaleLinear().range([0, this.width]).domain([0, this.columns]);
        const y = d3.scaleLinear().range([0, this.height]).domain([0, this.rows]);
        // clean up previous state
        this.grid
          .select('#layoutObjectsLayer')
          .selectAll('g')
          .remove();
        // add new layout objects
        const layoutObjects = this.grid
          .select('#layoutObjectsLayer')
          .selectAll('.object')
          .data(this.layout)
          .enter().append('g');

        layoutObjects.filter((d,i) => {
          if(d) { d.column = i % this.columns; d.row = Math.floor(i / this.columns )}
          return d && d.type === 'obstacle' ? d : null;
        }).append('rect')
          .attr('x', d => x(d.column))
          .attr('y', d => y(d.row))
          .attr("width", d => x(1))
          .attr("height", d => y(1));
        layoutObjects.filter((d,i) => {
          if(d) { d.column = i % this.columns; d.row = Math.floor(i / this.columns )}
          return d && d.type === 'asset' ? d : null;
        }).append('circle')
          .attr('cx', d => x(d.column) + x(0.5))
          .attr('cy', d => y(d.row) + y(0.5))
          .attr("r", d => Math.min(x(0.25), y(0.25)))
          .attr("fill", 'gold');

        this.grid
          .select('#playerLayer')
          .selectAll('g')
          .remove();
        const playerObjects = this.grid
          .select('#playerLayer')
          .selectAll('path')
          .data(this.layout)
          .enter().append('g');

        playerObjects.filter((d,i) => {
          if(d) { d.column = i % this.columns; d.row = Math.floor(i / this.columns )}
          return d && d.type === 'player' ? d : null;
        }).append('rect')
          .attr('x', d => x(d.column))
          .attr('y', d => y(d.row))
          .attr("width", d => x(0.8))
          .attr("height", d => y(0.8))
          .attr("fill", "red");
      }
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
