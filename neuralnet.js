var neuralNet = {
  net: new Comment('neural-net'),
  push: function(channel, data){
    this.net.dispatchEvent(
      new CustomEvent(channel, {detail: data})
    )
  },
  pull: function(channel, compute){
    this.net.addEventListener(channel, compute)
  }
}