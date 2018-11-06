<template>
    <div class="component game-controls">
        <span class="control-group"><button @click="newGame">New Game</button> with
            <span class="control-group"><input type="text" id="newGameRowsInput" v-model="newGameRows"/>
                <label for="newGameRowsInput">rows</label></span>
        and <span class="control-group"><input type="text" id="newGameColumnsInput" v-model="newGameColumns">
                <label for="newGameColumnsInput">columns</label></span></span>
        <span><button>Start Game</button></span>
    </div>
</template>

<script>
  export default {
    name: "GameControls",
    data: function() {
      return {
        newGameRows: 12,
        newGameColumns: 12
      }
    },
    methods: {
      newGame() {
        this.$store.dispatch('stateMachine/requestNewGame', {rows: this.newGameRows, columns: this.newGameColumns})
      }
    }
  }
</script>

<style scoped>

</style>
