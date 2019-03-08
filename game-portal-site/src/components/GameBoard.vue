<template>
    <div class="component game-board">
        <span class="fnoot"></span>
        <svg class="game-view" :width="width" :height="height">
            <g class="grid">
                <path class="grid-lines" :d="gridLines"></path>
            </g>
            <g id="layoutObjectsLayer" class="layout-objects">
                <g class="object" :d="layoutObjects"></g>
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
      // this.grid.append('g')
      //   .append('svg:foreignObject')
      //   .attr('height', '15px')
      //   .attr('width', '15px')
      //   .html('<i class="fa fa-coffee"></i>');
      // this.grid
      //   .append('text')
      //   .attr('x', 150)
      //   .attr('y', 150)
      //   .attr('fill', 'red')
      //   .attr('font-family', d => 'FontAwesome')
      //   .attr('font-size', '96px')
      //   .text('\uf556');

    },
    beforeDestroy() {
      window.removeEventListener('resize', this.onResize);
    },
    computed: {
      playerAttributes: function() {
        return this.$store.state.stateMachine.playerAttributes;
      },
      gridLines: function () {
        const x = d3.scaleLinear().range([0, this.width]).domain([0, this.columns]);
        const y = d3.scaleLinear().range([0, this.height]).domain([0, this.rows]);
        const makeLine = d3.line().x(d => d.x).y(d => d.y);
        return Array.from({length: this.rows + 1}, (v, i) => i).map(i => [{
          x: 0,
          y: y(i)
        }, {x: this.width, y: y(i)}])
          .concat(Array.from({length: this.columns + 1}, (v, i) => i).map(i => [{
            x: x(i),
            y: 0
          }, {x: x(i), y: this.height}]))
          .map(gridLinePoints => makeLine(gridLinePoints));
      },
      layoutObjects: function () {
        if (this.grid === undefined || this.grid.select === undefined) {
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

        const obstacle = layoutObjects.filter((d, i) => {
          if (d) {
            d.column = i % this.columns;
            d.row = Math.floor(i / this.columns)
          }
          return d && d.type === 'obstacle' ? d : null;
        })
          .append('g')
          .attr('class', d => 'obstacle ' + d.id)
          .attr('transform', d => `translate(${x(d.column)}, ${y(d.row)})`);
        obstacle.append('rect')
          .attr("width", d => x(1))
          .attr("height", d => y(1));

        const asset = layoutObjects.filter((d, i) => {
          if (d) {
            d.column = i % this.columns;
            d.row = Math.floor(i / this.columns)
          }
          return d && (/(asset|scoring|powerup|hazard)/i).test(d.type) ? d : null;
        })
          .append('g')
          .attr('class', d => `asset ${d.type} ${d.key}`)
          .attr('transform', d => `translate(${x(d.column)}, ${y(d.row)})`);
        asset
          .append('circle')
          .attr('cx', d => /*x(d.column) +*/ x(0.5))
          .attr('cy', d => /*y(d.row) +*/ y(0.5))
          .attr("r", d => Math.min(x(0.4), y(0.4)))
          .attr("fill", 'grey');

        asset
          .append('svg:foreignObject')
          .attr('x', x(0.1))
          .attr('y', y(0.05))
          .attr('height', y(1))
          .attr('width', x(1))
          .attr('font-size', y(.625))
          .attr('text-align', 'left')
          // .attr('color', d => {
          //   let colorName = 'silver';
          //   if(this.playerAttributes[d.id] !== undefined) {
          //     colorName = this.playerAttributes[d.id].color;
          //   }
          //   return colorName;
          // })
          .html(d => {
            let iconName = '';
            switch(d.key) {
              case 'addTime' :
                iconName = 'stopwatch';
                break;
              case 'blaster' :
                iconName = 'fighter-jet';
                break;
              case 'bomb' :
                iconName = 'bomb';
                break;
              case 'diagonality' :
                iconName = 'expand-arrows-alt';
                break;
              case 'magnet' :
                iconName = 'magnet';
                break;
              case 'missedTurn' :
                iconName = 'poop';
                break;
              case 'multiPoint' :
                iconName = 'gem';
                break;
              case 'point' :
                iconName = 'dollar-sign';
                break;
              case 'poison' :
                iconName = 'skull-crossbones';
                break;
              default:
                iconName = 'toolbox';
                break;
            }
            // if(this.playerAttributes[d.id] !== undefined) {
            //   iconName = this.playerAttributes[d.id].iconName;
            // }
            return `<i class="fa fa-${iconName}"></i>`;
          });

          // asset
          //   .append('svg:foreignObject')
          //   .attr('color', 'rebeccapurple')
          //   .attr('font-size', y(.65))
          //   .attr('x', x(.1875))
          //   .attr('y', y(.075))
          //   .attr('height', y(1))
          //   .attr('width', x(1))
          //   .html('<i class="fa fa-asterisk"></i>')

        // asset
        //   .append('use')
        //   .attr('class', 'icon')
        //   .attr('href', '#assetDefault')
        //   .attr('x', x(.2))
        //   .attr('y', y(.2))
        //   .attr('width', x(1))
        //   .attr('height', y(1));
        // asset
        //   .append('use')
        //   .attr('class', 'icon')
        //   // note that svgs must be modified so that the top-level svg element has an id
        //   .attr('href', 'fontawesome/svgs/solid/asterisk.svg#root')
        //   .attr('x', x(.2))
        //   .attr('y', y(.2))
        //   .attr('width', y(.6))
        //   .attr('height', y(.6));

        this.grid
          .select('#playerLayer')
          .selectAll('g')
          .remove();
        const playerObjects = this.grid
          .select('#playerLayer')
          .selectAll('path')
          .data(this.layout)
          .enter().append('g').attr('class', 'player');

        const player = playerObjects.filter((d, i) => {
          if (d) {
            d.column = i % this.columns;
            d.row = Math.floor(i / this.columns)
          }
          return d && d.type === 'player' ? d : null;
        })
          .append('g')
          .attr('class', 'player')
          .attr('transform', d => `translate(${x(d.column)}, ${y(d.row)})`);
        player
          .append('rect')
          // .attr('x', d => x(d.column))
          // .attr('y', d => y(d.row))
          .attr("width", d => x(1))
          .attr("height", d => y(1))
        .attr("fill", "transparent");
          // .attr("fill", "gainsboro");
        player
          .append('svg:foreignObject')
          .attr('x', x(0.1))
          .attr('y', y(0.05))
          .attr('height', y(1))
          .attr('width', x(1))
          .attr('font-size', y(.625))
          .attr('text-align', 'left')
          .attr('color', d => {
            let colorName = 'silver';
            if(this.playerAttributes[d.id] !== undefined) {
              colorName = this.playerAttributes[d.id].color;
            }
            return colorName;
          })
          .html(d => {
            let iconName = 'user-circle';
            if(this.playerAttributes[d.id] !== undefined) {
              iconName = this.playerAttributes[d.id].iconName;
            }
            return `<i class="fa fa-${iconName}"></i>`;
          })
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
