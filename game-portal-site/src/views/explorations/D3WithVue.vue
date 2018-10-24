<template>
  <div class="explorations d3 demos">
      <h1>Incorporating D3.js into Vue.js Components - Part I</h1>
      <PlainD3Demo></PlainD3Demo>
      <MoreVueesqueDemo></MoreVueesqueDemo>
      <FullOnVueStackedAreaChart :data="sampleData" :ceil="maxValue" @select="pointSelected"></FullOnVueStackedAreaChart>
      <p v-if="selectedValue !== undefined">User selected value {{selectedValue}}</p>
  </div>
</template>

<script>
// @ is an alias to /src
import PlainD3Demo from '../../components/explorations/d3/PlainD3Demo.vue'
import MoreVueesqueDemo from '../../components/explorations/d3/MoreVue-esqueDemo.vue'
import FullOnVueStackedAreaChart from '../../components/explorations/d3/FullOnVueStackedAreaChart.vue'

export default {
  name: 'explorations',
  components: {
    PlainD3Demo,
    MoreVueesqueDemo,
    FullOnVueStackedAreaChart
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
