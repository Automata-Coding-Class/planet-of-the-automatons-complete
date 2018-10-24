<template>
  <div class="explorations d3 demos">
      <h1>Incorporating D3.js into Vue.js Components - Part II</h1>
      <GridWithD3></GridWithD3>
  </div>
</template>

<script>
// @ is an alias to /src
import GridWithD3 from '../../components/explorations/d3/GridWithD3.vue'

export default {
  name: 'explorations',
  components: {
    GridWithD3
  },
  data() {
    return {
      numberOfValues: 8,
      sampleData: [],
      maxValue: 200,
      selectedValue: undefined
    }
  },
  mounted() {
    this.sampleData = this.generateRandomDataSet(this.numberOfValues);
    setInterval(() => { this.sampleData =  this.generateRandomDataSet(this.numberOfValues)}, 5000);
  },
  methods: {
    generateRandomDataSet(numberOfEntries) {
      const newValues = [];
      for (let i = 0; i < numberOfEntries; i++) {
        newValues.push(Math.floor(Math.random() * this.maxValue));
      }
      return newValues;
    },
    pointSelected(data) {
        this.selectedValue = data;
    }
  }
}
</script>
