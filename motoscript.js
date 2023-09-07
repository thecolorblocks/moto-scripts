var toggle = true
var hueRange = 360
var baseDelay = 1000
var computeFraction = function(hex){
  return (1 - parseInt(hex, 16) / parseInt('100', 16))
}
var deriveScript = function(blockhash, index){
  var hex = (index !== blockhash.length - 1) ? blockhash.slice(index, index + 2) : blockhash[index] + blockhash[0]
  var hue = computeFraction(hex) * hueRange
  var delay = computeFraction(hex) * baseDelay
  return {
    hex: hex,
    hue: hue,
    delay: delay
  }
}
var mutate = function(cell, hex, delay){
  popmotion.animate({
    from: 0,
    to: 1,
    duration: 1000,
    elapsed: -delay,
    onPlay: function(){
      cell.parentElement.style.opacity = 0
      cell.dataset.hex = hex
    },
    onUpdate: function(frame){
      cell.parentElement.style.opacity = frame
    },
  })
}
var clone = function(original){
  var copy = Object.create(original)
  return copy
}
var indices = Array.from({length: 64}, function(_, i){ return i++ })
var motoscripts = {
  $cell: true,
  $type: 'div',
  class: 'block',
  _blockhash: '',
  _fetch: async function(){
    let response = await window.fetch('/blockhash')
    this._blockhash = await response.text()
  },
  $init: function(e) {
    // Produce cells
    window.indices.forEach(function(i){
      this.$components.push({
        $type: 'div',
        class: 'item',
        $components: [{
          $type: 'span',
          class: 'glyph',
          _index: i,
          $init: function(){
            window.neuralNet.pull('blockhash', function(electron){
              var scriptMetadata = window.deriveScript(electron.detail.blockhash, this._index)
              if (scriptMetadata.hex !== this.dataset.hex) {
                window.mutate(this, scriptMetadata.hex, scriptMetadata.delay)
              }
            }.bind(this))
          }
        }]
      })
    }.bind(this))
    window.setInterval(this._fetch.bind(this), 2000)
  },
  $update: function(e){
    // Push message through neural net
    window.neuralNet.push('blockhash', {
      blockhash: this._blockhash
    })
  },
  $components: []
}