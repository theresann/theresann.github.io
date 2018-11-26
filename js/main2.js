// animating the icons

$(document).ready(async () => {
  await new Promise(async resolve => {
    for (const el of $('.portions .gun-icon').slice(0, 8)) {
      $(el).addClass('covered')
      await new Promise(resolve => {
        setTimeout(resolve, 500)
      })
    }
    $('.portions p.actual-number').css('visibility', 'visible')
    resolve()
  })
  await new Promise(async resolve => {
    for (const el of $('.prevalent-guns .gun-icon').slice(0, 8).get().reverse()) {
      $(el).addClass('covered')
      await new Promise(resolve => {
        setTimeout(resolve, 500)
      })
    }
    $('.prevalent-guns .actual-number').css('visibility', 'visible')
    resolve()
  })
})

// // the bar graph of expenditure
// d3.csv('data/annual-gun-control-vs-gun-rights.csv', function(data) {
//   console.log(data)
//   // new GroupedBarViz('#chart-area', data)
// })
